import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Next.js dynamic API proxy for /api/users/[id] to backend
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers, body, query } = req;
  const { id } = query;
  const url = `${backendUrl}/users/${id}`;

  // Build proxy headers
  const proxyHeaders: Record<string, string> = {};
  if (headers.authorization) {
    proxyHeaders.Authorization = headers.authorization;
  }
  // Include JSON content-type for methods with body
  if (method === 'PUT' || method === 'POST') {
    proxyHeaders['Content-Type'] = 'application/json';
  }

  // Build fetch options
  const fetchOptions: RequestInit = { method, headers: proxyHeaders };
  // Forward body for PUT and POST
  if (method === 'PUT' || method === 'POST') {
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
