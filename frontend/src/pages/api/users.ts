/**
 * Next.js API proxy for /api/users to backend
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers, body, query } = req;
  let url = `${backendUrl}/users`;
  if (req.query.id) url += `/${req.query.id}`;

  // Build fetch options; include auth header and JSON body only for POST/PUT
  const headersProxy: Record<string, string> = {};
  if (headers.authorization) {
    headersProxy.Authorization = headers.authorization;
  }
  const fetchOptions: RequestInit = { method, headers: headersProxy };
  if (method === 'POST' || method === 'PUT') {
    headersProxy['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const backendRes = await fetch(url, fetchOptions);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error });
  }
}
