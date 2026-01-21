/**
 * Next.js API proxy for /api/articles/[id] to backend
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { method, headers, body, query } = req;
  const { id } = query;
  
  const url = `${backendUrl}/articles/${id}`;

  // Build fetch options
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
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error proxying article API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
