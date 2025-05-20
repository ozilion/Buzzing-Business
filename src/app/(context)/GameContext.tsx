"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { GameState, GameContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  INITIAL_HONEY,
  INITIAL_POLLEN,
  INITIAL_PROPOLIS,
  INITIAL_BEE_COINS,
  INITIAL_HIVE_LEVEL,
  INITIAL_WORKER_BEES,
  INITIAL_HONEY_PRICE,
  BASE_PRODUCTION_PER_BEE_PER_SECOND,
  POLLEN_CHANCE_ON_COLLECT,
  PROPOLIS_CHANCE_ON_COLLECT,
  HIVE_UPGRADE_COST_MULTIPLIER,
  BASE_HIVE_UPGRADE_COST,
  WORKER_BEE_COST,
  MAX_OFFLINE_PRODUCTION_HOURS,
  MARKET_PRICE_FLUCTUATION_INTERVAL,
  MARKET_PRICE_MIN,
  MARKET_PRICE_MAX,
} from '@/lib/constants';
import type { OptimizeHoneyProductionInput, OptimizeHoneyProductionOutput } from '@/ai/flows/optimize-honey-production';

const GameContext = createContext<GameContextType | undefined>(undefined);

const calculateProductionRate = (hiveLevel: number, workerBees: number): number => {
  return hiveLevel * workerBees * BASE_PRODUCTION_PER_BEE_PER_SECOND * 3600; // per hour
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedGame = typeof window !== 'undefined' ? localStorage.getItem('buzzingBusinessGame') : null;
    if (savedGame) {
      return JSON.parse(savedGame) as GameState;
    }
    return {
      honey: INITIAL_HONEY,
      pollen: INITIAL_POLLEN,
      propolis: INITIAL_PROPOLIS,
      beeCoins: INITIAL_BEE_COINS,
      hiveLevel: INITIAL_HIVE_LEVEL,
      workerBees: INITIAL_WORKER_BEES,
      lastUpdated: Date.now(),
      honeyPrice: INITIAL_HONEY_PRICE,
      currentHoneyProductionRate: calculateProductionRate(INITIAL_HIVE_LEVEL, INITIAL_WORKER_BEES),
    };
  });

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('buzzingBusinessGame', JSON.stringify(gameState));
  }, [gameState]);

  // Offline production and periodic updates
  useEffect(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - gameState.lastUpdated) / 1000);
    const maxOfflineSeconds = MAX_OFFLINE_PRODUCTION_HOURS * 3600;
    const effectiveElapsedSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);

    let accumulatedHoney = 0;
    if (effectiveElapsedSeconds > 0) {
      const productionRatePerSecond = gameState.currentHoneyProductionRate / 3600;
      accumulatedHoney = productionRatePerSecond * effectiveElapsedSeconds;
      
      if (accumulatedHoney > 0) {
         toast({
          title: "Welcome Back!",
          description: `You produced ${accumulatedHoney.toFixed(2)} honey while you were away.`,
        });
      }
    }
    
    setGameState(prev => ({
      ...prev,
      honey: prev.honey + accumulatedHoney,
      lastUpdated: now,
      currentHoneyProductionRate: calculateProductionRate(prev.hiveLevel, prev.workerBees),
    }));

    const intervalId = setInterval(() => {
      setGameState(prev => {
        const productionRatePerSecond = prev.currentHoneyProductionRate / 3600;
        const newHoney = prev.honey + productionRatePerSecond; // Simulate 1 second of production
        return {
          ...prev,
          honey: newHoney,
          lastUpdated: Date.now(),
        };
      });
    }, 1000); // Update every second for "real-time" feel

    // Market price fluctuation
    const priceFluctuationInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        honeyPrice: Math.floor(Math.random() * (MARKET_PRICE_MAX - MARKET_PRICE_MIN + 1)) + MARKET_PRICE_MIN,
      }));
    }, MARKET_PRICE_FLUCTUATION_INTERVAL);

    return () => {
      clearInterval(intervalId);
      clearInterval(priceFluctuationInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load and setup interval

  const collectHoney = useCallback(() => {
    // Honey is already accumulating. This action could be a manual "boost" or just symbolic.
    // For now, let's add a small bonus and chance for pollen/propolis.
    const bonusHoney = gameState.currentHoneyProductionRate / 3600 * 10; // 10 seconds worth of production
    let newPollen = gameState.pollen;
    let newPropolis = gameState.propolis;

    if (Math.random() < POLLEN_CHANCE_ON_COLLECT) {
      newPollen += 1;
      toast({ title: "Resource Found!", description: "You collected 1 Pollen!" });
    }
    if (Math.random() < PROPOLIS_CHANCE_ON_COLLECT) {
      newPropolis += 1;
      toast({ title: "Resource Found!", description: "You collected 1 Propolis!" });
    }

    setGameState(prev => ({
      ...prev,
      honey: prev.honey + bonusHoney,
      pollen: newPollen,
      propolis: newPropolis,
    }));
    toast({ title: "Honey Collected!", description: `Added ${bonusHoney.toFixed(2)} bonus honey.` });
  }, [gameState.currentHoneyProductionRate, gameState.pollen, gameState.propolis, toast]);

  const upgradeHive = useCallback(() => {
    const cost = BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, gameState.hiveLevel -1);
    if (gameState.beeCoins >= cost) {
      setGameState(prev => {
        const newHiveLevel = prev.hiveLevel + 1;
        return {
        ...prev,
        beeCoins: prev.beeCoins - cost,
        hiveLevel: newHiveLevel,
        currentHoneyProductionRate: calculateProductionRate(newHiveLevel, prev.workerBees),
      }});
      toast({ title: "Hive Upgraded!", description: `Hive is now level ${gameState.hiveLevel + 1}.` });
    } else {
      toast({ title: "Not enough BeeCoins!", description: `You need ${cost.toFixed(0)} BeeCoins to upgrade.`, variant: "destructive" });
    }
  }, [gameState.beeCoins, gameState.hiveLevel, toast]);

  const addWorkerBees = useCallback((amount: number) => {
    const cost = WORKER_BEE_COST * amount;
    if (gameState.beeCoins >= cost) {
      setGameState(prev => {
        const newWorkerBees = prev.workerBees + amount;
        return {
        ...prev,
        beeCoins: prev.beeCoins - cost,
        workerBees: newWorkerBees,
        currentHoneyProductionRate: calculateProductionRate(prev.hiveLevel, newWorkerBees),
      }});
      toast({ title: "Worker Bees Acquired!", description: `Added ${amount} worker bees.` });
    } else {
      toast({ title: "Not enough BeeCoins!", description: `You need ${cost} BeeCoins.`, variant: "destructive" });
    }
  }, [gameState.beeCoins, toast]);

  const sellHoney = useCallback((amount: number) => {
    if (gameState.honey >= amount) {
      const earnings = amount * gameState.honeyPrice;
      setGameState(prev => ({
        ...prev,
        honey: prev.honey - amount,
        beeCoins: prev.beeCoins + earnings,
      }));
      toast({ title: "Honey Sold!", description: `You earned ${earnings.toFixed(0)} BeeCoins.` });
    } else {
      toast({ title: "Not enough honey!", description: `You only have ${gameState.honey.toFixed(2)} honey.`, variant: "destructive" });
    }
  }, [gameState.honey, gameState.honeyPrice, toast]);

  const buyHoney = useCallback((amount: number) => {
    const cost = amount * gameState.honeyPrice;
    if (gameState.beeCoins >= cost) {
      setGameState(prev => ({
        ...prev,
        honey: prev.honey + amount,
        beeCoins: prev.beeCoins - cost,
      }));
      toast({ title: "Honey Purchased!", description: `You bought ${amount} honey for ${cost.toFixed(0)} BeeCoins.` });
    } else {
      toast({ title: "Not enough BeeCoins!", description: `You need ${cost.toFixed(0)} BeeCoins.`, variant: "destructive" });
    }
  }, [gameState.beeCoins, gameState.honeyPrice, toast]);

  const getAIOptimization = async (input: OptimizeHoneyProductionInput): Promise<OptimizeHoneyProductionOutput> => {
    const response = await fetch('/api/ai/optimize-honey-production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI optimization tips');
    }
    return response.json();
  };
  
  return (
    <GameContext.Provider value={{ ...gameState, collectHoney, upgradeHive, addWorkerBees, sellHoney, buyHoney, getAIOptimization }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
