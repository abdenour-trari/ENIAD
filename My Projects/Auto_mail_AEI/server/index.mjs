import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Route Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur AutoMail AEI opérationnel' });
});

// Test de connexion SMTP
app.post('/api/test-smtp', async (req, res) => {
  const { smtp } = req.body;

  if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
    return res.status(400).json({
      success: false,
      message: 'Paramètres SMTP incomplets (Hôte, Utilisateur ou Mot de passe manquant)'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 465,
      secure: Boolean(smtp.secure),
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    res.json({
      success: true,
      message: 'Connexion au serveur SMTP réussie ! Vos identifiants sont valides.'
    });
  } catch (error) {
    console.error('Erreur test SMTP:', error);
    res.status(500).json({
      success: false,
      message: `Échec de connexion SMTP: ${error.message}`
    });
  }
});

// Envoi effectif de mail
app.post('/api/send-email', async (req, res) => {
  const { to, subject, body, smtp } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: 'Champs obligatoires manquants (Destinataire, Objet ou Corps)'
    });
  }

  if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
    return res.status(400).json({
      success: false,
      message: 'Configuration SMTP non paramétrée. Veuillez configurer le serveur SMTP dans les paramètres.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 465,
      secure: Boolean(smtp.secure),
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${smtp.fromName || 'Association AEI'}" <${smtp.fromEmail || smtp.user}>`,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br/>')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Mail envoyé à ${to}:`, info.messageId);

    res.json({
      success: true,
      message: 'Email envoyé avec succès !',
      messageId: info.messageId
    });
  } catch (error) {
    console.error(`Erreur d'envoi d'email à ${to}:`, error);
    res.status(500).json({
      success: false,
      message: `Échec d'envoi: ${error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend AutoMail AEI démarré sur http://localhost:${PORT}`);
});
