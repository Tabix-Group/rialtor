#!/usr/bin/env node

/**
 * Configuration checker script
 * Verifies that all required environment variables are set before starting the server
 */

require('dotenv').config();

console.log('🔍 Checking configuration...\n');

const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

const optionalVars = [
    'PORT',
    'NODE_ENV',
    'FRONTEND_URL',
    'FRONTEND_URLS',
    'RATE_LIMIT_WINDOW',
    'RATE_LIMIT_MAX'
];

let allRequired = true;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
    const isSet = !!process.env[varName];
    console.log(`${isSet ? '✅' : '❌'} ${varName}: ${isSet ? 'Set' : 'Missing'}`);
    if (!isSet) allRequired = false;
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
    const isSet = !!process.env[varName];
    const value = isSet ? (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('URL') ? '[HIDDEN]' : process.env[varName]) : 'Not set';
    console.log(`${isSet ? '✅' : '⚠️'} ${varName}: ${value}`);
});

console.log('\n' + '='.repeat(50));

if (allRequired) {
    console.log('✅ All required configuration variables are set!');
    console.log('🚀 Starting server...\n');
    require('../src/server.js');
} else {
    console.log('❌ Missing required configuration variables!');
    console.log('Please check your .env file and ensure all required variables are set.');
    console.log('See .env.example for the complete list of required variables.\n');
    process.exit(1);
}
