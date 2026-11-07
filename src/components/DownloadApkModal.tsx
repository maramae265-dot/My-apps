import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, QrCode, Copy, Check, ShieldCheck, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../audio/soundEngine';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // App URL for Android phone
  const appUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('run.app') ? window.location.origin : 'https://ais-pre-a6hvphu75ioplxceal3iyw-504303473346.us-east5.run.app')
    : 'https://ais-pre-a6hvphu75ioplxceal3iyw-504303473346.us-east5.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#070913',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    soundEngine.playRouletteTick(1.2);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadApkFile = () => {
    setIsDownloading(true);
    soundEngine.playReload();

    // Trigger direct download of the generated .apk file
    const link = document.createElement('a');
    link.href = '/CyberApex_Arena_P2W_v1.0.apk';
    link.download = 'CyberApex_Arena_P2W_v1.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      soundEngine.playPurchaseSuccess();
      setIsDownloading(false);
    }, 1200);
  };

  const handleNativeInstall = async () => {
    soundEngine.playJumpPad();
    const ok = await install();
    if (ok) {
      soundEngine.playPurchaseSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                INSTALAR EN TU TELÉFONO ANDROID
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  APK v1.0.4
                </span>
              </h2>
              <p className="text-xs text-slate-400">Juega como una app nativa en tu celular en pantalla completa horizontal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TOP SECTION: SCAN QR CODE OR OPEN LINK ON PHONE */}
          <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
            {/* QR Code Container */}
            <div className="shrink-0 p-2.5 bg-white rounded-2xl shadow-lg border border-slate-300 flex flex-col items-center">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Escanear con Android" className="w-36 h-36 rounded-lg" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-600">
                  Cargando QR...
                </div>
              )}
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-cyan-600" /> ESCANEA CON TU ANDROID
              </span>
            </div>

            {/* QR Instructions */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                MÉTODO MÁS RÁPIDO
              </span>
              <h3 className="text-base font-bold text-white">
                Abre la cámara de tu teléfono Android y apunta a este código QR
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Al escanearlo, tu celular abrirá el juego y verás el botón para <strong className="text-emerald-400">Instalar en la pantalla de inicio</strong> como una app real de Android con icono propio.
              </p>

              {/* Copy URL Link Bar */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? '¡COPIADO!' : 'COPIAR ENLACE'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* TWO DIRECT INSTALLATION MODES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Direct WebAPK Installation */}
            <div className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">OPCIÓN A (RECOMENDADA)</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Instalar en Teléfono (WebAPK)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Si ya estás navegando desde tu celular Android, pulsa este botón para agregarlo a tus apps instaladas con pantalla completa horizontal.
                </p>
              </div>

              <button
                onClick={handleNativeInstall}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isInstallable ? 'INSTALAR AHORA EN ANDROID' : 'AÑADIR A PANTALLA DE INICIO'}</span>
              </button>
            </div>

            {/* 2. Download Real .APK Package File */}
            <div className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">OPCIÓN B</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-1 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  Descargar Archivo .APK Físico
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Descarga directa del paquete <strong className="text-slate-300">CyberApex_Arena_P2W_v1.0.apk</strong> para guardar o transferir a tu teléfono Android.
                </p>
              </div>

              <button
                onClick={handleDownloadApkFile}
                disabled={isDownloading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'DESCARGANDO APK...' : 'DESCARGAR ARCHIVO .APK'}</span>
              </button>
            </div>
          </div>

          {/* Step-by-Step Android Guide */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              CÓMO QUEDA INSTALADO EN TU TELÉFONO ANDROID:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold inline-flex items-center justify-center text-xs mb-2">
                  1
                </span>
                <p className="text-slate-200 font-semibold mb-1">Abre el enlace en Android</p>
                <p className="text-slate-400 text-[11px] leading-tight">
                  Escanea el código QR o copia el enlace a Chrome en tu teléfono.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold inline-flex items-center justify-center text-xs mb-2">
                  2
                </span>
                <p className="text-slate-200 font-semibold mb-1">Pulsa Instalar App</p>
                <p className="text-slate-400 text-[11px] leading-tight">
                  En el menú de Chrome selecciona "Instalar aplicación" o pulsa el botón verde.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold inline-flex items-center justify-center text-xs mb-2">
                  3
                </span>
                <p className="text-slate-200 font-semibold mb-1">Icono en tus Aplicaciones</p>
                <p className="text-slate-400 text-[11px] leading-tight">
                  Aparece el icono de Cyber Apex en tu menú de apps de Android, abre en horizontal y a pantalla completa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <span>Compatible con todos los celulares Android (Samsung, Xiaomi, Motorola, Huawei, Pixel).</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
