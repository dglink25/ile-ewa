const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  } else {
    // Aucun SMTP configuré (ex: en développement) : on simule l'envoi
    // en affichant le contenu dans la console au lieu de planter.
    transporter = {
      sendMail: async (opts) => {
        console.log('--- [Email simulé — aucun SMTP configuré dans .env] ---');
        console.log('À      :', opts.to);
        console.log('Sujet  :', opts.subject);
        console.log('Contenu:', opts.text || opts.html);
        console.log('--------------------------------------------------------');
        return { simulated: true };
      },
    };
  }

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || 'Ilé Ẹwà <no-reply@ile-ewa.com>';
  return t.sendMail({ from, to, subject, html, text });
}

module.exports = { sendMail };
