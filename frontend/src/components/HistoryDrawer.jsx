import React from 'react';
import { X, Trash2, Calendar, Store, ArrowUpRight, CheckCircle2, History, Languages } from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectEntry,
  onDeleteEntry,
  onClearHistory,
}) {
  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-md flex flex-col animate-fade-in-up"
      aria-label="Generation History"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-white">Generation History</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/60">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close history drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-slate-500">
            <History className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-xs">No listings saved in history yet.</p>
            <p className="text-[11px] text-slate-600">
              Successful generations are automatically stored locally in your browser.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all group flex flex-col gap-2 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectEntry(item);
                    onClose();
                  }}
                  className="text-left font-bold text-xs sm:text-sm text-slate-200 hover:text-blue-400 transition-colors flex-1 line-clamp-1 cursor-pointer flex items-center gap-1"
                >
                  {item.formData.product_name}
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(item.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer rounded"
                  aria-label="Delete this history entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Snippet */}
              <p className="text-xs text-slate-400 line-clamp-2">
                {item.listing.seo_title}
              </p>

              {/* Metadata tags */}
              <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 border-t border-slate-800/60">
                <span className="capitalize">{item.formData.platform}</span>
                <span>•</span>
                <span className="capitalize">{item.formData.language}</span>
                <span>•</span>
                <span>{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Clear All */}
      {history.length > 0 && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Stored in browser localStorage</span>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire generation history?')) {
                onClearHistory();
              }
            }}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      )}
    </aside>
  );
}
