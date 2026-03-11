const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

// Configurar transporter con credenciales Office 365
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true para puerto 465, false para 587
  auth: {
    user: process.env.SMTP_USER || 'info@rialtor.app',
    pass: process.env.SMTP_PASS,
  },
});

// Ruta base de templates
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

/**
 * Renderizar template EJS con datos
 */
async function renderTemplate(templateName, data) {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, {
      ...data,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    });
    return html;
  } catch (error) {
    console.error(`Error rendering template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Enviar email genérico
 */
async function sendEmail(to, subject, templateName, data = {}) {
  try {
    const html = await renderTemplate(templateName, data);

    const mailOptions = {
      from: process.env.SMTP_FROM || 'info@rialtor.app',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado a ${to} (${templateName}):`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error enviando email a ${to}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Email de bienvenida (registro)
 */
async function sendRegistrationEmail(email, userName) {
  return sendEmail(
    email,
    '¡Bienvenido a Rialtor!',
    'registration',
    { userName, email }
  );
}

/**
 * Email de recuperación de contraseña
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  return sendEmail(
    email,
    'Restablecer tu contraseña - Rialtor',
    'passwordReset',
    { email, resetUrl, resetToken }
  );
}

/**
 * Email de activación de cuenta (post-pago)
 */
async function sendAccountActivationEmail(email, userName) {
  return sendEmail(
    email,
    'Tu cuenta Rialtor está activa',
    'accountActivation',
    { userName, email }
  );
}

/**
 * Notificación de nuevo mensaje en chat
 */
async function sendChatNotificationEmail(email, userName, chatSessionId, messagePreview) {
  const chatUrl = `${process.env.FRONTEND_URL}/chat/${chatSessionId}`;
  return sendEmail(
    email,
    'Nuevo mensaje en tu chat - Rialtor',
    'chatNotification',
    { userName, chatUrl, messagePreview }
  );
}

/**
 * Notificación de prospecto (asignación, cambio de estado)
 */
async function sendProspectNotificationEmail(email, userName, prospectName, action) {
  const prospectUrl = `${process.env.FRONTEND_URL}/prospects`;
  return sendEmail(
    email,
    `Prospecto: ${action} - ${prospectName}`,
    'prospectNotification',
    { userName, prospectName, action, prospectUrl }
  );
}

/**
 * Notificación de documento generado
 */
async function sendDocumentNotificationEmail(email, userName, documentName) {
  const documentsUrl = `${process.env.FRONTEND_URL}/documents`;
  return sendEmail(
    email,
    `Tu documento está listo - ${documentName}`,
    'documentNotification',
    { userName, documentName, documentsUrl }
  );
}

/**
 * Test: verificar conexión SMTP
 */
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}

module.exports = {
  sendEmail,
  sendRegistrationEmail,
  sendPasswordResetEmail,
  sendAccountActivationEmail,
  sendChatNotificationEmail,
  sendProspectNotificationEmail,
  sendDocumentNotificationEmail,
  verifyConnection,
};
