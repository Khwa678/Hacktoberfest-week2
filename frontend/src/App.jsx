import React, { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Sparkles, ShieldCheck, HeartHandshake, HelpCircle, HardDrive, RefreshCw } from 'lucide-react';

import Navbar from './components/Navbar';
import ListingForm from './components/ListingForm';
import ResultsView from './components/ResultsView';
import StatusModal from './components/StatusModal';
import HistoryDrawer from './components/HistoryDrawer';

import { getModelStatus, generateListing } from './api';
import { SAMPLE_PRODUCTS } from './constants/sampleProducts';

const INITIAL_FORM = {
  product_name: '',
  category: '',
  features: '',
  target_audience: '',
  price: '',
  language: 'english',
  platform: 'instagram',
  tone: 'professional',
};

const STORAGE_KEY = 'sellerboost_generation_history';

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [listing, setListing] = useState(null);
  const [modelUsed, setModelUsed] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState(null);

  // AI & backend status
  const [modelStatus, setModelStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Fetch model status on mount
  const checkStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const data = await getModelStatus();
      setModelStatus(data);
    } catch (err) {
      setModelStatus({
        ollama_reachable: false,
        model_available: false,
        model_name: 'gemma3:4b',
        message: 'Could not connect to SellerBoost backend. Make sure the FastAPI server is running.',
      });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Persist history changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [history]);

  // Handle form updates
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset form
  const handleResetForm = () => {
    setFormData(INITIAL_FORM);
    setListing(null);
    setLastError(null);
    toast('Form cleared.', {
      icon: '🧹',
      style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
    });
  };

  // Load sample product into form
  const handleLoadSample = (sampleId) => {
    const selected = SAMPLE_PRODUCTS.find((p) => p.id === sampleId);
    if (selected) {
      setFormData({
        product_name: selected.name,
        category: selected.category,
        features: selected.features,
        target_audience: selected.target_audience,
        price: selected.price,
        language: selected.language,
        platform: selected.platform,
        tone: selected.tone,
      });
      setLastError(null);
      toast.success(`Loaded sample: ${selected.name.split(' ')[0]}...`, {
        style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
      });
    }
  };

  // Execute Generation
  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setLastError(null);

    try {
      const response = await generateListing({
        product_name: formData.product_name.trim(),
        category: formData.category.trim(),
        features: formData.features.trim(),
        target_audience: formData.target_audience.trim(),
        price: formData.price?.trim() || null,
        language: formData.language,
        platform: formData.platform,
        tone: formData.tone,
      });

      if (response.success && response.listing) {
        setListing(response.listing);
        setModelUsed(response.model_used);

        // Save to history
        const newEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          formData: { ...formData },
          listing: response.listing,
          modelUsed: response.model_used,
        };
        setHistory((prev) => [newEntry, ...prev.slice(0, 24)]); // Keep last 25

        toast.success('Listing generated successfully!', {
          style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
        });
      } else {
        const errorMsg = response.error || 'Failed to generate listing with the local AI model.';
        setLastError(errorMsg);
        toast.error('AI generation encountered an issue.', {
          style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Network error communicating with the backend.';
      setLastError(errorMsg);
      toast.error(errorMsg, {
        style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Reopen past generation from history
  const handleSelectHistoryEntry = (entry) => {
    setFormData(entry.formData);
    setListing(entry.listing);
    setModelUsed(entry.modelUsed);
    setLastError(null);
    toast.success('Loaded listing from history.', {
      style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
    });
  };

  // Delete individual history entry
  const handleDeleteHistoryEntry = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    toast('Removed entry from history.', {
      icon: '🗑️',
      style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
    });
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    toast.success('History cleared.', {
      style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Top Navigation */}
      <Navbar
        modelStatus={modelStatus}
        statusLoading={statusLoading}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>100% Private Local Inference — Zero Cloud API Tokens</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Turn Indian Craft & Hustle into <span className="gradient-text">Top-Ranked Listings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Designed for Indian small businesses, artisans, and D2C side-hustlers. Generate platform-ready Instagram captions, WhatsApp catalog pitches, marketplace descriptions, and high-ranking SEO tags using open-weight AI that runs entirely on your own computer.
            </p>
          </div>

          {/* Decorative glowing gradient backdrop */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-40 -bottom-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Studio Workspace: Form on Left, Output on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (5 cols on large screens) */}
          <section className="lg:col-span-5 w-full" aria-label="Product Listing Studio Form">
            <ListingForm
              formData={formData}
              onChange={handleFormChange}
              onReset={handleResetForm}
              onLoadSample={handleLoadSample}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              modelStatus={modelStatus}
            />
          </section>

          {/* Right Column: Generated Output (7 cols on large screens) */}
          <section className="lg:col-span-7 w-full" aria-label="AI Generated Results">
            <ResultsView
              listing={listing}
              modelUsed={modelUsed}
              isGenerating={isGenerating}
              onRegenerate={handleGenerate}
              lastError={lastError}
              onOpenStatusModal={() => setIsStatusModalOpen(true)}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            Built for <strong className="text-slate-400">Hacktoberfest 2026</strong> Week 2 Side Hustle Challenge.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Open-Weight Gemma via Ollama</span>
            <span>•</span>
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="hover:text-blue-400 transition-colors cursor-pointer"
            >
              System & Model Status
            </button>
          </div>
        </div>
      </footer>

      {/* AI System Settings / Status Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        modelStatus={modelStatus}
        statusLoading={statusLoading}
        onRefresh={checkStatus}
      />

      {/* Generation History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectEntry={handleSelectHistoryEntry}
        onDeleteEntry={handleDeleteHistoryEntry}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
