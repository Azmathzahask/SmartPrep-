import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { PredictionTool } from './components/PredictionTool';
import { AgenticOptimizer } from './components/AgenticOptimizer';
import { KDSView } from './components/KDSView';
import { generateHistoricalData, AgenticKDSEngine, agenticOptimizeKLI } from './utils/simulation';
import { KDSOrder, AgentAction } from './types';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  MapPin, 
  ChefHat, 
  Bell, 
  Search,
  Menu,
  X,
  Cpu,
  Monitor
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prediction' | 'agentic' | 'kds'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Shared State for Persistence
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [optimizationLogs, setOptimizationLogs] = useState<AgentAction[]>([]);
  const [kitchenLoad, setKitchenLoad] = useState(0.65);
  const [waitRatio, setWaitRatio] = useState(0.45);
  const [acceptanceDelay, setAcceptanceDelay] = useState(150);

  const historicalData = useMemo(() => generateHistoricalData(30), []);

  // Initialize KDS Orders
  useEffect(() => {
    if (orders.length === 0) {
      setOrders([
        AgenticKDSEngine.createKDSOrder('Biryani', kitchenLoad, 'Zomato'),
        AgenticKDSEngine.createKDSOrder('North Indian', kitchenLoad, 'Dine-in'),
        AgenticKDSEngine.createKDSOrder('Pizza', kitchenLoad, 'Swiggy'),
      ]);
    }
  }, []);

  // Global Tick (Every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Update Order Timers
      setOrders(prev => prev.map(order => {
        if (order.status === 'COOKING' && order.remainingTime > 0) {
          return { ...order, remainingTime: order.remainingTime - 1 };
        }
        return order;
      }));

      // 2. Randomly add new orders if under capacity
      if (Math.random() > 0.98 && orders.length < 8) {
        setOrders(prev => [...prev, AgenticKDSEngine.createKDSOrder('Fast Food', kitchenLoad)]);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [kitchenLoad, orders.length]);

  // Agentic Optimization Loop (Every 5 seconds)
  useEffect(() => {
    const optimizer = setInterval(() => {
      const action = agenticOptimizeKLI(kitchenLoad, waitRatio, acceptanceDelay);
      
      setOptimizationLogs(prev => [action, ...prev].slice(0, 10));
      
      // Apply Agentic Decisions to the Environment
      if (action.kliAdjustment !== 0) {
        setKitchenLoad(prev => Math.max(0.1, Math.min(1, prev + action.kliAdjustment)));
        
        // Impact simulation
        if (action.kliAdjustment < 0) {
          setWaitRatio(prev => Math.max(0.1, prev - 0.05));
          setAcceptanceDelay(prev => Math.max(30, prev - 15));
        } else {
          setWaitRatio(prev => Math.min(0.8, prev + 0.02));
          setAcceptanceDelay(prev => Math.min(300, prev + 10));
        }
      } else {
        // Natural drift if no action
        setWaitRatio(prev => Math.max(0.1, Math.min(0.8, prev + (Math.random() - 0.4) * 0.02)));
        setAcceptanceDelay(prev => Math.max(30, Math.min(300, prev + Math.floor((Math.random() - 0.4) * 10))));
      }
    }, 5000);

    return () => clearInterval(optimizer);
  }, [kitchenLoad, waitRatio, acceptanceDelay]);

  const handleStartCooking = useCallback((id: string) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'COOKING', startTime: new Date().toLocaleTimeString() } : order
    ));
  }, []);

  const handleReady = useCallback((id: string) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'READY', readyTime: new Date().toLocaleTimeString() } : order
    ));
  }, []);

  const addTestOrder = useCallback(() => {
    const testOrder = AgenticKDSEngine.createKDSOrder('Fast Food', kitchenLoad, 'Takeaway');
    testOrder.id = 'TEST-30S';
    testOrder.predictedKPT = 0.5; // 30 seconds
    testOrder.remainingTime = 30;
    testOrder.minTimeLock = 10; // Lock for 10 seconds
    setOrders(prev => [testOrder, ...prev]);
  }, [kitchenLoad]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">SmartPrep++</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Agentic Kitchen AI</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Live Dashboard"
            />
            <NavItem 
              active={activeTab === 'prediction'} 
              onClick={() => setActiveTab('prediction')}
              icon={<BrainCircuit className="w-5 h-5" />}
              label="Whole-Order Predictor"
            />
            <NavItem 
              active={activeTab === 'agentic'} 
              onClick={() => setActiveTab('agentic')}
              icon={<Cpu className="w-5 h-5" />}
              label="Agentic Optimizer"
            />
            <NavItem 
              active={activeTab === 'kds'} 
              onClick={() => setActiveTab('kds')}
              icon={<Monitor className="w-5 h-5" />}
              label="Kitchen Display (KDS)"
            />
            <div className="pt-6 pb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Market Context</p>
            </div>
            <NavItem icon={<MapPin className="w-5 h-5" />} label="Regional Insights" />
            <NavItem icon={<Bell className="w-5 h-5" />} label="Peak Alerts" />
          </nav>

          <div className="mt-auto p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">Operations Lead</p>
                <p className="text-[10px] text-slate-400">Gurugram HQ</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-slate-50 rounded-lg">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search merchants, zones..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              System Online
            </div>
            <button className="p-2 hover:bg-slate-50 rounded-lg relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {activeTab === 'dashboard' && 'Kitchen Preparation Analytics'}
                {activeTab === 'prediction' && 'Whole-Order KPT Predictor'}
                {activeTab === 'agentic' && 'Agentic Load Optimization'}
                {activeTab === 'kds' && 'Kitchen Display System (KDS)'}
              </h2>
              <p className="text-slate-500 mt-1">
                {activeTab === 'dashboard' && 'Real-time monitoring of merchant reliability and kitchen load across India.'}
                {activeTab === 'prediction' && 'Simulate complex multi-item orders to understand parallel prep feasibility.'}
                {activeTab === 'agentic' && 'Observe the AI agent dynamically adjusting kitchen load to balance rider wait times.'}
                {activeTab === 'kds' && 'Live kitchen terminal with AI-enforced prep locks and rush detection.'}
              </p>
            </header>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <Dashboard data={historicalData} />}
              {activeTab === 'prediction' && <PredictionTool />}
              {activeTab === 'agentic' && (
                <AgenticOptimizer 
                  logs={optimizationLogs} 
                  currentKli={kitchenLoad}
                  waitRatio={waitRatio}
                  acceptanceDelay={acceptanceDelay}
                />
              )}
              {activeTab === 'kds' && (
                <KDSView 
                  orders={orders} 
                  kitchenLoad={kitchenLoad}
                  onStartCooking={handleStartCooking}
                  onReady={handleReady}
                  onLoadChange={setKitchenLoad}
                  onAddTestOrder={addTestOrder}
                />
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
      ${active 
        ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    {icon}
    {label}
  </button>
);
