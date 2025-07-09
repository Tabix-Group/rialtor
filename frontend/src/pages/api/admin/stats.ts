import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy to backend admin stats endpoint
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers } = req;
  const url = `${backendUrl}/admin/stats`;

  // Forward auth header
  const proxyHeaders: Record<string, string> = {};
  if (headers.authorization) {
    proxyHeaders.Authorization = headers.authorization;
  }

  const fetchOptions: RequestInit = { method, headers: proxyHeaders };

  try {
    const backendRes = await fetch(url, fetchOptions);
    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error });
  }
}
