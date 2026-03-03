import React from 'react';
import { KDSOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Clock, AlertCircle, CheckCircle2, Play, Flame, Smartphone, Utensils, ShoppingBag } from 'lucide-react';

interface KDSViewProps {
  orders: KDSOrder[];
  kitchenLoad: number;
  onStartCooking: (id: string) => void;
  onReady: (id: string) => void;
  onLoadChange: (load: number) => void;
  onAddTestOrder: () => void;
}

const SourceIcon = ({ source }: { source: KDSOrder['source'] }) => {
  switch (source) {
    case 'Zomato': return <Smartphone className="w-3 h-3 text-red-500" />;
    case 'Swiggy': return <Smartphone className="w-3 h-3 text-orange-500" />;
    case 'Dine-in': return <Utensils className="w-3 h-3 text-blue-500" />;
    case 'Takeaway': return <ShoppingBag className="w-3 h-3 text-emerald-500" />;
    default: return null;
  }
};

export const KDSView: React.FC<KDSViewProps> = ({ orders, kitchenLoad, onStartCooking, onReady, onLoadChange, onAddTestOrder }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-orange-500 rounded-lg text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Agentic KDS Terminal</h3>
            <p className="text-xs text-slate-400">Live Kitchen Operations • Multi-Channel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onAddTestOrder}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Play className="w-3 h-3" />
            30s Test Order
          </button>
          <div className="h-8 w-px bg-slate-100 mx-2" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Kitchen Load</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${kitchenLoad * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-700">{(kitchenLoad * 100).toFixed(0)}%</span>
            </div>
          </div>
          <button 
            onClick={() => onLoadChange(Math.min(1, kitchenLoad + 0.1))}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"
          >
            <Flame className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {orders.map(order => (
            <motion.div 
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm transition-colors ${
                order.status === 'READY' ? 'border-emerald-500' : 
                order.status === 'COOKING' ? 'border-orange-500' : 'border-slate-100'
              }`}
            >
              {/* Card Header */}
              <div className={`p-4 flex justify-between items-center ${
                order.status === 'READY' ? 'bg-emerald-500 text-white' : 
                order.status === 'COOKING' ? 'bg-orange-500 text-white' : 'bg-slate-50'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <SourceIcon source={order.source} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{order.source}</span>
                    <h4 className="font-black text-lg leading-none">#{order.id}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">AI PRED</span>
                  <p className="font-black text-lg leading-none">{order.predictedKPT}m</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                    <img src={`https://picsum.photos/seed/${order.assignedChef.id}/100/100`} alt="Chef" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{order.assignedChef.name}</p>
                    <p className="text-[10px] text-slate-400">Acc: {(order.assignedChef.accuracy * 100).toFixed(0)}% • {order.assignedChef.specialty}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600">{item.name} x{item.count}</span>
                      <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded">{item.dependency}</span>
                    </div>
                  ))}
                </div>

                {/* Timer / Status */}
                <div className="pt-4">
                  {order.status === 'RECEIVED' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-500 bg-rose-50 p-2 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Action Required: Start Cooking</span>
                      </div>
                      <button 
                        onClick={() => onStartCooking(order.id)}
                        className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start Cooking
                      </button>
                    </div>
                  )}

                  {order.status === 'COOKING' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-orange-600">
                          <Clock className="w-4 h-4 animate-spin-slow" />
                          <span className="text-xs font-bold">Cooking...</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900">
                          {Math.floor(order.remainingTime / 60)}:{(order.remainingTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={false}
                          animate={{ width: `${(1 - order.remainingTime / (order.predictedKPT * 60)) * 100}%` }}
                          className="h-full bg-orange-500"
                        />
                      </div>
                      
                      {order.remainingTime > order.minTimeLock ? (
                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-2 rounded-xl justify-center">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Ready Locked: {Math.ceil((order.remainingTime - order.minTimeLock) / 60)}m left</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => onReady(order.id)}
                          className="w-full py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as Ready
                        </button>
                      )}
                    </div>
                  )}

                  {order.status === 'READY' && (
                    <div className="bg-emerald-50 p-4 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-emerald-800">Order Ready for Dispatch</p>
                      <p className="text-[10px] text-emerald-600">Actual KPT: {order.predictedKPT}m (Matched AI)</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
