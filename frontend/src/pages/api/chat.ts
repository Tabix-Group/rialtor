import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extraer el mensaje y sessionId del body
    const { message, sessionId } = req.body;
    // Aquí podrías agregar autenticación si es necesario

    // Llamar al backend Node.js
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const response = await axios.post(`${backendUrl}/api/chat/message`, {
      message,
      sessionId
    }, {
      headers: {
        // Puedes reenviar el token de autenticación si es necesario
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      // Si necesitas reenviar cookies:
      // withCredentials: true
    });

    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
