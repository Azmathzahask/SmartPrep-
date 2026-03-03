import { CuisineType, WholeOrderFeatures, PredictionResult, HistoricalDataPoint, OrderItem, AgentAction, ChefProfile, KDSOrder, OrderSource } from '../types';
import { addMinutes, subHours, format } from 'date-fns';

const CUISINE_MULTIPLIERS: Record<CuisineType, number> = {
  'Biryani': 1.4,
  'Dosa': 0.8,
  'Chaat': 0.6,
  'Pizza': 1.2,
  'North Indian': 1.3,
  'South Indian': 0.9,
  'Fast Food': 0.7,
};

const DISH_TEMPLATES: Record<CuisineType, OrderItem[]> = {
  'Biryani': [
    { name: 'Hyderabadi Biryani', count: 1, basePrepTime: 12, dependency: 'Stove' },
    { name: 'Raita', count: 1, basePrepTime: 2, dependency: 'Cold' },
    { name: 'Salans', count: 1, basePrepTime: 4, dependency: 'Stove' },
  ],
  'Dosa': [
    { name: 'Masala Dosa', count: 1, basePrepTime: 6, dependency: 'Stove' },
    { name: 'Sambar', count: 1, basePrepTime: 3, dependency: 'Stove' },
    { name: 'Coconut Chutney', count: 1, basePrepTime: 2, dependency: 'Cold' },
  ],
  'Pizza': [
    { name: 'Margherita Pizza', count: 1, basePrepTime: 10, dependency: 'Oven' },
    { name: 'Garlic Bread', count: 1, basePrepTime: 6, dependency: 'Oven' },
  ],
  'North Indian': [
    { name: 'Paneer Butter Masala', count: 1, basePrepTime: 10, dependency: 'Stove' },
    { name: 'Butter Naan', count: 2, basePrepTime: 4, dependency: 'Oven' },
    { name: 'Dal Makhani', count: 1, basePrepTime: 8, dependency: 'Stove' },
  ],
  'South Indian': [
    { name: 'Idli (2pcs)', count: 1, basePrepTime: 4, dependency: 'Assembly' },
    { name: 'Vada', count: 1, basePrepTime: 6, dependency: 'Fryer' },
  ],
  'Chaat': [
    { name: 'Pani Puri', count: 1, basePrepTime: 3, dependency: 'Assembly' },
    { name: 'Aloo Tikki', count: 1, basePrepTime: 5, dependency: 'Fryer' },
  ],
  'Fast Food': [
    { name: 'Veg Burger', count: 1, basePrepTime: 7, dependency: 'Assembly' },
    { name: 'French Fries', count: 1, basePrepTime: 5, dependency: 'Fryer' },
  ]
};

export const scrapeOrder = (cuisine: CuisineType, count: number): OrderItem[] => {
  const template = DISH_TEMPLATES[cuisine];
  const items: OrderItem[] = [];
  for (let i = 0; i < count; i++) {
    const randomItem = template[Math.floor(Math.random() * template.length)];
    items.push({ ...randomItem, count: 1 + Math.floor(Math.random() * 2) });
  }
  return items;
};

export const predictWholeOrderKPT = (features: WholeOrderFeatures): PredictionResult => {
  const {
    items,
    isPeakHour,
    isFestival,
    weatherCondition,
    merchantReliability,
    kitchenLoad
  } = features;

  // Calculate total raw time and dependency groups
  const dependencyGroups: Record<string, number> = {};
  let totalRawTime = 0;
  
  items.forEach(item => {
    const itemTime = item.basePrepTime * item.count;
    totalRawTime += itemTime;
    dependencyGroups[item.dependency] = (dependencyGroups[item.dependency] || 0) + itemTime;
  });

  // Parallel Prep Feasibility: If items have different dependencies, they can be prepped in parallel
  const uniqueDependencies = Object.keys(dependencyGroups).length;
  const parallelSavingsFactor = uniqueDependencies > 1 ? (uniqueDependencies - 1) * 0.15 : 0;
  const parallelSavings = totalRawTime * parallelSavingsFactor;

  // Diversity Penalty: More unique items increase assembly/packaging complexity
  const diversityPenalty = items.length * 0.8;

  let baseTime = totalRawTime - parallelSavings + diversityPenalty;
  
  // Load impact (KLI)
  const loadMultiplier = 1 + (kitchenLoad * 0.8);
  baseTime *= loadMultiplier;

  // India-specific factors
  if (isPeakHour) baseTime *= 1.2;
  if (isFestival) baseTime *= 1.35;
  if (weatherCondition === 'Rain') baseTime *= 1.25;

  const predictedKPT = Math.round(baseTime);
  const variance = Math.max(2, Math.round(predictedKPT * 0.12 * (2 - merchantReliability)));

  return {
    predictedKPT,
    confidenceInterval: [predictedKPT - variance, predictedKPT + variance],
    featureImportance: [
      { feature: 'Kitchen Load (KLI)', impact: kitchenLoad * 45 },
      { feature: 'Parallel Feasibility', impact: parallelSavingsFactor * 30 },
      { feature: 'Order Diversity', impact: (items.length / 10) * 15 },
      { feature: 'Merchant Reliability', impact: (1 - merchantReliability) * 10 },
    ].sort((a, b) => b.impact - a.impact),
    complexityBreakdown: {
      parallelSavings: Math.round(parallelSavings),
      diversityPenalty: Math.round(diversityPenalty)
    }
  };
};

