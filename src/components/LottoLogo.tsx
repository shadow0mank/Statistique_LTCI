import { useState } from 'react';

interface LottoLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

const PRIMARY_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1UUcPoJZdcmwqtRErUQBD3ie7z5ExuFyADhhM3wd-NgcZoZpn-NTF3P-FM55PGW8ysSbkcntbsiikeaHMW0NJf15FXx8gzppQQR9Pzm_4OH_0UR9WANuJwpoFOmoTAdm3dAhVdnNb7DKCF6nGBpa-hLklDC_U3raX_0uoRttwYVKBfxuCCjiNaavllVIcYpD48FOf3OnCPzE1iDgRQm012bZAFtQIdSvIaFn9P0jANCYQQK7kYStEaRciqX';

export default function LottoLogo({ className = 'h-8', showSubtitle = true }: LottoLogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-2.5">
      {!imageError ? (
        <img
          src={PRIMARY_LOGO_URL}
          alt="LOTTO CI"
          onError={() => setImageError(true)}
          className={`${className} w-auto object-contain select-none`}
        />
      ) : (
        /* Crisp High-Res Vector Fallback */
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg bg-[#0f172a] border border-[#334155]/60 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Green orbital ring */}
            <div className="absolute inset-1 rounded-full border-2 border-[#10b981] border-r-transparent rotate-45" />
            {/* Orange core */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#f97316] to-[#c2410c] flex items-center justify-center text-[8px] font-mono font-black text-white shadow-sm">
              CI
            </div>
            {/* Dot */}
            <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-base text-[#dae2fd] tracking-tight leading-none">
              LOTTO <span className="text-[#ec6a06]">CI</span>
            </span>
            {showSubtitle && (
              <span className="font-mono text-[9px] text-[#4edea3] tracking-widest uppercase mt-0.5">
                Analytics Engine
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
