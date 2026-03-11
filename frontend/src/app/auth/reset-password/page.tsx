'use client'

import { Suspense } from 'react'
import ResetPasswordContent from './ResetPasswordContent'

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
