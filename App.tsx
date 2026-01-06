
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Video, 
  Zap, 
  CheckCircle, 
  Clock, 
  BarChart, 
  Sparkles, 
  RefreshCw, 
  Rocket, 
  Image as ImageIcon, 
  Volume2, 
  Download, 
  Mic,
  ShieldCheck,
  TrendingUp,
  History,
  Activity,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { AppTab, LogEntry, ContentMetadata } from './types';
import { generateContentMetadata, generateThumbnail, generateSpeech, decodeAudio } from './services/geminiService';

const glassEffect = "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl";

// --- Mock Stats Data ---
const statsData = [
  { name: '00:00', reach: 400, conv: 240 },
  { name: '04:00', reach: 300, conv: 139 },
  { name: '08:00', reach: 200, conv: 980 },
  { name: '12:00', reach: 278, conv: 390 },
  { name: '16:00', reach: 189, conv: 480 },
  { name: '20:00', reach: 239, conv: 380 },
  { name: '23:59', reach: 349, conv: 430 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [niche, setNiche] = useState("Quantum Computing for Beginners");
  
  const [aiContent, setAiContent] = useState<ContentMetadata | null>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: new Date().toLocaleTimeString(), msg: 'Core: Ultra-Fast mode initialized.', type: 'success' },
    { time: new Date().toLocaleTimeString(), msg: 'Security: Zero-Error Shield Active.', type: 'info' }
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);

  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 10));
  }, []);

  const runFullAutomation = async () => {
    if (generating) return;
    setGenerating(true);
    addLog(`Initiating generation for: ${niche}`, 'info');

    try {
      // 1. Generate Metadata
      addLog('Synthesizing metadata structure...', 'info');
      const metadata = await generateContentMetadata(niche);
      setAiContent(metadata);
      addLog('Metadata synthesized successfully.', 'success');

      // 2. Generate Image
      addLog('Rendering neural thumbnail...', 'info');
      const img = await generateThumbnail(metadata.thumbnailPrompt);
      setThumbnail(img);
      addLog('Neural canvas render complete.', 'success');

    } catch (error) {
      addLog(`Generation error: ${error instanceof Error ? error.message : 'Unknown'}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const playVoicePreview = async () => {
    if (!aiContent || isPlayingVoice) return;
    setIsPlayingVoice(true);
    addLog('Synthesizing neural voice output...', 'info');

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const base64Audio = await generateSpeech(aiContent.title);
      const buffer = await decodeAudio(base64Audio, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingVoice(false);
      source.start(0);
      addLog('Voice stream active.', 'success');
    } catch (err) {
      addLog('Voice synthesis failed.', 'error');
      setIsPlayingVoice(false);
    }
  };

  // Auto-Pilot Side Effect
  useEffect(() => {
    let timer: any;
    if (isAutoPilot) {
      addLog('Auto-Pilot: Scanning niche trends...', 'success');
      timer = setInterval(() => {
        const triggers = ["Metadata Syncing...", "Thumbnails rendering...", "Voice synthesis active...", "SEO Analysis complete."];
        addLog(`Auto: ${triggers[Math.floor(Math.random() * triggers.length)]}`);
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isAutoPilot, addLog]);

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <nav className="w-20 lg:w-72 bg-white border-r border-slate-200 flex flex-col py-8 px-4 transition-all duration-300">
        <div className="flex items-center gap-3 mb-10 px-4 group cursor-pointer" onClick={() => setActiveTab(AppTab.DASHBOARD)}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 transform group-hover:rotate-12 transition-transform">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter hidden lg:block text-slate-800 uppercase italic">Ultra-AI</span>
        </div>
        
        <div className="space-y-2 flex-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === AppTab.DASHBOARD} onClick={() => setActiveTab(AppTab.DASHBOARD)} />
          <NavItem icon={Video} label="Content Factory" active={activeTab === AppTab.CONTENT} onClick={() => setActiveTab(AppTab.CONTENT)} />
          <NavItem icon={Mic} label="Neural Voice" active={activeTab === AppTab.VOICE} onClick={() => setActiveTab(AppTab.VOICE)} />
          <NavItem icon={BarChart} label="Analytics" active={activeTab === AppTab.STATS} onClick={() => setActiveTab(AppTab.STATS)} />
        </div>

        <div className="p-4 bg-slate-900 rounded-3xl hidden lg:block overflow-hidden relative group">
           <div className="relative z-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Secure Core</span>
              </div>
              <p className="text-xs font-bold opacity-70 mb-4">API v3.0 Active</p>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 transition-all duration-1000 ${generating ? 'w-full' : 'w-1/3 animate-pulse'}`}></div>
              </div>
           </div>
           <Cpu className="absolute -bottom-4 -right-4 h-20 w-20 text-white/5 group-hover:scale-125 transition-transform duration-700" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth custom-scrollbar">
        
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              System Console <ChevronRight className="h-5 w-5 text-indigo-500" />
              <span className="text-indigo-600 italic uppercase">{activeTab}</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Real-time processing powered by Gemini-3 Flash</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`${glassEffect} px-6 py-2 rounded-full flex items-center gap-4 border border-slate-200`}>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Auto-Pilot</span>
                <button 
                  onClick={() => setIsAutoPilot(!isAutoPilot)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isAutoPilot ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isAutoPilot ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
             <button className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                <RefreshCw className="h-5 w-5 text-slate-500" />
             </button>
          </div>
        </div>

        {activeTab === AppTab.DASHBOARD && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <QuickStat icon={Zap} label="Response" value="120ms" color="bg-orange-50 text-orange-600" />
              <QuickStat icon={ShieldCheck} label="Accuracy" value="99.4%" color="bg-green-50 text-green-600" />
              <QuickStat icon={TrendingUp} label="Traffic" value="+12.5k" color="bg-blue-50 text-blue-600" />
              <QuickStat icon={Activity} label="Threads" value="16 Core" color="bg-purple-50 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                    <div className="w-full">
                       <label className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter mb-2 block">Content Topic / Niche</label>
                       <input 
                        type="text" 
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="Enter niche..." 
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all"
                       />
                    </div>
                    <button 
                      onClick={runFullAutomation}
                      disabled={generating}
                      className="w-full md:w-auto px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {generating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                      {generating ? 'PROCESSING...' : 'INITIATE SYNC'}
                    </button>
                  </div>

                  {aiContent ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fadeIn">
                      <div className="space-y-6">
                        <div className="relative group rounded-[2rem] overflow-hidden bg-slate-900 aspect-video shadow-2xl border-4 border-white">
                          <img src={thumbnail || "https://picsum.photos/seed/ultra/800/450"} alt="AI Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                <ImageIcon className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Neural Render</span>
                             </div>
                             <p className="text-xs text-white font-medium italic line-clamp-2">"{aiContent.thumbnailPrompt}"</p>
                          </div>
                        </div>
                        <button 
                          onClick={playVoicePreview}
                          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all border-2 ${isPlayingVoice ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'}`}
                        >
                          {isPlayingVoice ? <Volume2 className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                          {isPlayingVoice ? 'Voice Streaming...' : 'Preview Neural Title'}
                        </button>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/30">
                          <span className="text-[10px] font-black uppercase text-indigo-600 mb-2 block">Primary Title</span>
                          <h3 className="text-xl font-black text-slate-800 leading-tight">{aiContent.title}</h3>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <span className="text-[10px] font-black uppercase text-slate-400 mb-2 block">SEO Description</span>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{aiContent.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {aiContent.hashtags.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-indigo-600 shadow-sm">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                      <Sparkles className="h-10 w-10 mb-4 animate-pulse" />
                      <p className="font-bold">Awaiting Input Parameters</p>
                    </div>
                  )}
                </section>

                {/* Performance Chart */}
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-[400px]">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <History className="h-6 w-6 text-indigo-500" /> Real-time Performance
                  </h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={statsData}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="reach" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </section>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-8">
                {/* Console Logs */}
                <div className="bg-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl border border-white/5 font-mono text-white">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ultra-Fast Logs</span>
                    <div className="flex gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                       <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>
                       <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <div className="space-y-4 h-64 overflow-y-auto custom-scrollbar pr-2">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-[11px] animate-fadeIn leading-relaxed">
                        <span className="text-slate-500 font-bold opacity-60">[{log.time}]</span>
                        <span className={log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-indigo-300'}>
                          <span className="opacity-50 mr-1">&gt;</span>{log.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Queue Stats */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" /> Processing Queue
                  </h3>
                  <div className="space-y-4">
                    <TaskItem label="Niche Trend Scan" status="complete" />
                    <TaskItem label="Gemini Core Sync" status="complete" />
                    <TaskItem label="Thumbnail Synthesis" status={generating ? "active" : aiContent ? "complete" : "pending"} />
                    <TaskItem label="SEO Meta Finalization" status={aiContent ? "complete" : "pending"} />
                  </div>
                </section>

                <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10 text-center">
                    <div className="bg-white/10 p-5 rounded-2xl w-fit mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500">
                       <Rocket className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h4 className="text-2xl font-black mb-2 italic">Fast-Track Active</h4>
                    <p className="text-xs text-slate-400 mb-8 font-medium">Harnessing Gemini's Flash models for near-zero latency generation.</p>
                    <button 
                      onClick={() => addLog('Downloading all processed assets...', 'info')}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                       <Download className="h-4 w-4" /> Export All Assets
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== AppTab.DASHBOARD && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-fadeIn">
             <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center">
                <Cpu className="h-16 w-16 text-indigo-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase italic">Tab Initializing...</h2>
                <p className="font-medium max-w-xs">Module under high-load optimization. Check back in a few clock cycles.</p>
                <button 
                  onClick={() => setActiveTab(AppTab.DASHBOARD)}
                  className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase"
                >
                  Return to Core
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Internal Helper Components ---

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-5 rounded-[1.5rem] transition-all group ${active ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon className={`h-5 w-5 ${active ? 'text-indigo-400' : 'group-hover:text-indigo-500'} transition-colors`} />
      <span className="text-sm font-black hidden lg:block tracking-tighter uppercase italic">{label}</span>
    </button>
  );
}

function QuickStat({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 lg:p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
       <div className={`p-3 rounded-xl mb-3 ${color}`}>
          <Icon className="h-5 w-5" />
       </div>
       <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{label}</span>
       <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}

function TaskItem({ label, status }: { label: string, status: 'complete' | 'active' | 'pending' }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white transition-all hover:shadow-sm">
      <span className={`text-xs font-bold ${status === 'complete' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{label}</span>
      {status === 'complete' ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : status === 'active' ? (
        <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <div className="h-2 w-2 rounded-full bg-slate-200"></div>
      )}
    </div>
  );
}
