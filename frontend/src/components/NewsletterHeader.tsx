'use client'

import React from 'react'
import {
  Mail,
  Plus,
  Send,
  TrendingUp,
  Sparkles,
  FileText
} from 'lucide-react'

interface NewsletterHeaderProps {
  totalNewsletters: number
  onCreateClick: () => void
  onTemplatesClick: () => void
  stats?: {
    drafts?: number
    published?: number
    sent?: number
  }
}

export default function NewsletterHeader({
  totalNewsletters,
  onCreateClick,
  onTemplatesClick,
  stats = {}
}: NewsletterHeaderProps) {
  const { drafts = 0, published = 0, sent = 0 } = stats

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
      {/* --- FONDO DECORATIVO --- */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

      {/* --- CONTENIDO --- */}
      <div className="relative max-w-[1600px] mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 lg:gap-12">

          {/* IZQUIERDA: Títulos y Botones */}
          <div className="flex-1 w-full xl:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 shadow-lg">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">Email Marketing</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              Mis <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Newsletters</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Crea, diseña y gestiona newsletters profesionales con plantillas premium y publicación instantánea.
            </p>

            {/* BOTONES FUNCIONALES */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={onCreateClick}
                className="group inline-flex items-center justify-center sm:justify-start gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 font-bold text-sm sm:text-base cursor-pointer"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Nueva Newsletter
              </button>

              <button
                onClick={onTemplatesClick}
                className="group inline-flex items-center justify-center sm:justify-start gap-2 bg-white/10 backdrop-blur-sm text-white px-6 sm:px-6 py-3 sm:py-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 font-semibold text-sm sm:text-base cursor-pointer"
              >
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ver Plantillas
              </button>
            </div>
          </div>

          {/* DERECHA: KPIs */}
          <div className="w-full xl:w-auto min-w-[300px] lg:min-w-[600px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-1 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {totalNewsletters}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-1 uppercase tracking-wider">Borradores</p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {drafts}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Send className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-1 uppercase tracking-wider">Publicadas</p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {published}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
