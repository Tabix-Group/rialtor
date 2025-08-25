const fs = require('fs');
const path = require('path');
const { createPlaqueSvgString } = require('../src/controllers/plaqueController');

describe('createPlaqueSvgString', () => {
    test('should include Rialtor.app and corredores text when provided', () => {
        const width = 800;
        const height = 600;
        const propertyInfo = {
            precio: '300000',
            moneda: 'USD',
            tipo: 'Casa',
            ambientes: '5',
            superficie: '250',
            direccion: 'Av. Prueba 123',
            contacto: '+54 11 1234-5678',
            email: 'agente@ejemplo.com',
            corredores: 'Hernán Martin Carbone CPI 5493 / Gabriel Carlos Monrabal CMCPSI 6341'
        };
        const imageAnalysis = {
            ubicacion_texto: 'esquina inferior derecha',
            colores: 'neutros'
        };

        const svg = createPlaqueSvgString(width, height, propertyInfo, imageAnalysis);
        expect(svg).toContain('Rialtor.app');
        expect(svg).toContain('Hernán Martin Carbone');
        expect(svg).toContain('Gabriel Carlos Monrabal');
        // Basic sanity: SVG prolog
        expect(svg.startsWith('<?xml version="1.0"')).toBeTruthy();
    });
});
