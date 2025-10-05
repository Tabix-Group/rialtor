#!/usr/bin/env node

const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

async function checkDatabaseConnection() {
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log('✅ Database connection successful');
        await prisma.$disconnect();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        await prisma.$disconnect();
        return false;
    }
}

async function runCommand(command, args, description) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 ${description}...`);
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${description} completed successfully`);
                resolve();
            } else {
                console.error(`❌ ${description} failed with code ${code}`);
                reject(new Error(`${description} failed`));
            }
        });
    });
}

async function setupDatabase() {
    console.log('🔄 Setting up database in background...');
    
    try {
        const dbConnected = await checkDatabaseConnection();

        if (dbConnected) {
            try {
                await runCommand('npx', ['prisma', 'migrate', 'deploy', '--schema=./prisma/schema.prisma'], 'Running database migrations');
                
                try {
                    await runCommand('npm', ['run', 'db:seed'], 'Seeding database');
                    console.log('✅ Database setup completed');
                } catch (error) {
                    console.warn('⚠️ Database seeding failed, continuing...');
                }
            } catch (error) {
                console.warn('⚠️ Database migrations failed, continuing...');
            }
        } else {
            console.warn('⚠️ Database not available, server will retry connections...');
        }
    } catch (error) {
        console.error('❌ Database setup error:', error.message);
    }
}

async function start() {
    console.log('🚀 Starting Rialtor Backend...');
    
    // Run database setup in background without blocking server startup
    setupDatabase().catch(err => {
        console.error('Background database setup failed:', err);
    });

    // Start the Express server immediately
    console.log('🌟 Starting Express server...');
    require('../src/server.js');
}

// Start the application
start().catch(error => {
    console.error('💥 Failed to start application:', error);
    process.exit(1);
});
