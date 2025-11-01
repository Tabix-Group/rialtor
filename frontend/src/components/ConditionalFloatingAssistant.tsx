'use client'

import React from 'react'
import { useAuth } from '../app/auth/authContext'
import FloatingAssistant from './FloatingAssistant'

export default function ConditionalFloatingAssistant() {
  const { user } = useAuth()
  return user ? <FloatingAssistant /> : null
}