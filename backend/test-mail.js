require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? `[défini, ${process.env.SMTP_PASS.length} chars]` : 'VIDE');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✓ Connexion SMTP OK');

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: 'dondiegue21@gmail.com',
      subject: 'Test email — Ilé Ẹwà',
      html: `
        <h2>Test d'envoi d'email</h2>
        <p>Si vous recevez ce message, la configuration SMTP fonctionne correctement.</p>
        <p>Envoyé depuis : ${process.env.SMTP_USER}</p>
      `,
    });

    console.log('✓ Email envoyé ! MessageId:', info.messageId);
  } catch (err) {
    console.error('✗ Erreur:', err.message);
    if (err.code) console.error('  Code:', err.code);
    if (err.response) console.error('  Réponse SMTP:', err.response);
  }
}

test();
