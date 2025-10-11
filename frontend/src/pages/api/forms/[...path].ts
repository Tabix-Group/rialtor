import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers } = req;
  
  // Construir la URL del backend
  const path = (req.query.path as string[])?.join('/') || '';
  const url = `${backendUrl}/forms/${path}`;

  console.log(`[FORMS API] ${method} ${url}`);

  // Preparar headers
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
    let body: any = undefined;

    // Para POST/PUT, leer el body
    if (method === 'POST' || method === 'PUT') {
      if (req.body) {
        body = JSON.stringify(req.body);
        headersProxy['content-type'] = 'application/json';
      }
    }

    const response = await fetch(url, {
      method,
      headers: headersProxy,
      body,
    });

    // Copiar headers de respuesta
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    // Para documentos (.docx), enviar como buffer
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      res.status(response.status);
      res.end(buffer);
      return;
    }

    // Para JSON
    if (contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
      return;
    }

    // Para otros tipos
    const text = await response.text();
    res.status(response.status).send(text);

  } catch (error) {
    console.error('[FORMS API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el proxy de formularios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
