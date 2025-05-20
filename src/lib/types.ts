
import type { OptimizeHoneyProductionInput, OptimizeHoneyProductionOutput } from '@/ai/flows/optimize-honey-production';

export interface GameState {
  honey: number;
  pollen: number;
  propolis: number;
  beeCoins: number;
  hiveLevel: number;
  workerBees: number;
  lastUpdated: number;
  honeyPrice: number;
  pollenPrice: number;
  propolisPrice: number;
  currentHoneyProductionRate: number; // units per hour
  currentPollenProductionRate: number; // units per hour
  currentPropolisProductionRate: number; // units per hour
}

export interface GameContextType extends GameState {
  collectHoney: () => void;
  upgradeHive: () => void;
  addWorkerBees: (amount: number) => void;
  sellHoney: (amount: number) => void;
  buyHoney: (amount: number) => void;
  sellPollen: (amount: number) => void;
  sellPropolis: (amount: number) => void;
  getAIOptimization: (input: OptimizeHoneyProductionInput) => Promise<OptimizeHoneyProductionOutput>;
}

export type ResourceType = 'honey' | 'pollen' | 'propolis' | 'beeCoins';

