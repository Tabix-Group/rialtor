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

    // Validar que email sea válido
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      return res.status(200).json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
      });
    }

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

    // Enviar email
    await emailService.sendPasswordResetEmail(email, token);

    return res.status(200).json({
      message:
        'Instrucciones para restablecer tu contraseña han sido enviadas a tu email.',
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
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
