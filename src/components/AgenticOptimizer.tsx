import React from 'react';
import { AgentAction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Activity, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface AgenticOptimizerProps {
  logs: AgentAction[];
  currentKli: number;
  waitRatio: number;
  acceptanceDelay: number;
}

export const AgenticOptimizer: React.FC<AgenticOptimizerProps> = ({ logs, currentKli, waitRatio, acceptanceDelay }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Agent Status */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500 rounded-lg text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">Agent Status</h3>
          </div>

          <div className="space-y-6">
            <StatusMetric 
              label="Kitchen Load (KLI)" 
              value={`${(currentKli * 100).toFixed(0)}%`} 
              status={currentKli > 0.8 ? 'critical' : currentKli > 0.6 ? 'warning' : 'optimal'}
            />
            <StatusMetric 
              label="Rider Wait Ratio" 
              value={`${(waitRatio * 100).toFixed(0)}%`} 
              status={waitRatio > 0.4 ? 'critical' : 'optimal'}
            />
            <StatusMetric 
              label="Acceptance Delay" 
              value={`${acceptanceDelay}s`} 
              status={acceptanceDelay > 120 ? 'warning' : 'optimal'}
            />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-bold">AI Optimization Loop</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The agent continuously monitors platform metrics and adjusts the Kitchen Load Index (KLI) to prevent ecosystem bottlenecks.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Active Monitoring</span>
          </div>
        </div>
      </div>

      {/* Right Column: Decision Log */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-800">Decision Log</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 10 Actions</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.kliAdjustment < 0 ? 'bg-rose-100 text-rose-600' : 
                        log.kliAdjustment > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {log.kliAdjustment === 0 ? 'No Change' : `${log.kliAdjustment > 0 ? '+' : ''}${log.kliAdjustment} KLI`}
                      </span>
                    </div>
                    {log.kliAdjustment !== 0 ? <AlertCircle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observation</p>
                    <p className="text-xs text-slate-600 font-medium">{log.observation}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Decision</p>
                    <p className="text-xs text-slate-800 font-bold">{log.decision}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Action</p>
                      <p className="text-[10px] text-slate-600 leading-tight">{log.action}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Predicted Impact</p>
                      <p className="text-[10px] text-emerald-600 font-bold leading-tight">{log.impact}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusMetric = ({ label, value, status }: { label: string, value: string, status: 'optimal' | 'warning' | 'critical' }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className={`text-lg font-black ${
        status === 'critical' ? 'text-rose-500' : 
        status === 'warning' ? 'text-amber-500' : 'text-emerald-500'
      }`}>{value}</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-500 ${
        status === 'critical' ? 'bg-rose-500' : 
        status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
      }`} style={{ width: value }} />
    </div>
  </div>
);
