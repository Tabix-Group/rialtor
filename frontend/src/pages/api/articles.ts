/**
 * Next.js API proxy for /api/articles to backend
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log('[articles] proxying to:', backendUrl);
  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set!');
  }
  const { method, headers, body, query } = req;
  
  // Build URL with query parameters
  let url = `${backendUrl}/articles`;
  if (req.query.id) {
    url += `/${req.query.id}`;
  } else if (Object.keys(query).length > 0) {
    const queryString = new URLSearchParams(query as Record<string, string>).toString();
    url += `?${queryString}`;
  }

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
    console.error('Error proxying articles API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
