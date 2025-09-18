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
        });

        // Copy response headers
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'content-encoding') return; // avoid gzip issues
            res.setHeader(key, value);
        });

        res.status(response.status);
        const respBuffer = Buffer.from(await response.arrayBuffer());
        res.end(respBuffer);
    } catch (error) {
        console.error('Error proxying generate-reserva API:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}