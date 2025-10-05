#!/usr/bin/env node

const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

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

async function start() {
    console.log('🚀 Starting Rialtor Backend...');

    // Start the server IMMEDIATELY to respond to health checks
    console.log('🌟 Starting Express server...');
    require('../src/server.js');

    // Run database setup in the background (non-blocking)
    setImmediate(async () => {
        console.log('🔄 Running database setup in background...');
        
        // Check database connection first
        const dbConnected = await checkDatabaseConnection();

        if (dbConnected) {
            try {
                // Try to run migrations
                await runCommand('npx', ['prisma', 'migrate', 'deploy', '--schema=./prisma/schema.prisma'], 'Running database migrations');

                // Try to seed database (continue even if this fails)
                try {
                    await runCommand('npm', ['run', 'db:seed'], 'Seeding database');
                } catch (error) {
                    console.warn('⚠️ Database seeding failed, but server is running...');
                }
            } catch (error) {
                console.warn('⚠️ Database migrations failed, but server is running...');
            }
        } else {
            console.warn('⚠️ Database not available, server is running (will retry connections)...');
        }
    });
}

start().catch(error => {
    console.error('💥 Failed to start application:', error);
    process.exit(1);
});
