import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers, query, url } = req;
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing document id' });
  }
  const targetUrl = `${backendUrl}/documents/${id}`;

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

  if (method === 'POST' || method === 'PUT') {
    // Read the incoming request into a buffer
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      req.on('end', () => resolve());
      req.on('error', (err) => reject(err));
    });
    const bodyBuffer = Buffer.concat(chunks);

    const response = await fetch(targetUrl, {
      method,
      headers: headersProxy,
      body: bodyBuffer,
    });

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-encoding') return;
      res.setHeader(key, value);
    });
    res.status(response.status);
    const respBuffer = Buffer.from(await response.arrayBuffer());
    res.end(respBuffer);
    return;
  }

  // For GET/DELETE, just proxy as before
  try {
    const response = await fetch(targetUrl + (req.url?.includes('?') ? req.url?.slice(req.url.indexOf('?')) : ''), { method, headers: headersProxy });
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      res.status(response.status);
      response.body.pipe(res);
    }
  } catch (error) {
    console.error('Error proxying documents API [id]:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
