import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  RotateCw,
  Share2,
  FileCheck,
  Hash,
  KeyRound,
  MessageSquareText,
  BookmarkCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResultsView({
  listing,
  modelUsed,
  isGenerating,
  onRegenerate,
  lastError,
  onOpenStatusModal,
}) {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard!`, {
        duration: 2000,
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #334155',
          fontSize: '13px',
        },
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const copyAllTogether = async () => {
    if (!listing) return;
    const combined = `=== ${listing.seo_title} ===

[SALES PITCH]
${listing.sales_pitch}

[DESCRIPTION]
${listing.description}

[SEO KEYWORDS]
${listing.seo_keywords.join(', ')}

[SOCIAL CAPTION]
${listing.social_caption}

[HASHTAGS]
${listing.hashtags.join(' ')}
`;

    await copyToClipboard(combined, 'All Listing Details');
  };

  // ── Loading Shimmer State ──────────────────────────────────────────
  if (isGenerating) {
    return (
      <div className="glass-card p-6 sm:p-7 space-y-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="h-5 w-48 rounded bg-slate-800 animate-shimmer"></div>
            <div className="h-3 w-64 rounded bg-slate-800/60 animate-shimmer"></div>
          </div>
          <div className="h-8 w-24 rounded-lg bg-slate-800 animate-shimmer"></div>
        </div>

        <div className="space-y-5">
          {/* Skeleton cards */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="h-3 w-28 rounded bg-slate-800 animate-shimmer"></div>
              <div className="h-4 w-full rounded bg-slate-800/80 animate-shimmer"></div>
              <div className="h-4 w-3/4 rounded bg-slate-800/60 animate-shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────
  if (lastError) {
    return (
      <div className="glass-card p-6 sm:p-7 border border-rose-900/40 bg-rose-950/20 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-900/40 text-rose-400 border border-rose-800/60">
            <AlertCircle className="w-6 h-6 shrink-0" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-rose-200">Listing Generation Failed</h3>
            <p className="text-xs text-rose-300/80 leading-relaxed">
              The local AI runtime returned an error or is unreachable. No fake or placeholder content was substituted.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
          {lastError}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" /> Retry Generation
          </button>
          <button
            onClick={onOpenStatusModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Check Setup Guide
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────
  if (!listing) {
    return (
      <div className="glass-card p-8 sm:p-12 border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4 min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/40 flex items-center justify-center text-blue-400 shadow-inner">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-white">
            Studio Canvas Ready
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Fill in your product specifications on the left, or select a sample Indian product to instantly watch your local open-weight AI generate marketplace-ready copy.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            SEO Titles
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            High-Converting Pitches
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            Social Captions
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
            Hindi & English
          </span>
        </div>
      </div>
    );
  }

  // ── Generated Results Display ──────────────────────────────────────
  return (
    <div className="glass-card p-5 sm:p-7 space-y-6 border border-slate-800 animate-fade-in-up">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <FileCheck className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">Generated Studio Output</h2>
          </div>
          <p className="text-xs text-slate-400">
            Inference powered locally via <span className="text-blue-300 font-mono">{modelUsed || 'Ollama'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Generate a fresh variation"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
          <button
            onClick={copyAllTogether}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            title="Copy everything into one text block"
          >
            {copiedField === 'All Listing Details' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy All
          </button>
        </div>
      </div>

      {/* Generated Cards */}
      <div className="space-y-4">
        {/* 1. SEO Title */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 relative group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5" /> SEO-Friendly Product Title
            </span>
            <button
              onClick={() => copyToClipboard(listing.seo_title, 'SEO Title')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Copy SEO Title"
            >
              {copiedField === 'SEO Title' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-sm sm:text-base font-bold text-white leading-snug">
            {listing.seo_title}
          </p>
        </div>

        {/* 2. Short Sales Pitch / Tagline */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 relative group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Sales Pitch & Hook
            </span>
            <button
              onClick={() => copyToClipboard(listing.sales_pitch, 'Sales Pitch')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Copy Sales Pitch"
            >
              {copiedField === 'Sales Pitch' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
            "{listing.sales_pitch}"
          </p>
        </div>

        {/* 3. Product Description */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 relative group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5" /> Detailed Marketplace Description
            </span>
            <button
              onClick={() => copyToClipboard(listing.description, 'Description')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Copy Description"
            >
              {copiedField === 'Description' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* 4. Platform-Specific Social Media Caption */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 relative group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5" /> Platform Social Caption
            </span>
            <button
              onClick={() => copyToClipboard(listing.social_caption, 'Social Caption')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Copy Social Caption"
            >
              {copiedField === 'Social Caption' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
            {listing.social_caption}
          </div>
        </div>

        {/* 5. SEO Keywords */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> SEO Keywords ({listing.seo_keywords.length})
            </span>
            <button
              onClick={() =>
                copyToClipboard(listing.seo_keywords.join(', '), 'All Keywords')
              }
              className="text-[11px] font-semibold text-slate-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Copy Keywords
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {listing.seo_keywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(kw, `Keyword "${kw}"`)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                title="Click to copy this keyword"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Hashtags */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Platform Hashtags ({listing.hashtags.length})
            </span>
            <button
              onClick={() =>
                copyToClipboard(listing.hashtags.join(' '), 'All Hashtags')
              }
              className="text-[11px] font-semibold text-slate-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" /> Copy Hashtags
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {listing.hashtags.map((ht, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(ht, `Hashtag "${ht}"`)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 transition-colors cursor-pointer"
                title="Click to copy this hashtag"
              >
                {ht}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
