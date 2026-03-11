const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * POST /auth/forgot-password
 * Solicitar recuperación de contraseña
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    console.log(`[PASSWORD_RESET] Forgot password request for email: ${email}`);

    // Validar que email sea válido
    if (!email || !email.includes('@')) {
      console.log(`[PASSWORD_RESET] Invalid email format: ${email}`);
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      console.log(`[PASSWORD_RESET] User not found: ${email}`);
      return res.status(200).json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
      });
    }

    console.log(`[PASSWORD_RESET] User found: ${email}, generating reset token`);

    // Generar token único (válido 1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en BD
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    console.log(`[PASSWORD_RESET] Reset token created and saved to DB`);
    console.log(`[PASSWORD_RESET] Token expires at: ${expiresAt}`);

    // Enviar email
    console.log(`[PASSWORD_RESET] Attempting to send reset email...`);
    const emailResult = await emailService.sendPasswordResetEmail(email, token);
    
    console.log(`[PASSWORD_RESET] Email send result:`, emailResult);

    if (!emailResult.success) {
      console.error(`[PASSWORD_RESET] Email failed to send:`, emailResult.error);
      // Still return 200 to avoid revealing if email failed
      return res.status(200).json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
      });
    }

    console.log(`[PASSWORD_RESET] Password reset email sent successfully`);

    return res.status(200).json({
      message:
        'Instrucciones para restablecer tu contraseña han sido enviadas a tu email.',
    });
  } catch (error) {
    console.error('[PASSWORD_RESET] Error in forgotPassword:', error);
    return res.status(500).json({ error: 'Error procesando solicitud' });
  }
}

/**
 * POST /auth/reset-password
 * Restablecer contraseña con token
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    // Validar inputs
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y contraseña requeridos' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres',
      });
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    // Verificar que no haya expirado
    if (new Date() > resetToken.expiresAt) {
      // Eliminar token expirado
      await prisma.passwordResetToken.delete({ where: { token } });
      return res.status(400).json({ error: 'El token ha expirado. Solicita uno nuevo.' });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Eliminar token (de un solo uso)
    await prisma.passwordResetToken.delete({ where: { token } });

    return res.status(200).json({
      message: 'Contraseña actualizada correctamente. Por favor, inicia sesión.',
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ error: 'Error restableciendo contraseña' });
  }
}

/**
 * GET /auth/verify-reset-token/:token
 * Verificar que un token sea válido (antes de mostrar formulario)
 */
async function verifyResetToken(req, res) {
  try {
    const { token } = req.params;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || new Date() > resetToken.expiresAt) {
      return res.status(400).json({ valid: false, error: 'Token inválido o expirado' });
    }

    return res.status(200).json({ valid: true, email: resetToken.email });
  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    return res.status(500).json({ valid: false, error: 'Error verificando token' });
  }
}

module.exports = {
  forgotPassword,
  resetPassword,
  verifyResetToken,
};
