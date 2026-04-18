import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
const PROP_MULT: Record<string, number> = {
  residential: 1,
  condo: 0.9,
  commercial: 1.2,
  luxury: 1.3
};

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
    const saved =
      typeof window !== 'undefined'
        ? localStorage.getItem('elevore_calc_state')
        : null;

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevore_calc_state', JSON.stringify(state));
    }
  }, [state]);

  const results = useMemo(() => {
    let basePrice = 0;
    const bedKey =
      ['s', 'b1', 'b2', 'b3', 'b4', 'b5'][state.beds] || 'b5';

    if (state.svc === 'postconstruction') {
      const sqftBase = state.sqft * 0.2;
      const tableMin = BASE[state.svc][bedKey];
      basePrice = Math.max(sqftBase, tableMin);
    } else {
      basePrice = BASE[state.svc][bedKey];
    }

    const bathAdd = BATH_ADD[Math.min(state.baths, 4)];
    const propMul = PROP_MULT[state.proptype] || 1;

    const addonTotal = Object.entries(state.addons)
      .filter(([_, active]) => active)
      .reduce((sum, [key]) => sum + parseInt(key), 0);

    const subtotal = Math.round((basePrice + bathAdd) * propMul) + addonTotal;
    const discount = Math.round((subtotal * state.discPct) / 100);
    const total = subtotal - discount;

    const cost = Math.round(total * COST_PCT[state.svc]);
    const profit = total - cost;

    const estHours = Math.max(2, Math.round(total / 50));
    const hourlyRate = Math.round(total / estHours);

    return {
      total,
      basePrice,
      bathAdd,
      addonTotal,
      discount,
      profit,
      estHours,
      hourlyRate,
      marketRange: {
        min: Math.round(total * 0.85),
        max: Math.round(total * 1.15)
      }
    };
  }, [state]);

  const copyQuote = () => {
    const text = `ELEVORE QUOTE
Service: ${SVC_LABEL[state.svc]}
Property: ${state.sqft} sqft, ${state.beds} beds, ${state.baths} baths
Total: $${results.total}
Valid for 30 days.

Jose Mario Alvarez
ELEVORE Cleaning & Handyman Services
(407) 952-4228 | elevorecorporation@gmail.com`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans pb-12">
      <header className="bg-[#1a1a1a] p-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
        <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-bold">
          EL
        </div>
        <div>
          <h1 className="text-white font-semibold">ELEVORE Price Calculator</h1>
          <p className="text-[#4CAF50] text-xs">
            (407) 952-4228 · Orlando, FL
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        <section className="bg-white p-4 rounded-2xl border">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(SVC_LABEL).map(svc => (
              <button
                key={svc}
                onClick={() => setState({ ...state, svc })}
                className={`px-4 py-2 rounded-full border ${
                  state.svc === svc
                    ? 'bg-green-100 border-green-700'
                    : 'bg-gray-50'
                }`}
              >
                {SVC_LABEL[svc]}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-4 rounded-2xl border">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={state.beds}
              onChange={e =>
                setState({ ...state, beds: parseInt(e.target.value) })
              }
              className="p-2 border rounded"
            >
              <option value={0}>Studio</option>
              <option value={1}>1 bed</option>
              <option value={2}>2 beds</option>
              <option value={3}>3 beds</option>
              <option value={4}>4 beds</option>
              <option value={5}>5+ beds</option>
            </select>

            <select
              value={state.baths}
              onChange={e =>
                setState({ ...state, baths: parseInt(e.target.value) })
              }
              className="p-2 border rounded"
            >
              <option value={1}>1 bath</option>
              <option value={2}>2 baths</option>
              <option value={3}>3 baths</option>
              <option value={4}>4+ baths</option>
            </select>
          </div>
        </section>

        <motion.section className="bg-black text-white p-6 rounded-2xl">
          <div className="text-4xl font-bold">${results.total}</div>
          <div className="text-sm opacity-70">
            Range: ${results.marketRange.min} - $
            {results.marketRange.max}
          </div>
        </motion.section>

        <button
          onClick={copyQuote}
          className="w-full bg-green-700 text-white p-4 rounded-xl font-bold"
        >
          {copied ? 'Copied!' : 'Copy Quote'}
        </button>
      </main>
    </div>
  );
}
