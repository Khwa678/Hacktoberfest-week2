import React from 'react';
import {
  Sparkles,
  RotateCcw,
  Lightbulb,
  Tag,
  DollarSign,
  Users,
  Layers,
  FileText,
  Languages,
  Store,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../constants/sampleProducts';

export default function ListingForm({
  formData,
  onChange,
  onReset,
  onLoadSample,
  onSubmit,
  isGenerating,
  modelStatus,
}) {
  const isOllamaUp = modelStatus?.ollama_reachable;
  const isModelUp = modelStatus?.model_available;

  // Validation checks
  const isNameValid = formData.product_name.trim().length >= 2;
  const isCategoryValid = formData.category.trim().length >= 2;
  const isFeaturesValid = formData.features.trim().length >= 10;
  const isAudienceValid = formData.target_audience.trim().length >= 2;
  const isFormValid = isNameValid && isCategoryValid && isFeaturesValid && isAudienceValid;

  return (
    <div className="glass-card p-5 sm:p-7 space-y-6 relative border border-slate-800">
      {/* Form header and sample product quick-fill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-900/60 text-blue-400 border border-blue-800/60">
              <FileText className="w-4 h-4" />
            </span>
            Product Details & Preferences
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Describe your product to generate optimized copy tailored for Indian shoppers.
          </p>
        </div>

        {/* Sample product picker menu */}
        <div className="flex items-center gap-2">
          <label htmlFor="sample-picker" className="sr-only">
            Load Sample Product
          </label>
          <div className="relative inline-block w-full sm:w-auto">
            <select
              id="sample-picker"
              onChange={(e) => {
                if (e.target.value) {
                  onLoadSample(e.target.value);
                  e.target.value = ''; // Reset select to placeholder
                }
              }}
              defaultValue=""
              className="w-full sm:w-auto appearance-none bg-slate-900/90 hover:bg-slate-800 text-blue-300 text-xs font-semibold py-2 px-3 pr-8 rounded-lg border border-blue-900/50 hover:border-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Try a sample Indian product"
            >
              <option value="" disabled>
                ✨ Try a Sample Product...
              </option>
              {SAMPLE_PRODUCTS.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name.length > 36 ? prod.name.substring(0, 36) + '...' : prod.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-blue-400">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isFormValid && !isGenerating) {
            onSubmit();
          }
        }}
        className="space-y-5"
        noValidate
      >
        {/* Row 1: Product Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="product_name"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                Product Name <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.product_name.length}/150
              </span>
            </label>
            <input
              id="product_name"
              name="product_name"
              type="text"
              required
              maxLength={150}
              placeholder="e.g. Handwoven Banarasi Silk Saree"
              value={formData.product_name}
              onChange={(e) => onChange('product_name', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Category <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.category.length}/100
              </span>
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Ethnic Fashion, Eco Kitchen, Handmade Decor"
              value={formData.category}
              onChange={(e) => onChange('category', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Row 2: Features, materials, artisan details */}
        <div>
          <label
            htmlFor="features"
            className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Key Features, Materials & Craftsmanship <span className="text-rose-400">*</span>
            </span>
            <span
              className={`text-[10px] font-mono ${
                formData.features.length > 0 && formData.features.length < 10
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}
            >
              {formData.features.length}/2000 {formData.features.length < 10 ? '(min 10)' : ''}
            </span>
          </label>
          <textarea
            id="features"
            name="features"
            rows={4}
            required
            maxLength={2000}
            placeholder="e.g. Handwoven with 100% natural mulberry silk, antique Zari floral boota, lightweight and breathable. Woven over 18 days by traditional Varanasi artisans. Includes unstitched blouse piece."
            value={formData.features}
            onChange={(e) => onChange('features', e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y leading-relaxed"
          />
        </div>

        {/* Row 3: Target Audience & Selling Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="target_audience"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Target Audience <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.target_audience.length}/200
              </span>
            </label>
            <input
              id="target_audience"
              name="target_audience"
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Brides, festive shoppers, conscious consumers"
              value={formData.target_audience}
              onChange={(e) => onChange('target_audience', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                Selling Price <span className="text-slate-500 font-normal">(Optional)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {formData.price?.length || 0}/50
              </span>
            </label>
            <input
              id="price"
              name="price"
              type="text"
              maxLength={50}
              placeholder="e.g. ₹3,499 or ₹999 for pack of 2"
              value={formData.price || ''}
              onChange={(e) => onChange('price', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Row 4: Targeting Controls (Language, Platform, Tone) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Language Selector */}
          <div>
            <label
              htmlFor="language"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-blue-400" />
              Listing Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={(e) => onChange('language', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi (हिंदी)</option>
            </select>
          </div>

          {/* Platform Selector */}
          <div>
            <label
              htmlFor="platform"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              Primary Platform
            </label>
            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={(e) => onChange('platform', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="instagram">Instagram (Reels/Feed + Bio)</option>
              <option value="whatsapp">WhatsApp (Catalog/Direct Chat)</option>
              <option value="generic">Generic Marketplace / E-Shop</option>
            </select>
          </div>

          {/* Tone Selector */}
          <div>
            <label
              htmlFor="tone"
              className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              Brand Tone
            </label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={(e) => onChange('tone', e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="professional">Professional & Trustworthy</option>
              <option value="friendly">Warm & Approachable</option>
              <option value="premium">Luxury & Aspirational</option>
            </select>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Form
          </button>

          <button
            type="submit"
            disabled={!isFormValid || isGenerating}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
              !isFormValid || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-blue-600/25 hover:shadow-blue-600/40 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-300" />
                <span>Generating with Local AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Listing Studio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
