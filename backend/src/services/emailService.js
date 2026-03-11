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
  logger: true, // Enable logger
  debug: true, // Enable debug
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('✓ SMTP server is ready to take messages');
  }
});

// Ruta base de templates
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

/**
 * Renderizar template EJS con datos
 */
async function renderTemplate(templateName, data) {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
    console.log(`[EMAIL] Rendering template: ${templatePath}`);
    console.log(`[EMAIL] Data keys available:`, Object.keys(data).join(', '));
    console.log(`[EMAIL] templateStyles available:`, data.templateStyles ? 'YES' : 'NO');
    
    const html = await ejs.renderFile(templatePath, {
      ...data,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    });
    console.log(`[EMAIL] Template rendered successfully`);
    return html;
  } catch (error) {
    console.error(`[EMAIL] Error rendering template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Enviar email genérico
 */
async function sendEmail(to, subject, templateName, data = {}) {
  try {
    console.log(`[EMAIL] Starting to send email to ${to} with template: ${templateName}`);
    console.log(`[EMAIL] SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}, User: ${process.env.SMTP_USER}`);
    
    const html = await renderTemplate(templateName, data);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'info@rialtor.app',
      to,
      subject,
      html,
    };

    console.log(`[EMAIL] Mail options prepared:`, {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: mailOptions.html.length,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✓ Email sent successfully to ${to}`);
    console.log(`[EMAIL] Message ID: ${info.messageId}`);
    console.log(`[EMAIL] Response:`, info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL] ✗ Error sending email to ${to}:`, error);
    console.error(`[EMAIL] Error message:`, error.message);
    console.error(`[EMAIL] Error code:`, error.code);
    console.error(`[EMAIL] Full error:`, JSON.stringify(error, null, 2));
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
 * Email de newsletter
 */
async function sendNewsletterEmail(email, newsletterData) {
  try {
    console.log(`[NEWSLETTER] Preparing newsletter email for ${email}`);
    console.log(`[NEWSLETTER] templateStyles provided:`, newsletterData.templateStyles ? 'YES' : 'NO');
    
    // Extraer fecha actual formateada
    const publishDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Construir datos para el template
    const templateData = {
      title: newsletterData.title,
      contentHtml: newsletterData.content || '<p>Sin contenido</p>',
      publishDate,
      news: newsletterData.news || [],
      properties: newsletterData.properties || [],
      agentInfo: newsletterData.agentInfo || null,
      templateStyles: newsletterData.templateStyles || {}, // Template styling config
      unsubscribeLink: `${process.env.FRONTEND_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
    };

    console.log(`[NEWSLETTER] Template data prepared with ${templateData.news.length} news items and ${templateData.properties.length} properties`);
    console.log(`[NEWSLETTER] Template styles in data:`, templateData.templateStyles ? 'YES' : 'NO');

    return sendEmail(
      email,
      `${newsletterData.title} - Newsletter Rialtor`,
      'newsletter',
      templateData
    );
  } catch (error) {
    console.error(`[NEWSLETTER] Error preparing newsletter email for ${email}:`, error);
    return { success: false, error: error.message };
  }
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
  sendNewsletterEmail,
  verifyConnection,
};
