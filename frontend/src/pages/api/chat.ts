import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extraer el mensaje y sessionId del body
    const { message, sessionId } = req.body;
    // Usar la variable de entorno correcta
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Llamar al backend Node.js
    const response = await axios.post(`${backendUrl}/chat/message`, {
      message,
      sessionId
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
