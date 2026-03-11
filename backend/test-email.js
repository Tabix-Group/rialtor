#!/usr/bin/env node

/**
 * Test email service connectivity and send a test email
 * Usage: node test-email.js <recipient-email>
 */

require('dotenv').config();
const emailService = require('./src/services/emailService');
const nodemailer = require('nodemailer');

async function testEmail() {
  const recipientEmail = process.argv[2] || 'test@example.com';

  console.log('═══════════════════════════════════════════════════════════');
  console.log('RIALTOR EMAIL SERVICE TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`  SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`  SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`  SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`  SMTP_PASS: ${process.env.SMTP_PASS ? '✓ (set)' : '✗ (missing)'}`);
  console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log('');

  // Create transporter
  console.log('🔧 Creating SMTP transporter...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER || 'info@rialtor.app',
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection
  console.log('🔗 Verifying SMTP connection...');
  try {
    const verified = await transporter.verify();
    if (verified) {
      console.log('✅ SMTP connection successful!\n');
    } else {
      console.log('❌ SMTP connection verification failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ SMTP connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }

  // Send test email
  console.log(`📧 Sending test password reset email to: ${recipientEmail}`);
  const testToken = 'test-token-' + Date.now();

  const emailResult = await emailService.sendPasswordResetEmail(recipientEmail, testToken);

  console.log('\n✉️  Email Send Result:');
  console.log(`  Success: ${emailResult.success}`);
  if (emailResult.messageId) {
    console.log(`  Message ID: ${emailResult.messageId}`);
  }
  if (emailResult.error) {
    console.log(`  Error: ${emailResult.error}`);
  }

  if (emailResult.success) {
    console.log('\n✅ TEST PASSED - Email sent successfully!');
    console.log(`Check ${recipientEmail} for the reset email.\n`);
  } else {
    console.log('\n❌ TEST FAILED - Email could not be sent.\n');
    process.exit(1);
  }

  process.exit(0);
}

testEmail().catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});
