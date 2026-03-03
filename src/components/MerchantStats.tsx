import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock, AlertCircle } from 'lucide-react';

export const MerchantReliabilityBreakdown: React.FC = () => {
  const factors = [
    { name: 'Rider Wait Variance', score: 85, status: 'Stable', color: 'bg-emerald-500' },
    { name: 'Batch Marking Accuracy', score: 92, status: 'Excellent', color: 'bg-emerald-500' },
    { name: 'Time Consistency', score: 64, status: 'Volatile', color: 'bg-orange-500' },
    { name: 'Acceptance Delay', score: 78, status: 'Good', color: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Reliability Components (MRS)</h3>
        <div className="flex items-center gap-1 text-orange-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm font-bold">8.4/10</span>
        </div>
      </div>

      <div className="space-y-5">
        {factors.map((f) => (
          <div key={f.name}>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-bold text-slate-700">{f.name}</p>
                <p className="text-[10px] text-slate-400">{f.status}</p>
              </div>
              <span className="text-xs font-black text-slate-900">{f.score}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${f.score}%` }}
                className={`h-full rounded-full ${f.color}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-700">AI Insight:</span> Merchant shows high variance during dinner peaks. SmartPrep has automatically adjusted the confidence interval by +4m for this period.
        </p>
      </div>
    </div>
  );
};
