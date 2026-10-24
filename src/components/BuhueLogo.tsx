import React from 'react';

interface BuhueLogoProps {
  className?: string;
  size?: number; // size in px for the mark
  variant?: 'full' | 'icon' | 'badge';
  subtitle?: string;
}

export const BuhueLogo: React.FC<BuhueLogoProps> = ({
  className = '',
  size = 40,
  variant = 'full',
  subtitle
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icono Vectorial del Búho con Antena, Mapa, GPS y Nodos Telefónicos */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          {/* Degradados azul y cian institucional */}
          <linearGradient id="buhueGridGrad" x1="40" y1="60" x2="160" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E40AF" stopOpacity="0.8" />
            <stop stopColor="#0284C7" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="buhueRouteGrad" x1="70" y1="140" x2="135" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="buhueGlow" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0.25" />
            <stop stopColor="#0B132B" stopOpacity="0" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Círculo de Fondo Sutil */}
        <circle cx="100" cy="100" r="92" fill="#0B132B" stroke="#1E293B" strokeWidth="2" />
        <circle cx="100" cy="100" r="92" fill="url(#buhueGlow)" />

        {/* --- MAPA Y CALLES DE FONDO EN CIAN TÁCTICO --- */}
        <g stroke="#0284C7" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round">
          {/* Cuadrícula de calles de Ciudad Juárez */}
          <line x1="60" y1="75" x2="140" y2="115" />
          <line x1="55" y1="95" x2="145" y2="135" />
          <line x1="65" y1="115" x2="135" y2="155" />
          <line x1="75" y1="65" x2="120" y2="155" />
          <line x1="95" y1="60" x2="140" y2="145" />
          <line x1="60" y1="130" x2="105" y2="160" />
        </g>

        {/* --- RUTA DE INTERÉS CON NODOS CONECTADOS --- */}
        <path
          d="M 80 152 Q 95 145 92 128 T 100 98 T 128 85"
          fill="none"
          stroke="url(#buhueRouteGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />

        {/* Nodos de la ruta */}
        <circle cx="80" cy="152" r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="92" cy="128" r="4.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="100" cy="98" r="5.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="128" cy="85" r="4.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />

        {/* Pin GPS Principal sobre el nodo clave */}
        <g transform="translate(100, 80)">
          <path
            d="M 0 -18 C -9 -18 -15 -11 -15 -2 C -15 8 -3 15 0 21 C 3 15 15 8 15 -2 C 15 -11 9 -18 0 -18 Z"
            fill="#0284C7"
            stroke="#38BDF8"
            strokeWidth="2"
          />
          <circle cx="0" cy="-3" r="5" fill="#0B132B" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>

        {/* --- ANTENA CELULAR EN EL LADO IZQUIERDO --- */}
        <g transform="translate(42, 95)" stroke="#38BDF8" strokeLinecap="round">
          {/* Torre triangular */}
          <path d="M 0 15 L 8 -10 L 16 15" fill="none" strokeWidth="2" />
          <line x1="3" y1="7" x2="13" y2="7" strokeWidth="1.5" />
          <line x1="5" y1="-1" x2="11" y2="-1" strokeWidth="1.5" />
          <circle cx="8" cy="-10" r="2" fill="#38BDF8" />

          {/* Ondas electromagnéticas / cobertura */}
          <path d="M 1 -18 A 12 12 0 0 1 15 -18" fill="none" strokeWidth="1.8" />
          <path d="M -4 -24 A 18 18 0 0 1 20 -24" fill="none" strokeWidth="1.8" />
          <path d="M -9 -30 A 24 24 0 0 1 25 -30" fill="none" strokeWidth="1.8" strokeOpacity="0.6" />
        </g>

        {/* --- NODOS LATERALES DERECHOS (TELÉFONO Y CONTACTO) --- */}
        {/* Nodo Teléfono */}
        <g transform="translate(155, 78)">
          <circle cx="0" cy="0" r="13" fill="#0B192C" stroke="#38BDF8" strokeWidth="2" />
          {/* Icono teléfono auricular */}
          <path
            d="M -4 -6 C -6 -4 -5 1 -2 4 C 1 7 6 8 8 6 L 6 3 C 5 2 4 3 3 2 C 2 1 3 0 2 -1 L -1 -3 Z"
            fill="#38BDF8"
          />
        </g>

        {/* Nodo Contacto / Persona */}
        <g transform="translate(153, 115)">
          <circle cx="0" cy="0" r="13" fill="#0B192C" stroke="#38BDF8" strokeWidth="2" />
          {/* Icono usuario */}
          <circle cx="0" cy="-3" r="3.5" fill="#38BDF8" />
          <path d="M -6 6 C -6 2 -2 1 0 1 C 2 1 6 2 6 6 Z" fill="#38BDF8" />
        </g>

        {/* Línea conectora circular exterior */}
        <path
          d="M 50 128 A 75 75 0 0 0 152 135"
          fill="none"
          stroke="#0284C7"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* --- CABEZA Y OJOS DEL BÚHO VIGILANTE (SUPERIOR) --- */}
        {/* Cejas y silueta superior en blanco nítido */}
        <path
          d="M 28 85 C 38 45 68 28 99 28 C 130 28 160 45 170 85"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Penacho / Orejas del Búho */}
        <path
          d="M 55 35 L 75 52 L 100 40 L 125 52 L 145 35"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cuencas de los ojos */}
        <circle cx="72" cy="72" r="20" fill="#060D17" stroke="#FFFFFF" strokeWidth="5" />
        <circle cx="128" cy="72" r="20" fill="#060D17" stroke="#FFFFFF" strokeWidth="5" />

        {/* Ojos vigilantes penetrantes */}
        <circle cx="72" cy="72" r="9" fill="#FFFFFF" />
        <circle cx="73" cy="71" r="5" fill="#0B132B" />
        <circle cx="75" cy="69" r="1.8" fill="#38BDF8" />

        <circle cx="128" cy="72" r="9" fill="#FFFFFF" />
        <circle cx="127" cy="71" r="5" fill="#0B132B" />
        <circle cx="125" cy="69" r="1.8" fill="#38BDF8" />

        {/* Pico geométrico central */}
        <polygon points="100,60 107,80 93,80" fill="#FFFFFF" />
        <polygon points="100,86 106,78 94,78" fill="#38BDF8" />
      </svg>

      {/* Tipografía Oficial BUHUE */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-mono text-xl font-black tracking-[0.22em] text-white uppercase">
              B<span className="relative inline-block">
                U
                <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1 border-l-2 border-r-2 border-b-2 border-blue-400 rotate-45 transform pointer-events-none" />
              </span>HUE
            </span>
            <span className="text-blue-500 font-mono text-lg font-bold">|</span>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
              ANTISEC
            </span>
          </div>

          <span className="text-[10px] font-mono tracking-wider text-slate-400 mt-1 uppercase">
            {subtitle || 'Análisis Telefónico · UECS Cd. Juárez'}
          </span>
        </div>
      )}
    </div>
  );
};
