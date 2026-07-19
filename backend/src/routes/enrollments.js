const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentsController');
const { requireAuth, requireRole } = require('../middleware/auth');

// ── Utilisateur connecté ─────────────────────────────
// Vérifier son inscription à un article
router.get('/check/:articleId', requireAuth, ctrl.checkEnrollment);

// S'inscrire gratuitement
router.post('/free/:articleId', requireAuth, ctrl.enrollFree);

// Initier un paiement FedaPay
router.post('/pay/:articleId', requireAuth, ctrl.initPayment);

// Confirmer un paiement après retour (polling)
router.get('/confirm/:transactionId', requireAuth, ctrl.confirmPayment);

// Mes formations
router.get('/mine', requireAuth, ctrl.myEnrollments);

// ── Admin ───────────────────────────────────────────
router.get('/', requireAuth, requireRole('admin'), ctrl.listAll);

// ── Webhook FedaPay (sans auth, signature vérifiée) ──
router.post('/webhook/fedapay', ctrl.fedapayWebhook);

module.exports = router;
