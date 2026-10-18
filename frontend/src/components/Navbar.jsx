import React from 'react';
import { Sparkles, ShieldCheck, Cpu, History, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function Navbar({
  modelStatus,
  statusLoading,
  onOpenStatusModal,
  historyCount,
  onToggleHistory,
  isHistoryOpen,
}) {
  const getStatusBadge = () => {
    if (statusLoading) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 animate-pulse">
          <Clock className="w-3.5 h-3.5" /> Checking AI...
        </span>
      );
    }
    if (modelStatus?.ollama_reachable && modelStatus?.model_available) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-sm">
          <span className="status-dot status-dot--online"></span>
          AI Ready ({modelStatus.model_name})
        </span>
      );
    }
    if (modelStatus?.ollama_reachable && !modelStatus?.model_available) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60 shadow-sm">
          <span className="status-dot status-dot--warning"></span>
          Model Needs Pull
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-950/70 text-rose-300 border border-rose-800/60 shadow-sm">
        <span className="status-dot status-dot--offline"></span>
        AI Offline
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                SellerBoost <span className="gradient-text font-black">AI</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 border border-indigo-800/70 rounded">
                Hacktoberfest '26
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Local-First AI Listing Studio for Small Sellers
            </p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-800" title="All prompts run on your computer via local open weights. No remote APIs or telemetry.">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>100% Local Inference</span>
          </div>

          {/* Model Status button that opens Modal */}
          <button
            onClick={onOpenStatusModal}
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Open AI System Settings & Status"
          >
            {getStatusBadge()}
          </button>

          {/* History drawer toggle */}
          <button
            onClick={onToggleHistory}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isHistoryOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            aria-label="Toggle generation history"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
