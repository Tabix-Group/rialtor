
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing for file uploads
  },
};



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers, query } = req;
  let url = `${backendUrl}/documents`;
  if (query.id) {
    url += `/${query.id}`;
  }

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

  // Ensure authorization header is included
  if (headers.authorization) {
    headersProxy['Authorization'] = Array.isArray(headers.authorization) 
      ? headers.authorization[0] 
      : headers.authorization;
  }


  if (method === 'POST' || method === 'PUT') {
    // Read the incoming request into a buffer
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
    return;
  }

  // For GET/DELETE, just proxy as before
  try {
    const response = await fetch(url, { method, headers: headersProxy });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying documents API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
