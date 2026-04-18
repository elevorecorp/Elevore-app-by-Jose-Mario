import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Home, 
  Plus, 
  Tag, 
  Copy, 
  Check, 
  Info, 
  Clock, 
  TrendingUp, 
  DollarSign 
} from 'lucide-react';

const BASE: Record<string, Record<string, number>> = {
  regular: { s: 80, b1: 110, b2: 150, b3: 185, b4: 230, b5: 270 },
  deep: { s: 130, b1: 175, b2: 230, b3: 290, b4: 360, b5: 430 },
  moveinout: { s: 150, b1: 200, b2: 270, b3: 340, b4: 420, b5: 510 },
  airbnb: { s: 100, b1: 130, b2: 175, b3: 220, b4: 280, b5: 350 },
  postconstruction: { s: 180, b1: 240, b2: 320, b3: 410, b4: 510, b5: 620 }
};

const BATH_ADD = [0, 0, 20, 45, 70];
const PROP_MULT: Record<string, number> = { residential: 1, condo: 0.9, commercial: 1.2, luxury: 1.3 };
const SVC_LABEL: Record<string, string> = { 
  regular: 'Regular clean', 
  deep: 'Deep clean', 
  moveinout: 'Move-in/out', 
  airbnb: 'Airbnb', 
  postconstruction: 'Post-construction' 
};
const COST_PCT: Record<string, number> = { 
  regular: 0.30, 
  deep: 0.28, 
  moveinout: 0.27, 
  airbnb: 0.32, 
  postconstruction: 0.25 
};

interface AppState {
  svc: string;
  beds: number;
  baths: number;
  proptype: string;
  addons: Record<string, boolean>;
  discPct: number;
  sqft: number;
}

