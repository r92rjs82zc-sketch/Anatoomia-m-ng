import React from 'react';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/sound';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md glass-panel rounded-3xl shadow-2xl p-6 space-y-5 border border-white/[0.1]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Bricolage_Grotesque',sans-serif]">
              Kas lähtestada kogu edenemine?
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Kõik kogutud XP-d, saavutatud tasemed, alistatud bossid ja selgeks õpitud kaartide märgistused kustutatakse sellest brauserist.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            Tühista
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40 transition-colors cursor-pointer"
          >
            Jah, lähtesta kõik
          </button>
        </div>
      </div>
    </div>
  );
};
