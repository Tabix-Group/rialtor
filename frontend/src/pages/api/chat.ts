import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extraer el mensaje y sessionId del body
    const { message, sessionId } = req.body;
    console.log('[FRONTEND API] Received request:', { message, sessionId, hasAuth: !!req.headers.authorization });

    // Validar que el mensaje existe
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Usar la variable de entorno correcta
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    console.log('[FRONTEND API] Calling backend:', `${backendUrl}/chat/message`);

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

    console.log('[FRONTEND API] Backend response:', response.status, response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('[FRONTEND API] Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('[FRONTEND API] Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
