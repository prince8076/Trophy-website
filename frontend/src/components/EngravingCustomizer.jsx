import React from 'react';
import { Sparkles, Type, Palette, ShieldCheck } from 'lucide-react';

export default function EngravingCustomizer({
  maxLines = 3,
  maxChars = 35,
  customization,
  onChange,
}) {
  const fonts = [
    { id: 'Classic Serif', name: 'Classic Serif', previewClass: 'font-serif-luxury tracking-wide' },
    { id: 'Modern Sans', name: 'Modern Sans', previewClass: 'font-sans uppercase tracking-widest' },
    { id: 'Formal Script', name: 'Formal Script', previewClass: 'font-script text-2xl tracking-normal' },
  ];

  const plateColors = [
    { id: 'Gold', name: 'Polished Gold', plateClass: 'plate-gold', borderClass: 'border-amber-400' },
    { id: 'Silver', name: 'Brushed Silver', plateClass: 'plate-silver', borderClass: 'border-slate-300' },
    { id: 'Black', name: 'Midnight Black', plateClass: 'plate-black', borderClass: 'border-amber-500' },
  ];

  const activeFont = fonts.find(f => f.id === customization.engraving_font) || fonts[0];
  const activeColor = plateColors.find(c => c.id === customization.plate_color) || plateColors[0];

  const handleLineChange = (lineNum, val) => {
    if (val.length <= maxChars) {
      onChange({
        ...customization,
        [`engraving_line${lineNum}`]: val,
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Custom Laser Engraving Studio</h3>
            <p className="text-xs text-slate-400">Personalize your award plate • Included Free with Every Trophy</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Zero Extra Charge
        </span>
      </div>

      {/* Realistic Interactive Engraving Plate Preview */}
      <div className="mb-8">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Live Plate Preview
        </label>
        
        <div className="relative p-6 sm:p-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[170px] overflow-hidden">
          {/* Subtle background ambient light */}
          <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Metal Plate Rendering */}
          <div
            className={`relative w-full max-w-md p-6 rounded-lg shadow-2xl transition-all duration-300 ${activeColor.plateClass} border-2 ${activeColor.borderClass}`}
          >
            {/* Screws/Rivets on plate corners */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-black/40 border border-white/30" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black/40 border border-white/30" />
            <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-black/40 border border-white/30" />
            <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-black/40 border border-white/30" />

            <div className={`text-center space-y-1.5 ${activeFont.previewClass}`}>
              <div className="font-bold text-sm sm:text-base leading-snug min-h-[1.25rem]">
                {customization.engraving_line1 || (
                  <span className="opacity-35 italic font-sans text-xs">Line 1: Award Title (e.g. Champion)</span>
                )}
              </div>
              <div className="font-medium text-xs sm:text-sm leading-snug min-h-[1.1rem]">
                {customization.engraving_line2 || (
                  <span className="opacity-30 italic font-sans text-xs">Line 2: Recipient Name</span>
                )}
              </div>
              {maxLines >= 3 && (
                <div className="font-normal text-[11px] sm:text-xs leading-snug opacity-90 min-h-[1rem]">
                  {customization.engraving_line3 || (
                    <span className="opacity-25 italic font-sans text-[11px]">Line 3: Date or Tournament</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input lines */}
      <div className="space-y-4 mb-6">
        {[1, 2, 3].slice(0, maxLines).map(lineNum => {
          const val = customization[`engraving_line${lineNum}`] || '';
          return (
            <div key={lineNum}>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Line {lineNum} {lineNum === 1 ? '(Header / Title)' : lineNum === 2 ? '(Recipient / Honoree)' : '(Date / Organization)'}</span>
                <span className={val.length >= maxChars ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {val.length}/{maxChars}
                </span>
              </div>
              <input
                type="text"
                placeholder={lineNum === 1 ? 'e.g. ANNUAL EXCELLENCE AWARD' : lineNum === 2 ? 'e.g. Jessica Sterling' : 'e.g. 2026 Invitational Cup'}
                value={val}
                maxLength={maxChars}
                onChange={e => handleLineChange(lineNum, e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          );
        })}
      </div>

      {/* Selectors for Font Style & Plate Finish */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-800">
        <div>
          <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            <Type className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Typography Font
          </label>
          <div className="grid grid-cols-3 gap-2">
            {fonts.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange({ ...customization, engraving_font: f.id })}
                className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                  customization.engraving_font === f.id
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            <Palette className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Plate Finish
          </label>
          <div className="grid grid-cols-3 gap-2">
            {plateColors.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ ...customization, plate_color: c.id })}
                className={`py-2 px-2 text-xs rounded-xl border text-center transition-all ${
                  customization.plate_color === c.id
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

