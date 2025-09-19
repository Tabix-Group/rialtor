import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get backend URL from environment or use production URL
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

    // Add /api if not present
    if (!backendUrl.endsWith('/api')) {
        backendUrl += '/api';
    }

    const { method, headers } = req;
    const url = `${backendUrl}/documents/generate-reserva`;

    // Prepare headers (copy all except host and content-length)
    const headersProxy: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
        if (
            value &&
            key.toLowerCase() !== 'host' &&
            key.toLowerCase() !== 'content-length'
        ) {
            headersProxy[key] = Array.isArray(value) ? value.join(',') : value;
        }
    });

    try {
        // Read the incoming request body
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            req.on('end', () => resolve());
            req.on('error', (err) => reject(err));
        });
        const bodyBuffer = Buffer.concat(chunks);

        const response = await fetch(url, {
            method,
            headers: headersProxy,
            body: bodyBuffer,
            signal: AbortSignal.timeout(120000), // 120 segundos timeout - increased for document processing
        });

        console.log(`[PROXY] Respuesta del backend - Status: ${response.status}`);

        // Copy response headers
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'content-encoding') return; // avoid gzip issues
            res.setHeader(key, value);
        });

        res.status(response.status);

        if (!response.ok) {
            console.error(`[PROXY] Error del backend - Status: ${response.status}`);
            const errorText = await response.text();
            console.error(`[PROXY] Error details:`, errorText);
            res.end(errorText);
            return;
        }

        const respBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`[PROXY] Respuesta exitosa - Tamaño: ${respBuffer.length} bytes`);
        res.end(respBuffer);
    } catch (error) {
        console.error('Error proxying generate-reserva API:', error);

        const err = error as any; // Type assertion for error handling

        if (err.name === 'AbortError') {
            return res.status(408).json({
                error: 'Timeout',
                details: 'La solicitud tardó demasiado tiempo en procesarse'
            });
        }

        if (err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Servicio no disponible',
                details: 'No se pudo conectar al servidor backend'
            });
        }

        return res.status(500).json({
            error: 'Error interno del servidor',
            details: err.message || 'Error desconocido'
        });
    }
}