const knex = require('../db/knex');
const FedaPay = require('fedapay');

/* ── Initialisation FedaPay au chargement du module ── */
FedaPay.FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || '');
FedaPay.FedaPay.setEnvironment(
  process.env.FEDAPAY_ENV === 'production' ? 'production' : 'sandbox',
);

console.log('[FedaPay] env:', process.env.FEDAPAY_ENV, '| key prefix:', (process.env.FEDAPAY_SECRET_KEY || '').slice(0, 12));

/* ── Vérifier si l'utilisateur est déjà inscrit ── */
async function checkEnrollment(req, res) {
  const { articleId } = req.params;
  const enrollment = await knex('enrollments')
    .where({ user_id: req.user.id, article_id: articleId })
    .whereIn('status', ['paid', 'free'])
    .first();
  res.json({ enrolled: !!enrollment, enrollment: enrollment || null });
}

/* ── Inscription gratuite ── */
async function enrollFree(req, res) {
  const { articleId } = req.params;
  const { answers } = req.body;

  // Vérifier que l'article existe et est gratuit
  const article = await knex('articles')
    .where({ id: articleId, status: 'published' })
    .first();
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (!article.is_free) return res.status(400).json({ error: 'Cet article n\'est pas gratuit.' });

  // Vérifier inscription existante
  const existing = await knex('enrollments')
    .where({ user_id: req.user.id, article_id: articleId })
    .first();
  if (existing) {
    if (['paid', 'free'].includes(existing.status)) {
      return res.json({ message: 'Déjà inscrit.', enrollment: existing });
    }
    // Met à jour si en attente
    await knex('enrollments').where({ id: existing.id }).update({
      status: 'free',
      answers: answers ? JSON.stringify(answers) : null,
      paid_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
    const updated = await knex('enrollments').where({ id: existing.id }).first();
    return res.json({ message: 'Inscription confirmée.', enrollment: updated });
  }

  const [id] = await knex('enrollments').insert({
    user_id: req.user.id,
    article_id: articleId,
    status: 'free',
    answers: answers ? JSON.stringify(answers) : null,
    paid_at: knex.fn.now(),
  });

  const enrollment = await knex('enrollments').where({ id }).first();
  res.status(201).json({ message: 'Inscription confirmée.', enrollment });
}

/* ── Initier un paiement FedaPay ── */
async function initPayment(req, res) {
  const { articleId } = req.params;
  const { answers, phone, phone_key } = req.body;

  const article = await knex('articles')
    .where({ id: articleId, status: 'published' })
    .first();
  if (!article) return res.status(404).json({ error: 'Article introuvable.' });
  if (article.is_free) return res.status(400).json({ error: 'Cet article est gratuit.' });

  // Montant : promotionnel si applicable
  let amount = Number(article.price) || 0;
  if (article.has_promo && article.promo_price) {
    const now = new Date();
    const ps = article.promo_start ? new Date(article.promo_start) : null;
    const pe = article.promo_end ? new Date(article.promo_end) : null;
    if ((!ps || now >= ps) && (!pe || now <= pe)) {
      amount = Number(article.promo_price);
    }
  }
  if (amount <= 0) return res.status(400).json({ error: 'Montant invalide.' });

  // Récupérer infos utilisateur
  const user = await knex('users').where({ id: req.user.id }).first();
  const profile = await knex('profiles').where({ user_id: req.user.id }).first();

  try {
    // URL de retour après paiement — prendre la première origine de la liste
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    // Récupérer la page d'origine pour la redirection après paiement
    const fromPath = req.body.from_path || '/blog';

    const transaction = await FedaPay.Transaction.create({
      description: `Inscription : ${article.title}`,
      amount,
      currency: { iso: 'XOF' },
      callback_url: `${clientUrl}/paiement/confirmation?from=${encodeURIComponent(fromPath)}`,
      customer: {
        firstname: profile?.display_name?.split(' ')[0] || 'Membre',
        lastname: profile?.display_name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone_number: phone
          ? { number: phone, country: phone_key || 'BJ' }
          : undefined,
      },
    });

    const token = await transaction.generateToken();

    // Enregistrer l'inscription en statut 'pending'
    const existing = await knex('enrollments')
      .where({ user_id: req.user.id, article_id: articleId })
      .first();

    if (existing) {
      await knex('enrollments').where({ id: existing.id }).update({
        status: 'pending',
        answers: answers ? JSON.stringify(answers) : existing.answers,
        fedapay_transaction_id: String(transaction.id),
        amount_paid: amount,
        updated_at: knex.fn.now(),
      });
    } else {
      await knex('enrollments').insert({
        user_id: req.user.id,
        article_id: articleId,
        status: 'pending',
        answers: answers ? JSON.stringify(answers) : null,
        fedapay_transaction_id: String(transaction.id),
        amount_paid: amount,
      });
    }

    res.json({
      payment_url: token.url,
      transaction_id: transaction.id,
      amount,
    });
  } catch (err) {
    console.error('FedaPay error:', err);
    res.status(502).json({ error: 'Erreur lors de l\'initialisation du paiement.' });
  }
}

/* ── Webhook FedaPay (confirmation de paiement) ── */
async function fedapayWebhook(req, res) {
  try {
    const { entity, event } = req.body;
    if (event !== 'transaction.approved') return res.sendStatus(200);

    const transactionId = String(entity?.id || '');
    if (!transactionId) return res.sendStatus(400);

    await knex('enrollments')
      .where({ fedapay_transaction_id: transactionId })
      .update({ status: 'paid', paid_at: knex.fn.now(), updated_at: knex.fn.now() });

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
}

/* ── Confirmation de retour paiement (polling côté client) ── */
async function confirmPayment(req, res) {
  const { transactionId } = req.params;

  try {
    const transaction = await FedaPay.Transaction.retrieve(transactionId);
    const approved = transaction.status === 'approved';

    if (approved) {
      await knex('enrollments')
        .where({ fedapay_transaction_id: String(transactionId), user_id: req.user.id })
        .update({ status: 'paid', paid_at: knex.fn.now(), updated_at: knex.fn.now() });
    }

    const enrollment = await knex('enrollments')
      .where({ fedapay_transaction_id: String(transactionId), user_id: req.user.id })
      .first();

    res.json({ status: transaction.status, enrolled: approved, enrollment });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(502).json({ error: 'Impossible de vérifier le paiement.' });
  }
}

/* ── Mes formations (liste des inscriptions de l'utilisateur connecté) ── */
async function myEnrollments(req, res) {
  const enrollments = await knex('enrollments')
    .join('articles', 'articles.id', 'enrollments.article_id')
    .leftJoin('categories', 'categories.id', 'articles.category_id')
    .where('enrollments.user_id', req.user.id)
    .whereIn('enrollments.status', ['paid', 'free'])
    .select(
      'enrollments.id',
      'enrollments.status',
      'enrollments.paid_at',
      'enrollments.amount_paid',
      'enrollments.answers',
      'articles.id as article_id',
      'articles.title',
      'articles.slug',
      'articles.cover_image_url',
      'articles.start_date',
      'articles.end_date',
      'articles.is_free',
      'articles.supports',
      'categories.name as category_name',
    )
    .orderBy('enrollments.created_at', 'desc');

  // Désérialiser supports
  const result = enrollments.map((e) => ({
    ...e,
    supports: (() => {
      try { return JSON.parse(e.supports || '[]'); } catch { return []; }
    })(),
    answers: (() => {
      try { return JSON.parse(e.answers || '[]'); } catch { return []; }
    })(),
  }));

  res.json({ enrollments: result });
}

/* ── Admin : liste toutes les inscriptions ── */
async function listAll(req, res) {
  const enrollments = await knex('enrollments')
    .join('articles', 'articles.id', 'enrollments.article_id')
    .join('users', 'users.id', 'enrollments.user_id')
    .leftJoin('profiles', 'profiles.user_id', 'enrollments.user_id')
    .select(
      'enrollments.*',
      'articles.title as article_title',
      'articles.slug as article_slug',
      'users.email',
      'profiles.display_name',
    )
    .orderBy('enrollments.created_at', 'desc');
  res.json({ enrollments });
}

module.exports = {
  checkEnrollment,
  enrollFree,
  initPayment,
  fedapayWebhook,
  confirmPayment,
  myEnrollments,
  listAll,
};
