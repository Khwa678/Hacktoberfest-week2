import React from 'react';
import { X, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Terminal, HardDrive, ShieldCheck, Cpu } from 'lucide-react';

export default function StatusModal({ isOpen, onClose, modelStatus, statusLoading, onRefresh }) {
  if (!isOpen) return null;

  const isOllamaUp = modelStatus?.ollama_reachable;
  const isModelUp = modelStatus?.model_available;
  const modelName = modelStatus?.model_name || 'gemma3:4b';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-white flex items-center gap-2">
                Local AI Engine & Service Status
              </h2>
              <p className="text-xs text-slate-400">
                Checking local runtime health, open-weight model availability, and privacy boundaries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto space-y-5 py-4 pr-1 text-sm">
          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Backend & Ollama Runtime */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Ollama Service
                </span>
                {isOllamaUp ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Reachable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-rose-400">
                    <XCircle className="w-4 h-4" /> Offline
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {isOllamaUp
                  ? 'Local inference engine running on localhost'
                  : 'Cannot reach Ollama at configured base URL.'}
              </p>
            </div>

            {/* Model Tag & Readiness */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Selected Model
                </span>
                {isModelUp ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <AlertTriangle className="w-4 h-4" /> Not Found
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {modelName}
              </p>
            </div>
          </div>

          {/* Model Status Message Banner */}
          {modelStatus?.message && (
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              isModelUp
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                : isOllamaUp
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-200'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-200'
            }`}>
              <span className="font-semibold">Diagnostic Note:</span> {modelStatus.message}
            </div>
          )}

          {/* Step-by-step Setup Instructions */}
          {(!isOllamaUp || !isModelUp) && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Quick Setup Instructions (Run in your terminal)
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                <li>
                  <strong>Install Ollama:</strong> Download from{' '}
                  <span className="font-mono text-blue-300">https://ollama.com</span> if not yet installed.
                </li>
                <li>
                  <strong>Start the Ollama daemon:</strong>
                  <div className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 flex items-center justify-between">
                    <span>ollama serve</span>
                  </div>
                </li>
                <li>
                  <strong>Pull the open-weight model:</strong>
                  <div className="mt-1 p-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 flex items-center justify-between">
                    <span>ollama pull {modelName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Tip: For lighter hardware, you can also run <code className="text-blue-300">ollama pull gemma2:2b</code> and set <code className="text-blue-300">OLLAMA_MODEL=gemma2:2b</code> in <code className="text-blue-300">backend/.env</code>.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* Privacy & Architecture Notice */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-blue-200">Local-First Architecture & Privacy Guarantee</p>
              <p className="text-slate-400 leading-relaxed">
                When using the local model runtime, your product descriptions, pricing, and business details never leave your computer.
                All inference is computed on your local GPU/CPU with open weights. No paid third-party closed APIs or usage trackers are ever contacted during listing generation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onRefresh}
            disabled={statusLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
