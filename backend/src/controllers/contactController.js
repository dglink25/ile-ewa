const knex = require('../db/knex');
const { sendMail } = require('../utils/mailer');

async function submit(req, res) {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const setting = await knex('settings').where({ key: 'contact_email' }).first();
    const to = setting?.value || process.env.CONTACT_EMAIL || process.env.MAIL_FROM;

    await sendMail({
      to,
      subject: `Nouveau message de contact — ${name}`,
      html: `
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${String(message).replace(/\n/g, '<br/>')}</p>
      `,
    });

    // Accusé de réception à la personne qui a écrit
    sendMail({
      to: email,
      subject: 'Nous avons bien reçu votre message — Ilé Ẹwà',
      html: `<p>Bonjour ${name},</p><p>Merci pour votre message, nous revenons vers vous rapidement.</p>`,
    }).catch((e) => console.error("Erreur envoi accusé de réception :", e.message));

    res.json({ message: 'Votre message a bien été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
}

module.exports = { submit };
