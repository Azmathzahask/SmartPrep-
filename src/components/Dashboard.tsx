import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { HistoricalDataPoint } from '../types';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MerchantReliabilityBreakdown } from './MerchantStats';

interface DashboardProps {
  data: HistoricalDataPoint[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const latest = data[data.length - 1];
  const avgWaitTime = data.reduce((acc, curr) => acc + curr.riderWaitTime, 0) / data.length;
  const accuracy = 100 - (data.reduce((acc, curr) => acc + Math.abs(curr.actual - curr.predicted), 0) / data.reduce((acc, curr) => acc + curr.actual, 0) * 100);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Avg Rider Wait" 
          value={`${avgWaitTime.toFixed(1)}m`} 
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          trend="-12%"
          trendUp={false}
        />
        <StatCard 
          title="Prediction Accuracy" 
          value={`${accuracy.toFixed(1)}%`} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          trend="+4.2%"
          trendUp={true}
        />
        <StatCard 
          title="Current KLI" 
          value={(latest.kli * 10).toFixed(1)} 
          icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
          subValue="Kitchen Load Index"
        />
        <StatCard 
          title="Merchant Reliability" 
          value={`${(latest.mrs * 100).toFixed(0)}%`} 
          icon={<AlertTriangle className="w-5 h-5 text-purple-500" />}
          subValue="MRS Score"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Predicted vs Actual KPT</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} unit="m" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual KPT" />
                <Area type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPred)" name="SmartPrep Prediction" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Rider Wait Time Impact</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} unit="m" />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="riderWaitTime" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Wait Time (min)">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.riderWaitTime > 5 ? '#f43f5e' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Kitchen Load Index (KLI) Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="kli" stroke="#f59e0b" strokeWidth={2} dot={false} name="Standard KLI" />
                <Line type="monotone" dataKey="optimizedKli" stroke="#10b981" strokeWidth={3} dot={false} name="Agentic Optimized KLI" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-1">
          <MerchantReliabilityBreakdown />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendUp, subValue }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-xl">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
      {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
    </div>
  </div>
);