const DEFAULT_STATE: AppState = {
  svc: 'regular',
  beds: 2,
  baths: 2,
  proptype: 'residential',
  addons: {},
  discPct: 0,
  sqft: 1200
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('elevore_calc_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved state", e);
      }
    }
    return DEFAULT_STATE;
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('elevore_calc_state', JSON.stringify(state));
  }, [state]);

  const results = useMemo(() => {
    let basePrice = 0;
    const bedKey = ['s', 'b1', 'b2', 'b3', 'b4', 'b5'][state.beds] || 'b5';
    
    if (state.svc === 'postconstruction') {
      const sqftBase = state.sqft * 0.20;
      const tableMin = BASE[state.svc][bedKey];
      basePrice = Math.max(sqftBase, tableMin);
    } else {
      basePrice = BASE[state.svc][bedKey];
    }

    const bathAdd = BATH_ADD[Math.min(state.baths, 4)];
    const propMul = PROP_MULT[state.proptype] || 1;
    
    const addonTotal = Object.entries(state.addons)
      .filter(([_, active]) => active)
      .reduce((sum, [val]) => sum + parseInt(val), 0);

    const subtotal = Math.round((basePrice + bathAdd) * propMul) + addonTotal;
    const discount = Math.round(subtotal * state.discPct / 100);
    const total = subtotal - discount;

    const cost = Math.round(total * COST_PCT[state.svc]);
    const profit = total - cost;
    const estHours = Math.max(2, Math.round(total / 50));
    const hourlyRate = Math.round(total / estHours);

    return {
      total, basePrice, bathAdd, addonTotal, discount, profit, estHours, hourlyRate,
      marketRange: { min: Math.round(total * 0.85), max: Math.round(total * 1.15) }
    };
  }, [state]);

  const handleSvcChange = (svc: string) => setState(prev => ({ ...prev, svc }));
  const handleBedsChange = (beds: number) => setState(prev => ({ ...prev, beds }));
  const handleBathsChange = (baths: number) => setState(prev => ({ ...prev, baths }));
  const handlePropTypeChange = (proptype: string) => setState(prev => ({ ...prev, proptype }));
  const handleSqftChange = (sqft: number) => setState(prev => ({ ...prev, sqft }));
  const handleAddonToggle = (val: string) => {
    setState(prev => ({
      ...prev,
      addons: { ...prev.addons, [val]: !prev.addons[val] }
    }));
  };
  const handleDiscChange = (pct: number) => setState(prev => ({ ...prev, discPct: pct }));

  const copyQuote = () => {
    const text = `ELEVORE QUOTE\nService: ${SVC_LABEL[state.svc]}\nProperty: ${state.sqft} sqft, ${state.beds} beds, ${state.baths} baths\nTotal: $${results.total}\nValid for 30 days.\n\nJose Mario Alvarez\nELEVORE Cleaning & Handyman Services\n(407) 952-4228 | elevorecorporation@gmail.com`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans pb-12">
      <header className="bg-[#1a1a1a] p-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
        <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold text-lg">EL</div>
        <div className="flex flex-col">
          <h1 className="text-white font-semibold text-base sm:text-lg leading-tight">ELEVORE Price Calculator</h1>
          <p className="text-[#4CAF50] text-xs font-medium">(407) 952-4228 · Orlando, FL</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        <section className="bg-white rounded-2xl p-4 border border-[#e8e8e8] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Service type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SVC_LABEL).map(svc => (
              <button key={svc} onClick={() => handleSvcChange(svc)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${state.svc === svc ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]' : 'bg-[#fafafa] border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {SVC_LABEL[svc]}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 border border-[#e8e8e8] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Property details</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {state.svc === 'postconstruction' && (
                <motion.div
                  initial={{ opacity: 0, width: 0, x: -20 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -20 }}
                  className="col-span-2 flex flex-col gap-1 overflow-hidden">
                  <label className="text-xs text-gray-500 font-medium">Square Footage (SqFt)</label>
                  <input type="number" value={state.sqft}
                    onChange={(e) => handleSqftChange(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border-2 border-gray-100 bg-[#fafafa] text-sm focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-all"
                    placeholder="e.g. 1500" />
                </motion.div>
              )}
            </AnimatePresence>
            <div className={`${state.svc === 'postconstruction' ? 'col-span-1' : 'col-span-2'} flex flex-col gap-1`}>
              <label className="text-xs text-gray-500 font-medium">Bedrooms</label>
              <select value={state.beds} onChange={(e) => handleBedsChange(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border-2 border-gray-100 bg-[#fafafa] text-sm focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-all appearance-none">
                <option value={0}>Studio</option>
                <option value={1}>1 bed</option>
                <option value={2}>2 beds</option>
                <option value={3}>3 beds</option>
                <option value={4}>4 beds</option>
                <option value={5}>5+ beds</option>
              </select>
            </div>
            <div className={`${state.svc === 'postconstruction' ? 'col-span-1' : 'col-span-2'} flex flex-col gap-1`}>
              <label className="text-xs text-gray-500 font-medium">Bathrooms</label>
              <select value={state.baths} onChange={(e) => handleBathsChange(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border-2 border-gray-100 bg-[#fafafa] text-sm focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-all appearance-none">
                <option value={1}>1 bath</option>
                <option value={2}>2 baths</option>
                <option value={3}>3 baths</option>
                <option value={4}>4+ baths</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Property Type</label>
            <select value={state.proptype} onChange={(e) => handlePropTypeChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border-2 border-gray-100 bg-[#fafafa] text-sm focus:outline-none focus:border-[#2E7D32] focus:bg-white transition-all appearance-none">
              <option value="residential">Residential Home</option>
              <option value="condo">Condo / Apartment</option>
              <option value="commercial">Commercial Space</option>
              <option value="luxury">Luxury area / High-end</option>
            </select>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 border border-[#e8e8e8] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Add-ons</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Laundry', val: '20' },
              { label: 'Inside oven', val: '25' },
              { label: 'Inside fridge', val: '20' },
              { label: 'Windows', val: '30' },
              { label: 'Pet hair', val: '20' },
              { label: 'Garage', val: '35' },
            ].map(addon => (
              <button key={addon.val} onClick={() => handleAddonToggle(addon.val)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${state.addons[addon.val] ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]' : 'bg-[#fafafa] border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                + {addon.label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 border border-[#e8e8e8] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Discount</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'No discount', pct: 0 },
              { label: 'First-time 25%', pct: 25 },
              { label: 'Referral 10%', pct: 10 },
              { label: 'Repeat 5%', pct: 5 },
            ].map(disc => (
              <button key={disc.pct} onClick={() => handleDiscChange(disc.pct)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${state.discPct === disc.pct ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#1B5E20]' : 'bg-[#fafafa] border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {disc.label}
              </button>
            ))}
          </div>
        </section>

        <motion.section layout className="bg-[#1a1a1a] rounded-2xl p-6 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Recommended price</p>
              <motion.div key={results.total} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white">${results.total}</motion.div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Market Range: <span className="text-gray-400">${results.marketRange.min} - ${results.marketRange.max}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-[#E3F2FD] text-[#0D47A1] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                <Clock className="w-3 h-3" />{results.estHours}-{results.estHours + 1} hrs
              </div>
              <div className="flex items-center gap-2 bg-[#E8F5E9] text-[#1B5E20] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                <TrendingUp className="w-3 h-3" />Profit ~${results.profit}
              </div>
              <div className="flex items-center gap-2 bg-[#FFF8E1] text-[#E65100] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                <DollarSign className="w-3 h-3" />~${results.hourlyRate}/hr
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Base ({SVC_LABEL[state.svc]})</span>
              <span className="text-white font-medium">${Math.round(results.basePrice)}</span>
            </div>
            {results.bathAdd > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Baths add-on</span>
                <span className="text-white font-medium">+${results.bathAdd}</span>
              </div>
            )}
            {results.addonTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Extras</span>
                <span className="text-white font-medium">+${results.addonTotal}</span>
              </div>
            )}
            {results.discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-400 font-medium">-${results.discount}</span>
              </div>
            )}
          </div>
        </motion.section>

        <div className="bg-[#E8F5E9] border-l-4 border-[#2E7D32] rounded-r-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-[#2E7D32] shrink-0" />
          <p className="text-sm text-[#1B5E20] leading-relaxed">
            <span className="font-bold">Note:</span> {state.svc === 'postconstruction'
              ? 'Post-construction pricing is calculated at $0.20 per SqFt (minimums apply).'
              : 'Standard pricing is based on bedroom/bathroom count with property type multipliers.'}
          </p>
        </div>

        <button onClick={copyQuote} disabled={copied}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${copied ? 'bg-gray-200 text-gray-500 cursor-default' : 'bg-[#2E7D32] text-white hover:bg-[#256629] hover:shadow-xl'}`}>
          {copied ? (<><Check className="w-5 h-5" />Quote Copied!</>) : (<><Copy className="w-5 h-5" />Copy Quote to Clipboard</>)}
        </button>

        <footer className="text-center py-8 space-y-1">
          <p className="text-[#aaa] text-[10px] font-bold uppercase tracking-widest">ELEVORE 2026 Internal Tool</p>
          <p className="text-[#ccc] text-[9px]">Orlando, FL · Professional Cleaning Services</p>
        </footer>
      </main>
    </div>
  );
}