export const agenticOptimizeKLI = (currentKli: number, riderWaitRatio: number, acceptanceDelay: number): AgentAction => {
  const timestamp = format(new Date(), 'HH:mm:ss');
  const id = Math.random().toString(36).substring(7);
  let decision = '';
  let action = '';
  let impact = '';
  let kliAdjustment = 0;

  if (riderWaitRatio > 0.4) {
    decision = 'Critical rider idle time detected (>40%). Kitchen throughput is lagging.';
    action = 'Throttling new order acceptance and prioritizing existing queue.';
    impact = 'Expected 15% reduction in rider wait within 10 mins.';
    kliAdjustment = -0.15;
  } else if (acceptanceDelay > 120) {
    decision = 'Merchant acceptance delay exceeds 2-min threshold.';
    action = 'Staggering rider assignment to match actual kitchen start time.';
    impact = 'Prevents premature rider arrival; improves MRS consistency.';
    kliAdjustment = -0.05;
  } else if (currentKli < 0.3) {
    decision = 'Kitchen capacity underutilized (KLI < 0.3).';
    action = 'Incentivizing nearby orders and tightening prep windows.';
    impact = 'Increases platform efficiency and merchant earnings.';
    kliAdjustment = 0.1;
  } else {
    decision = 'Kitchen load is optimal (0.4 - 0.7).';
    action = 'Maintaining steady-state dispatch parameters.';
    impact = 'Balanced ecosystem performance.';
    kliAdjustment = 0;
  }

  return {
    id,
    timestamp,
    observation: `KLI: ${currentKli.toFixed(2)}, Wait Ratio: ${riderWaitRatio.toFixed(2)}, Delay: ${acceptanceDelay}s`,
    decision,
    action,
    impact,
    kliAdjustment
  };
};

export const generateHistoricalData = (count: number = 24): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const time = subHours(now, i);
    const hour = time.getHours();
    const isPeak = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21);
    
    let kli = isPeak ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.3;
    const mrs = 0.7 + Math.random() * 0.25;
    
    const items = scrapeOrder('North Indian', 3);
    const features: WholeOrderFeatures = {
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      items,
      cuisineDiversity: 0.5,
      parallelPrepFeasibility: 0.6,
      cookingOverlap: 0.4,
      isPeakHour: isPeak,
      isFestival: false,
      weatherCondition: 'Clear',
      merchantReliability: mrs,
      kitchenLoad: kli
    };

    const prediction = predictWholeOrderKPT(features);
    const noise = (Math.random() - 0.5) * 4;
    const actual = Math.round(prediction.predictedKPT + noise);
    const riderWaitTime = Math.max(0, actual - prediction.predictedKPT + (kli * 5));

    const optimizedKli = Math.max(0.1, Math.min(1, kli - (riderWaitTime > 5 ? 0.15 : 0)));

    data.push({
      timestamp: format(time, 'HH:mm'),
      predicted: prediction.predictedKPT,
      actual,
      riderWaitTime,
      kli,
      mrs,
      optimizedKli
    });
  }

  return data;
};

export const CHEFS: ChefProfile[] = [
  { id: 'C1', name: 'Chef Rajesh', accuracy: 0.95, specialty: 'Biryani', experienceYears: 12 },
  { id: 'C2', name: 'Chef Priya', accuracy: 0.88, specialty: 'North Indian', experienceYears: 8 },
  { id: 'C3', name: 'Chef Amit', accuracy: 0.82, specialty: 'Fast Food', experienceYears: 5 },
  { id: 'C4', name: 'Chef Meena', accuracy: 0.92, specialty: 'South Indian', experienceYears: 10 },
];

export class AgenticKDSEngine {
  static createKDSOrder(cuisine: CuisineType, kitchenLoad: number, source?: OrderSource): KDSOrder {
    const items = scrapeOrder(cuisine, 2 + Math.floor(Math.random() * 2));
    const chef = CHEFS[Math.floor(Math.random() * CHEFS.length)];
    const sources: OrderSource[] = ['Zomato', 'Swiggy', 'Dine-in', 'Takeaway'];
    const orderSource = source || sources[Math.floor(Math.random() * sources.length)];
    
    const features: WholeOrderFeatures = {
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      items,
      cuisineDiversity: 0.4,
      parallelPrepFeasibility: 0.7,
      cookingOverlap: 0.5,
      isPeakHour: false,
      isFestival: false,
      weatherCondition: 'Clear',
      merchantReliability: 0.85,
      kitchenLoad: kitchenLoad
    };

    const prediction = predictWholeOrderKPT(features);
    let predictedKPT = prediction.predictedKPT;

    // Source-based adjustments
    if (orderSource === 'Dine-in') predictedKPT = Math.round(predictedKPT * 0.9); // Priority for dine-in
    if (orderSource === 'Swiggy') predictedKPT = Math.round(predictedKPT * 1.05); // Slight buffer for Swiggy
    
    // Chef adjustment
    predictedKPT = Math.round(predictedKPT / chef.accuracy);
    
    return {
      id: `${orderSource.substring(0, 1).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      source: orderSource,
      items,
      status: 'RECEIVED',
      predictedKPT,
      assignedChef: chef,
      remainingTime: predictedKPT * 60,
      isRushDetected: kitchenLoad > 0.75,
      minTimeLock: Math.round(predictedKPT * 0.65 * 60),
      features
    };
  }
}
