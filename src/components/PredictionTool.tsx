import React, { useState, useEffect } from 'react';
import { CuisineType, WholeOrderFeatures, PredictionResult, OrderItem } from '../types';
import { predictWholeOrderKPT, scrapeOrder } from '../utils/simulation';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, Info, IndianRupee, CloudRain, Zap, ShoppingBag, Layers, Hash } from 'lucide-react';

export const PredictionTool: React.FC = () => {
  const [features, setFeatures] = useState<WholeOrderFeatures>({
    orderId: 'ORD-7721',
    items: scrapeOrder('Biryani', 3),
    cuisineDiversity: 0.4,
    parallelPrepFeasibility: 0.7,
    cookingOverlap: 0.5,
    isPeakHour: false,
    isFestival: false,
    weatherCondition: 'Clear',
    merchantReliability: 0.85,
    kitchenLoad: 0.4
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  useEffect(() => {
    setPrediction(predictWholeOrderKPT(features));
  }, [features]);

  const cuisines: CuisineType[] = ['Biryani', 'Dosa', 'Chaat', 'Pizza', 'North Indian', 'South Indian', 'Fast Food'];

  const handleCuisineChange = (cuisine: CuisineType) => {
    setFeatures({
      ...features,
      items: scrapeOrder(cuisine, features.items.length)
    });
  };

  const handleItemCountChange = (count: number) => {
    const currentCuisine = 'Biryani'; // Simplified for demo
    setFeatures({
      ...features,
      items: scrapeOrder(currentCuisine, count)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800">Whole-Order Config</h3>
        </div>

        <div className="space-y-4">
          {/* Item Count */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Number of Dishes</label>
            <input 
              type="range" min="1" max="8" value={features.items.length}
              onChange={(e) => handleItemCountChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between mt-1 text-xs font-medium text-slate-500">
              <span>1</span>
              <span className="text-orange-600 font-bold">{features.items.length} unique dishes</span>
              <span>8</span>
            </div>
          </div>

          {/* Kitchen Load */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Kitchen Load Index (KLI)</label>
            <input 
              type="range" min="0" max="1" step="0.1" value={features.kitchenLoad}
              onChange={(e) => setFeatures({...features, kitchenLoad: parseFloat(e.target.value)})}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between mt-1 text-xs font-medium text-slate-500">
              <span>Idle</span>
              <span className="text-blue-600 font-bold">{(features.kitchenLoad * 10).toFixed(1)}</span>
              <span>Full</span>
            </div>
          </div>

          {/* Scraped Items Display */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scraped Order Items</span>
            </div>
            <div className="space-y-2">
              {features.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">{item.name} x{item.count}</span>
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400">{item.dependency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <ToggleButton 
              active={features.isPeakHour} 
              onClick={() => setFeatures({...features, isPeakHour: !features.isPeakHour})}
              label="Peak Hour"
              icon={<Zap className="w-4 h-4" />}
            />
            <ToggleButton 
              active={features.isFestival} 
              onClick={() => setFeatures({...features, isFestival: !features.isFestival})}
              label="Festival"
              icon={<IndianRupee className="w-4 h-4" />}
            />
            <ToggleButton 
              active={features.weatherCondition === 'Rain'} 
              onClick={() => setFeatures({...features, weatherCondition: features.weatherCondition === 'Rain' ? 'Clear' : 'Rain'})}
              label="Rainy"
              icon={<CloudRain className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-6">
        <AnimatePresence mode="wait">
          {prediction && (
            <motion.div 
              key={JSON.stringify(features)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total Order Prep Time</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black">{prediction.predictedKPT}</span>
                      <span className="text-2xl font-bold text-slate-400">min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold mb-4">
                      <Layers className="w-3 h-3" />
                      Whole-Order Logic
                    </div>
                    <p className="text-slate-400 text-sm">Range: {prediction.confidenceInterval[0]} - {prediction.confidenceInterval[1]} min</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-12">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-4">Complexity Adjustments</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Parallel Savings</span>
                        <span className="text-emerald-400 font-bold">-{prediction.complexityBreakdown.parallelSavings}m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Diversity Penalty</span>
                        <span className="text-rose-400 font-bold">+{prediction.complexityBreakdown.diversityPenalty}m</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-4">Feature Weights</h5>
                    <div className="space-y-3">
                      {prediction.featureImportance.map((item, idx) => (
                        <div key={item.feature} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{item.feature}</span>
                            <span className="text-slate-400">{item.impact.toFixed(0)}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.impact}%` }}
                              className={`h-full rounded-full ${idx === 0 ? 'bg-orange-500' : 'bg-white/20'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-orange-500" />
            Order Complexity Vector
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ComplexityMetric 
              label="Parallel Feasibility" 
              value={`${(features.parallelPrepFeasibility * 100).toFixed(0)}%`} 
              desc="Multi-station prep overlap"
            />
            <ComplexityMetric 
              label="Cuisine Diversity" 
              value={`${(features.cuisineDiversity * 100).toFixed(0)}%`} 
              desc="Cross-cuisine assembly load"
            />
            <ComplexityMetric 
              label="Cooking Overlap" 
              value={`${(features.cookingOverlap * 100).toFixed(0)}%`} 
              desc="Shared appliance utilization"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleButton = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
      active 
        ? 'bg-slate-900 text-white shadow-lg' 
        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ComplexityMetric = ({ label, value, desc }: any) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
  </div>
);

const ImpactItem = ({ label, value, desc }: any) => (
  <div>
    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-black text-emerald-900">{value}</p>
    <p className="text-xs text-emerald-700/60 leading-tight">{desc}</p>
  </div>
);
