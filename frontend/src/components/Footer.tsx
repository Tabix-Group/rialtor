"use client";
import React from "react";

export default function Footer() {
  const [hover, setHover] = React.useState(false);
  return (
    <footer className="w-full fixed left-0 bottom-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-t-2xl shadow-lg border-t border-orange-700/30" style={{ backdropFilter: 'blur(6px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg ring-1 ring-white/10">
            {/* subtle logo mark */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M3 12h18M12 3v18" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">RIALTOR</div>
            <div className="text-xs opacity-90">Smart Real Estate with AI</div>
          </div>
        </div>

        <div className="text-sm opacity-95 text-white flex items-center gap-3">
          <span>© {new Date().getFullYear()} <a
            href="https://www.tabix.app"
            target="_blank"
            rel="noopener noreferrer"
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            className="font-semibold underline-offset-2 hover:underline"
          >Tabix Group</a>
          </span>
          <span className="hidden sm:inline">· Todos los derechos reservados.</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <a className="text-white/90 hover:text-white text-sm" href="/privacy">Privacidad</a>
          <a className="text-white/90 hover:text-white text-sm" href="/terms">Términos</a>
        </div>
      </div>
      {/* spacer to avoid content behind fixed footer */}
      <div style={{ height: 68 }} />
    </footer>
  );
}
