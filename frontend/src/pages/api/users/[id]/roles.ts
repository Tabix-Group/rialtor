import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy para /api/users/[id]/roles hacia el backend
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers, body, query } = req;
  const { id } = query;
  const url = `${backendUrl}/users/${id}/roles`;

  // Construir headers
  const proxyHeaders: Record<string, string> = {};
  if (headers.authorization) {
    proxyHeaders.Authorization = headers.authorization;
  }
  if (method === 'POST' || method === 'PUT') {
    proxyHeaders['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = { method, headers: proxyHeaders };
  if (method === 'POST' || method === 'PUT') {
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
