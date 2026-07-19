const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const slugify = require('slugify');
const knex = require('../db/knex');
const { signAccessToken, signRefreshToken } = require('../utils/tokens');
const { sendMail } = require('../utils/mailer');

function verificationLink(token) {
  return `${process.env.CLIENT_URL || 'http://localhost:5173'}/verifier-email?token=${token}`;
}

// Inscription publique -> crée un compte "member" EN ATTENTE de vérification email.
// Le compte reste inactif tant que le lien reçu par email n'a pas été cliqué.
async function register(req, res) {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password || !display_name) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const already = await knex('users').where({ email }).first();
    if (already) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const memberRole = await knex('roles').where({ name: 'member' }).first();
    const password_hash = await bcrypt.hash(password, 10);
    const verification_token = crypto.randomBytes(32).toString('hex');

    const [userId] = await knex('users').insert({
      email,
      password_hash,
      role_id: memberRole.id,
      status: 'pending', // devient "active" seulement après clic sur le lien de vérification
      verification_token,
    });

    let baseSlug = slugify(display_name, { lower: true, strict: true });
    let slug = baseSlug;
    let i = 1;
    while (await knex('profiles').where({ slug }).first()) {
      slug = `${baseSlug}-${i++}`;
    }

    await knex('profiles').insert({
      user_id: userId,
      display_name,
      slug,
      is_published: false,
    });

    sendMail({
      to: email,
      subject: 'Confirmez votre adresse email — Ilé Ẹwà',
      html: `
        <p>Bonjour ${display_name},</p>
        <p>Merci de votre inscription au cercle Ilé Ẹwà !</p>
        <p>Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur ce lien :</p>
        <p><a href="${verificationLink(verification_token)}">${verificationLink(verification_token)}</a></p>
        <p>Sans cette confirmation, vous ne pourrez pas vous connecter.</p>
      `,
    }).catch((e) => console.error("Erreur lors de l'envoi de l'email de vérification :", e.message));

    // Pas de connexion automatique : le compte n'est pas encore actif.
    res.status(201).json({
      message: "Compte créé. Un email de confirmation vient de vous être envoyé : cliquez sur le lien qu'il contient pour activer votre compte.",
      email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await knex('users')
      .join('roles', 'roles.id', 'users.role_id')
      .where('users.email', email)
      .select('users.*', 'roles.name as role_name')
      .first();

    if (!user) return res.status(401).json({ error: 'Identifiants invalides.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Identifiants invalides.' });

    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Merci de vérifier votre adresse email avant de vous connecter.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Ce compte est suspendu.' });
    }

    await knex('users').where({ id: user.id }).update({ last_login_at: knex.fn.now() });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role_name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
}

// Activation du compte via le lien reçu par email
async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Requête invalide.' });

    const user = await knex('users').where({ verification_token: token }).first();
    if (!user) {
      return res.status(400).json({ error: 'Lien de vérification invalide ou déjà utilisé.' });
    }

    await knex('users').where({ id: user.id }).update({
      status: 'active',
      email_verified_at: knex.fn.now(),
      verification_token: null,
      updated_at: knex.fn.now(),
    });

    res.json({ message: 'Adresse email confirmée avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// Renvoyer l'email de confirmation si le premier n'a pas été reçu
async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis.' });

    const user = await knex('users').where({ email }).first();

    if (user && user.status === 'pending') {
      const verification_token = crypto.randomBytes(32).toString('hex');
      await knex('users').where({ id: user.id }).update({ verification_token });

      sendMail({
        to: email,
        subject: 'Confirmez votre adresse email — Ilé Ẹwà',
        html: `
          <p>Bonjour,</p>
          <p>Voici un nouveau lien pour confirmer votre adresse email :</p>
          <p><a href="${verificationLink(verification_token)}">${verificationLink(verification_token)}</a></p>
        `,
      }).catch((e) => console.error("Erreur lors du renvoi de l'email de vérification :", e.message));
    }

    // Réponse identique dans tous les cas (sécurité / anti-énumération)
    res.json({ message: "Si ce compte existe et n'est pas encore vérifié, un nouvel email vient d'être envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Token manquant.' });

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await knex('users')
      .join('roles', 'roles.id', 'users.role_id')
      .where('users.id', payload.id)
      .select('users.*', 'roles.name as role_name')
      .first();

    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Refresh token invalide ou expiré.' });
  }
}

async function me(req, res) {
  const user = await knex('users')
    .join('roles', 'roles.id', 'users.role_id')
    .leftJoin('profiles', 'profiles.user_id', 'users.id')
    .where('users.id', req.user.id)
    .select('users.id', 'users.email', 'roles.name as role', 'profiles.display_name', 'profiles.slug', 'profiles.avatar_url')
    .first();
  res.json({ user });
}

async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await knex('users').where({ id: req.user.id }).first();
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

    const password_hash = await bcrypt.hash(new_password, 10);
    await knex('users').where({ id: user.id }).update({ password_hash, updated_at: knex.fn.now() });

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis.' });

    const user = await knex('users').where({ email }).first();

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await knex('users').where({ id: user.id }).update({
        reset_token: token,
        reset_token_expires_at: expires,
      });

      const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reinitialiser-mot-de-passe?token=${token}`;

      sendMail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe — Ilé Ẹwà',
        html: `
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :</p>
          <p><a href="${link}">${link}</a></p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        `,
      }).catch((e) => console.error("Erreur lors de l'envoi de l'email de réinitialisation :", e.message));
    }

    res.json({ message: "Si cet email correspond à un compte, un lien de réinitialisation a été envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Requête invalide.' });
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await knex('users').where({ reset_token: token }).first();
    if (!user || !user.reset_token_expires_at || new Date(user.reset_token_expires_at) < new Date()) {
      return res.status(400).json({ error: 'Lien invalide ou expiré. Merci de refaire une demande.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await knex('users').where({ id: user.id }).update({
      password_hash,
      reset_token: null,
      reset_token_expires_at: null,
      updated_at: knex.fn.now(),
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

module.exports = {
  register, login, refresh, me, changePassword,
  forgotPassword, resetPassword, verifyEmail, resendVerification,
};
