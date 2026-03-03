export type CuisineType = 'Biryani' | 'Dosa' | 'Chaat' | 'Pizza' | 'North Indian' | 'South Indian' | 'Fast Food';
export type OrderSource = 'Zomato' | 'Swiggy' | 'Dine-in' | 'Takeaway';

export interface OrderItem {
  name: string;
  count: number;
  basePrepTime: number;
  dependency: 'Stove' | 'Oven' | 'Fryer' | 'Cold' | 'Assembly';
}

export interface ChefProfile {
  id: string;
  name: string;
  accuracy: number; // 0-1
  specialty: CuisineType;
  experienceYears: number;
}

export interface KDSOrder {
  id: string;
  source: OrderSource;
  items: OrderItem[];
  status: 'RECEIVED' | 'COOKING' | 'READY' | 'DISPATCHED';
  predictedKPT: number;
  startTime?: string;
  readyTime?: string;
  assignedChef: ChefProfile;
  remainingTime: number;
  isRushDetected: boolean;
  minTimeLock: number;
  features: WholeOrderFeatures;
}

export interface WholeOrderFeatures {
  orderId: string;
  items: OrderItem[];
  cuisineDiversity: number;
  parallelPrepFeasibility: number;
  cookingOverlap: number;
  isPeakHour: boolean;
  isFestival: boolean;
  weatherCondition: 'Clear' | 'Rain' | 'Heatwave';
  merchantReliability: number;
  kitchenLoad: number;
}

export interface AgentAction {
  id: string;
  timestamp: string;
  observation: string;
  decision: string;
  action: string;
  impact: string;
  kliAdjustment: number;
}

export interface PredictionResult {
  predictedKPT: number;
  confidenceInterval: [number, number];
  featureImportance: {
    feature: string;
    impact: number;
  }[];
  complexityBreakdown: {
    parallelSavings: number;
    diversityPenalty: number;
  };
}

export interface HistoricalDataPoint {
  timestamp: string;
  predicted: number;
  actual: number;
  riderWaitTime: number;
  kli: number;
  mrs: number;
  optimizedKli?: number;
}
