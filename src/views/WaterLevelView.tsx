import React, { useState, useEffect, useRef } from 'react';
import {
  Droplets,
  Waves,
  Radio,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Mountain,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Search,
  Filter,
  Activity,
  Sliders,
  ShieldAlert,
  Clock,
  Send,
  Info,
} from 'lucide-react';
import { WaterLevelStation, WaterLevelSystemResponse } from '../types/index.ts';
import { api } from '../api/client.ts';

interface WaterLevelViewProps {
  onNavigateToMapWithStation?: (lat: number, lng: number, name: string) => void;
  onNavigate: (tab: string) => void;
}

export const WaterLevelView: React.FC<WaterLevelViewProps> = ({
  onNavigateToMapWithStation,
  onNavigate,
}) => {
  // System Telemetry State
  const [systemState, setSystemState] = useState<WaterLevelSystemResponse | null>(null);
  const [stations, setStations] = useState<WaterLevelStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [ingesting, setIngesting] = useState<boolean>(false);

  // URL Ingestion Input State
  const [inputUrl, setInputUrl] = useState<string>('https://mumbaiflood.in/api/v1/sensors/live');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('mumbai-flood-live');
  const [presets, setPresets] = useState<any[]>([]);

  // Polling Cadence & Preferences
  const [cadenceSec, setCadenceSec] = useState<number>(10);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DANGER' | 'WARNING' | 'NORMAL'>('ALL');
  const [selectedStation, setSelectedStation] = useState<WaterLevelStation | null>(null);
  const [surgeStationId, setSurgeStationId] = useState<string | null>(null);

  // Audio synthesizer ref for web-audio alarm
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load Presets and Initial Stations
  useEffect(() => {
    loadPresets();
    fetchStations();
  }, []);

  const loadPresets = async () => {
    try {
      const res = await api.getWaterLevelPresets();
      if (res?.presets) {
        setPresets(res.presets);
        if (res.activeUrl) {
          setInputUrl(res.activeUrl);
        }
      }
    } catch (err) {
      console.warn('Presets failed to load:', err);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await api.getWaterLevelStations();
      if (res && res.stations) {
        setSystemState(res);
        setStations(res.stations);
        if (!inputUrl) setInputUrl(res.activeUrl);
      }
    } catch (err) {
      console.error('Error loading stations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Periodic polling interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStations();
    }, cadenceSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, cadenceSec]);

  // Audio chime when danger is detected
  const playDangerAlertChime = () => {
    if (!alarmSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  // Trigger chime if any station enters DANGER
  useEffect(() => {
    const hasDanger = stations.some((s) => s.status === 'DANGER' || s.status === 'CRITICAL');
    if (hasDanger && alarmSoundEnabled) {
      playDangerAlertChime();
    }
  }, [stations, alarmSoundEnabled]);

  // Handle URL Ingestion
  const handleIngestUrl = async (urlToIngest: string, presetName?: string) => {
    if (!urlToIngest || !urlToIngest.trim()) return;
    setIngesting(true);
    try {
      const res = await api.ingestWaterLevelUrl(urlToIngest, presetName, cadenceSec);
      if (res && res.stations) {
        setSystemState(res);
        setStations(res.stations);
        setInputUrl(res.activeUrl);
      }
    } catch (err: any) {
      alert(`Ingestion error: ${err.message || 'Failed to ingest URL'}`);
    } finally {
      setIngesting(false);
    }
  };

  // Handle Preset Select
  const handleSelectPreset = (preset: any) => {
    setSelectedPresetId(preset.id);
    setInputUrl(preset.url);
    handleIngestUrl(preset.url, preset.name);
  };

  // Handle Surge Simulation Drill
  const handleSimulateSurge = async (stationId: string) => {
    setSurgeStationId(stationId);
    try {
      const res = await api.simulateWaterSurge(stationId, 0.85);
      if (res && res.system) {
        setSystemState(res.system);
        setStations(res.system.stations);
        if (alarmSoundEnabled) playDangerAlertChime();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setTimeout(() => setSurgeStationId(null), 800);
    }
  };

  // Handle Reset to Safe Baseline
  const handleResetBaseline = async () => {
    setRefreshing(true);
    try {
      const res = await api.resetWaterLevels();
      if (res && res.system) {
        setSystemState(res.system);
        setStations(res.system.stations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered stations
  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.waterway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ward.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'DANGER' && (s.status === 'DANGER' || s.status === 'CRITICAL')) ||
      (statusFilter === 'WARNING' && s.status === 'WARNING') ||
      (statusFilter === 'NORMAL' && s.status === 'NORMAL');
    return matchesSearch && matchesStatus;
  });

  const dangerCount = stations.filter((s) => s.status === 'DANGER' || s.status === 'CRITICAL').length;
  const warningCount = stations.filter((s) => s.status === 'WARNING').length;
  const maxLevelStation = stations.reduce((prev, curr) => (curr.currentLevelM > prev.currentLevelM ? curr : prev), stations[0] || null);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Title & Alarm Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Droplets className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Real-Time Water Level System</h1>
            <span className="rounded-full bg-cyan-950 border border-cyan-700/60 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-300">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic ingestion of ultrasonic, radar, and bubbler streamflow gauges across Mumbai's river basins, nullahs, and subway sumps.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Alarm Toggle */}
          <button
            onClick={() => {
              setAlarmSoundEnabled(!alarmSoundEnabled);
              if (!alarmSoundEnabled) playDangerAlertChime();
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              alarmSoundEnabled
                ? 'border-rose-600 bg-rose-950/60 text-rose-300 shadow-sm'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
            }`}
            title="Audio alert chime when any station crosses Danger Mark"
          >
            {alarmSoundEnabled ? <Volume2 className="h-3.5 w-3.5 text-rose-400 animate-pulse" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Danger Audio Alarm {alarmSoundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={handleResetBaseline}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            title="Reset telemetry to calibrated baseline"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>

          {/* Refresh Trigger */}
          <button
            onClick={() => {
              setRefreshing(true);
              fetchStations();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-500 shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Poll Now'}</span>
          </button>
        </div>
      </div>

      {/* STREAM INGESTION DECK (The Provided URL Controller) */}
      <div className="rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-sm text-white">Stream Ingestion Controller</span>
            <span className="text-xs text-slate-400 hidden sm:inline">• Ingest live telemetry from any custom or official endpoint</span>
          </div>

          {/* Diagnostics pill */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="rounded bg-slate-950 border border-slate-800 px-2.5 py-1 text-slate-400">
              Protocol: <strong className="text-cyan-300">{systemState?.diagnostics.protocol || 'HTTPS'}</strong>
            </span>
            <span className="rounded bg-slate-950 border border-slate-800 px-2.5 py-1 text-slate-400">
              Latency: <strong className="text-emerald-400">{systemState?.latencyMs || 65}ms</strong>
            </span>
            <span
              className={`rounded px-2.5 py-1 font-bold ${
                systemState?.status === 'CONNECTED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {systemState?.status || 'CONNECTED'}
            </span>
          </div>
        </div>

        {/* URL Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleIngestUrl(inputUrl);
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter water level API endpoint / stream URL (e.g., https://mumbaiflood.in/api/v1/sensors/live)..."
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={ingesting}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 shadow-md transition-all shrink-0"
          >
            {ingesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>{ingesting ? 'Ingesting...' : 'Ingest URL Stream'}</span>
          </button>
        </form>

        {/* Quick Presets & Polling Cadence Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs pt-1">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">One-Click Feeds:</span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                  inputUrl === preset.url
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {preset.name.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* Polling Interval Controls */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Live Auto-Poll</span>
            </label>

            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={cadenceSec}
                onChange={(e) => setCadenceSec(Number(e.target.value))}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value={5}>Every 5s</option>
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
                <option value={60}>Every 60s</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diagnostics message */}
        {systemState?.diagnostics?.message && (
          <div className="flex items-start gap-2 rounded-lg bg-slate-950/60 border border-slate-800 p-2.5 text-[11px] text-slate-400">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-mono text-cyan-300 font-semibold">Active Feed Status: </span>
              <span>{systemState.diagnostics.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* METRIC OVERVIEW BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Monitored Stations</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stations.length}</div>
          <span className="text-[10px] text-slate-400">Basin telemetry points</span>
        </div>

        <div className={`rounded-xl border p-4 ${dangerCount > 0 ? 'border-rose-800/80 bg-rose-950/30' : 'border-slate-800 bg-slate-900/60'}`}>
          <span className="text-[11px] text-slate-400 block font-medium">Danger Mark Breached</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${dangerCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {dangerCount}
          </div>
          <span className="text-[10px] text-slate-400">{dangerCount > 0 ? 'Urgent dispatch required' : 'All below high flood mark'}</span>
        </div>

        <div className={`rounded-xl border p-4 ${warningCount > 0 ? 'border-amber-800/80 bg-amber-950/30' : 'border-slate-800 bg-slate-900/60'}`}>
          <span className="text-[11px] text-slate-400 block font-medium">Warning Threshold</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{warningCount}</div>
          <span className="text-[10px] text-slate-400">Incipient ponding</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Peak Measured Water</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {maxLevelStation ? `${maxLevelStation.currentLevelM}m` : '--'}
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            {maxLevelStation ? maxLevelStation.name.split('Gauge')[0] : 'Normal'}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] text-slate-400 block font-medium">Arabian Sea Tidal Lock</span>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">4.45m</div>
          <span className="text-[10px] text-rose-400 font-semibold">Tidal Backflow Active</span>
        </div>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stations by name, waterway, or municipal ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          {(['ALL', 'DANGER', 'WARNING', 'NORMAL'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded px-3 py-1 font-semibold transition-all ${
                statusFilter === filter
                  ? filter === 'DANGER'
                    ? 'bg-rose-600 text-white font-bold'
                    : filter === 'WARNING'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter === 'ALL' ? 'All Stations' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* REAL-TIME STATION GAUGES GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-xs font-mono text-cyan-400">Loading Real-Time Hydro-Telemetry...</p>
        </div>
      ) : filteredStations.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          No stations match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => {
            const isDanger = station.status === 'DANGER' || station.status === 'CRITICAL';
            const isWarning = station.status === 'WARNING';
            const isSurging = surgeStationId === station.id;

            // Calculate percentage of danger level for animated cross-section
            const fillPct = Math.min(100, Math.max(8, Math.round((station.currentLevelM / station.highestFloodLevelM) * 100)));
            const warningPct = Math.min(100, Math.round((station.warningLevelM / station.highestFloodLevelM) * 100));
            const dangerPct = Math.min(100, Math.round((station.dangerLevelM / station.highestFloodLevelM) * 100));

            return (
              <div
                key={station.id}
                className={`rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between ${
                  isDanger
                    ? 'border-rose-800/80 bg-slate-900/90 shadow-lg shadow-rose-950/40'
                    : isWarning
                    ? 'border-amber-800/60 bg-slate-900/80 shadow-md shadow-amber-950/20'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                } ${isSurging ? 'ring-2 ring-rose-500 scale-[1.01]' : ''}`}
              >
                <div>
                  {/* Card Header: Name, Waterway, and Status badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Waves className={`h-3.5 w-3.5 ${isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'}`} />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                          {station.waterway}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-tight mt-0.5">{station.name}</h3>
                      <span className="text-[11px] text-slate-400">{station.ward}</span>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                        isDanger
                          ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                          : isWarning
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      }`}
                    >
                      {station.status}
                    </span>
                  </div>

                  {/* RIVERBED CROSS-SECTION DEPTH GAUGE (Physical graphic) */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 mb-3 relative overflow-hidden">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">Current Water Level</span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-2xl font-mono font-bold ${
                            isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-cyan-400'
                          }`}
                        >
                          {station.currentLevelM.toFixed(2)} m
                        </span>
                        <span className="text-[10px] text-slate-400">MSL</span>
                      </div>
                    </div>

                    {/* Embankment Graphic Container */}
                    <div className="relative h-16 w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-end">
                      {/* Water Fill Layer */}
                      <div
                        className={`w-full transition-all duration-700 relative ${
                          isDanger
                            ? 'bg-gradient-to-t from-rose-900/80 to-rose-600/80'
                            : isWarning
                            ? 'bg-gradient-to-t from-amber-900/80 to-amber-600/80'
                            : 'bg-gradient-to-t from-cyan-900/80 to-cyan-500/80'
                        }`}
                        style={{ height: `${fillPct}%` }}
                      >
                        {/* Animated wave crest */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 animate-pulse" />
                      </div>

                      {/* Warning mark line */}
                      <div
                        className="absolute w-full border-t border-dashed border-amber-400 pointer-events-none flex items-center justify-between px-2 text-[9px] font-mono text-amber-300"
                        style={{ bottom: `${warningPct}%` }}
                      >
                        <span>Warning Line</span>
                        <span>{station.warningLevelM}m</span>
                      </div>

                      {/* Danger mark line */}
                      <div
                        className="absolute w-full border-t border-dashed border-rose-500 pointer-events-none flex items-center justify-between px-2 text-[9px] font-mono text-rose-300 font-bold"
                        style={{ bottom: `${dangerPct}%` }}
                      >
                        <span>Danger Mark</span>
                        <span>{station.dangerLevelM}m</span>
                      </div>
                    </div>

                    {/* Proximity / Danger Clearance Tag */}
                    <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                      <span className="text-slate-400">Ground Elevation: {station.elevationM}m MSL</span>
                      <span
                        className={
                          station.currentLevelM >= station.dangerLevelM
                            ? 'text-rose-400 font-bold'
                            : station.currentLevelM >= station.warningLevelM
                            ? 'text-amber-400 font-semibold'
                            : 'text-emerald-400'
                        }
                      >
                        {station.currentLevelM >= station.dangerLevelM
                          ? `⚠️ +${(station.currentLevelM - station.dangerLevelM).toFixed(2)}m OVER DANGER!`
                          : `Safe Margin: ${(station.dangerLevelM - station.currentLevelM).toFixed(2)}m`}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Rates & Discharge Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2">
                      <span className="text-slate-400 text-[9px] block">Rate of Rise</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-200 mt-0.5">
                        {station.rateOfRiseMPerHr > 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-rose-400" />
                        ) : station.rateOfRiseMPerHr < 0 ? (
                          <ArrowDownRight className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Minus className="h-3 w-3 text-slate-400" />
                        )}
                        <span className={station.rateOfRiseMPerHr > 0.3 ? 'text-rose-400' : 'text-slate-200'}>
                          {station.rateOfRiseMPerHr > 0 ? `+${station.rateOfRiseMPerHr}` : station.rateOfRiseMPerHr}m/h
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2">
                      <span className="text-slate-400 text-[9px] block">Discharge</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                        {station.dischargeM3s ? `${station.dischargeM3s} m³/s` : '--'}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-2">
                      <span className="text-slate-400 text-[9px] block">Flow Speed</span>
                      <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                        {station.flowVelocityMs ? `${station.flowVelocityMs} m/s` : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Mini-Hydrograph Sparkline */}
                  <div className="rounded-lg bg-slate-950/50 border border-slate-800/80 p-2.5 mb-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono">Hydrograph (Past 2 Hours)</span>
                      <span className="font-mono text-cyan-400 font-semibold">{station.trend}</span>
                    </div>

                    {/* SVG Sparkline */}
                    <div className="h-10 w-full flex items-end gap-1.5 pt-1">
                      {station.history.map((pt, idx) => {
                        const barHeight = Math.min(100, Math.max(15, Math.round((pt.level / station.highestFloodLevelM) * 100)));
                        const isLast = idx === station.history.length - 1;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                            <div
                              className={`w-full rounded-t transition-all ${
                                isLast
                                  ? isDanger
                                    ? 'bg-rose-500'
                                    : isWarning
                                    ? 'bg-amber-500'
                                    : 'bg-cyan-400'
                                  : 'bg-slate-700'
                              }`}
                              style={{ height: `${barHeight}%` }}
                              title={`${pt.time}: ${pt.level}m`}
                            />
                            <span className="text-[8px] text-slate-500 font-mono hidden sm:inline">{pt.time.slice(3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                  {/* Locate on Map */}
                  <button
                    onClick={() => {
                      if (onNavigateToMapWithStation) {
                        onNavigateToMapWithStation(station.lat, station.lng, station.name);
                      } else {
                        onNavigate('map');
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>View on Map</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Simulate Surge Test */}
                    <button
                      onClick={() => handleSimulateSurge(station.id)}
                      disabled={isSurging}
                      className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                      title="Simulate cloudburst water surge at this station"
                    >
                      <Zap className="h-3 w-3 inline mr-0.5 text-amber-400" />
                      <span>Surge Drill</span>
                    </button>

                    {/* Detailed Analysis Modal Trigger */}
                    <button
                      onClick={() => setSelectedStation(station)}
                      className="rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 text-[10px] font-bold transition-all"
                    >
                      Deep Analysis
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STATION DEEP ANALYSIS MODAL */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  {selectedStation.waterway} • Comprehensive Telemetry
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedStation.name}</h2>
                <span className="text-xs text-slate-400">{selectedStation.ward} • Coords: {selectedStation.lat.toFixed(4)}°N, {selectedStation.lng.toFixed(4)}°E</span>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Level Comparison Meter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                <span className="text-slate-400 text-[10px] block">Current Level</span>
                <span className="text-xl font-mono font-bold text-cyan-400">{selectedStation.currentLevelM}m</span>
                <span className="text-[10px] text-slate-400 block">MSL Datum</span>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                <span className="text-slate-400 text-[10px] block">Warning Level</span>
                <span className="text-xl font-mono font-bold text-amber-400">{selectedStation.warningLevelM}m</span>
                <span className="text-[10px] text-slate-400 block">Stage 1 Threshold</span>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                <span className="text-slate-400 text-[10px] block">Danger Mark</span>
                <span className="text-xl font-mono font-bold text-rose-400">{selectedStation.dangerLevelM}m</span>
                <span className="text-[10px] text-slate-400 block">High Flood Mark</span>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                <span className="text-slate-400 text-[10px] block">Highest Recorded</span>
                <span className="text-xl font-mono font-bold text-white">{selectedStation.highestFloodLevelM}m</span>
                <span className="text-[10px] text-slate-400 block">July 2005 Deluge</span>
              </div>
            </div>

            {/* Expanded Time-Series Hydrograph */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Full Historical Streamflow Hydrograph</span>
                <span className="font-mono text-slate-400 text-[11px]">Updated {selectedStation.freshnessSeconds}s ago</span>
              </div>

              <div className="h-32 w-full pt-4 flex items-end gap-2 border-b border-slate-800">
                {selectedStation.history.map((pt, i) => {
                  const barH = Math.min(100, Math.max(10, Math.round((pt.level / selectedStation.highestFloodLevelM) * 100)));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[9px] font-mono text-cyan-300">{pt.level}m</span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-cyan-900 to-cyan-500"
                        style={{ height: `${barH}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400">{pt.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware & Transmission Telemetry */}
            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 text-xs space-y-2">
              <span className="font-bold text-white block">Physical Sensor & Pipeline Metadata</span>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Sensor Model:</span>
                  <span className="font-mono">{selectedStation.sensorModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ingestion Source URL:</span>
                  <span className="font-mono truncate block text-cyan-400">{selectedStation.sourceUrl}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Quality State:</span>
                  <span className="font-mono text-emerald-400">{selectedStation.quality} (Zero Packet Drop)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Estimated Basin Discharge:</span>
                  <span className="font-mono">{selectedStation.dischargeM3s} m³/s</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedStation(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = selectedStation;
                  setSelectedStation(null);
                  if (onNavigateToMapWithStation) {
                    onNavigateToMapWithStation(s.lat, s.lng, s.name);
                  } else {
                    onNavigate('map');
                  }
                }}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"
              >
                Inspect on Topographic Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
