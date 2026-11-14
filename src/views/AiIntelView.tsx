import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { api } from '../api/client.ts';

export const AiIntelView: React.FC = () => {
  const [query, setQuery] = useState('Current Mumbai monsoon rainfall warnings, waterlogging hotspots, and local train disruptions');
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<any>(null);

  const presets = [
    'Current Mumbai monsoon rainfall warnings, waterlogging hotspots, and local train disruptions',
    'Mithi river flood barrier operations, high tide timing, and Kurla evacuation readiness',
    'Suburban railway waterlogging at Sion, Kurla, Dadar, and Western railway track status',
    'Emergency helpline numbers, BMC disaster management control room advisories',
  ];

  const handleFetchIntel = async (q?: string) => {
    const searchQuery = q || query;
    setLoading(true);
    try {
      const res = await api.getGroundedIntel(searchQuery);
      setIntel(res.intelligence);
    } catch (err: any) {
      alert(err.message || 'Failed to retrieve AI intelligence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Grounded Disaster Intelligence</h1>
            <span className="rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
              GEMINI 3.8-FLASH + GOOGLE SEARCH GROUNDING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification of official IMD warnings, MCGM advisories, and transit alerts via server-side grounded models
          </p>
        </div>
      </div>

      {/* Query Bar & Presets */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchIntel();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask for grounded disaster intelligence or local advisory updates..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Synthesizing...' : 'Query Intel'}</span>
          </button>
        </form>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 block">Suggested Quick Grounding Queries:</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleFetchIntel(p);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-left text-[11px] text-slate-300 hover:border-slate-700 hover:text-white transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Output Display */}
      {intel ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase ${
                    intel.alertLevel === 'RED'
                      ? 'bg-rose-600 text-white'
                      : intel.alertLevel === 'ORANGE'
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  IMD ALERT LEVEL: {intel.alertLevel}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Synthesized: {new Date(intel.timestamp).toLocaleTimeString()}</span>
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-white tracking-tight">Executive Situation Summary</h2>
            </div>

            <div className="rounded-lg bg-slate-950 px-3 py-1.5 border border-slate-800 text-[11px] font-mono text-cyan-400">
              Model: {intel.model}
            </div>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            {intel.summary}
          </div>

          {/* Actionable Advisories */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Verified Operational Advisories:</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {intel.actionableAdvisories.map((adv: string, i: number) => (
                <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 flex items-start gap-2">
                  <span className="h-4 w-4 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-[10px] font-bold text-cyan-300 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{adv}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grounding Source URLs & Citations */}
          <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
            <span className="font-bold text-slate-400 block">Grounding Sources & Official Citations:</span>
            <div className="flex flex-wrap gap-2">
              {intel.groundingSources.map((src: any, idx: number) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-cyan-400 hover:border-cyan-700 hover:text-cyan-300 transition-all"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400 text-xs">
          Enter a prompt or click one of the suggested grounding queries above to trigger real-time Google Search grounding.
        </div>
      )}
    </div>
  );
};
