
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
  INITIAL_POLLEN_PRICE,
  INITIAL_PROPOLIS_PRICE,
  BASE_HONEY_PRODUCTION_PER_BEE_PER_SECOND,
  HONEY_PRODUCTION_HIVE_LEVEL_MULTIPLIER_PER_SECOND,
  BASE_POLLEN_PRODUCTION_PER_BEE_PER_SECOND,
  POLLEN_PRODUCTION_HIVE_LEVEL_MULTIPLIER_PER_SECOND,
  BASE_PROPOLIS_PRODUCTION_PER_HIVE_LEVEL_PER_SECOND,
  POLLEN_CHANCE_ON_COLLECT,
  PROPOLIS_CHANCE_ON_COLLECT,
  HIVE_UPGRADE_COST_MULTIPLIER,
  BASE_HIVE_UPGRADE_COST,
  WORKER_BEE_COST,
  MAX_OFFLINE_PRODUCTION_HOURS,
  MARKET_PRICE_FLUCTUATION_INTERVAL,
  MARKET_HONEY_PRICE_MIN,
  MARKET_HONEY_PRICE_MAX,
  MARKET_POLLEN_PRICE_MIN,
  MARKET_POLLEN_PRICE_MAX,
  MARKET_PROPOLIS_PRICE_MIN,
  MARKET_PROPOLIS_PRICE_MAX,
  BASE_MAX_WORKER_BEES,
  MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL,
  QUEEN_BEE_INITIAL_PRESENCE,
  QUEEN_BEE_BIRTH_INTERVAL_SECONDS,
  QUEEN_BEE_BIRTH_AMOUNT,
} from '@/lib/constants';
import type { OptimizeHoneyProductionInput, OptimizeHoneyProductionOutput } from '@/ai/flows/optimize-honey-production';

const GameContext = createContext<GameContextType | undefined>(undefined);

const calculateHoneyProductionRate = (hiveLevel: number, workerBees: number): number => {
  const ratePerSecond = (workerBees * BASE_HONEY_PRODUCTION_PER_BEE_PER_SECOND) + (hiveLevel * HONEY_PRODUCTION_HIVE_LEVEL_MULTIPLIER_PER_SECOND);
  return ratePerSecond * 3600; // per hour
};

const calculatePollenProductionRate = (hiveLevel: number, workerBees: number): number => {
  const ratePerSecond = (workerBees * BASE_POLLEN_PRODUCTION_PER_BEE_PER_SECOND) + (hiveLevel * POLLEN_PRODUCTION_HIVE_LEVEL_MULTIPLIER_PER_SECOND);
  return ratePerSecond * 3600; // per hour
};

const calculatePropolisProductionRate = (hiveLevel: number): number => {
  const ratePerSecond = hiveLevel * BASE_PROPOLIS_PRODUCTION_PER_HIVE_LEVEL_PER_SECOND;
  return ratePerSecond * 3600; // per hour
};

const calculateMaxWorkerBees = (hiveLevel: number): number => {
  return BASE_MAX_WORKER_BEES + (hiveLevel - 1) * MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedGame = typeof window !== 'undefined' ? localStorage.getItem('buzzingBusinessGame') : null;
    let initialHiveLevel = INITIAL_HIVE_LEVEL;
    let initialWorkerBees = INITIAL_WORKER_BEES;

    if (savedGame) {
      const parsedGame = JSON.parse(savedGame) as GameState;
      initialHiveLevel = parsedGame.hiveLevel;
      initialWorkerBees = parsedGame.workerBees;
      return {
        ...parsedGame,
        pollenPrice: parsedGame.pollenPrice || INITIAL_POLLEN_PRICE,
        propolisPrice: parsedGame.propolisPrice || INITIAL_PROPOLIS_PRICE,
        maxWorkerBees: calculateMaxWorkerBees(initialHiveLevel),
        hasQueen: parsedGame.hasQueen !== undefined ? parsedGame.hasQueen : QUEEN_BEE_INITIAL_PRESENCE,
        queenBeeBirthCooldown: parsedGame.queenBeeBirthCooldown !== undefined ? parsedGame.queenBeeBirthCooldown : QUEEN_BEE_BIRTH_INTERVAL_SECONDS,
        currentHoneyProductionRate: calculateHoneyProductionRate(initialHiveLevel, initialWorkerBees),
        currentPollenProductionRate: calculatePollenProductionRate(initialHiveLevel, initialWorkerBees),
        currentPropolisProductionRate: calculatePropolisProductionRate(initialHiveLevel),
      };
    }
    return {
      honey: INITIAL_HONEY,
      pollen: INITIAL_POLLEN,
      propolis: INITIAL_PROPOLIS,
      beeCoins: INITIAL_BEE_COINS,
      hiveLevel: initialHiveLevel,
      workerBees: initialWorkerBees,
      maxWorkerBees: calculateMaxWorkerBees(initialHiveLevel),
      hasQueen: QUEEN_BEE_INITIAL_PRESENCE,
      queenBeeBirthCooldown: QUEEN_BEE_BIRTH_INTERVAL_SECONDS,
      lastUpdated: Date.now(),
      honeyPrice: INITIAL_HONEY_PRICE,
      pollenPrice: INITIAL_POLLEN_PRICE,
      propolisPrice: INITIAL_PROPOLIS_PRICE,
      currentHoneyProductionRate: calculateHoneyProductionRate(initialHiveLevel, initialWorkerBees),
      currentPollenProductionRate: calculatePollenProductionRate(initialHiveLevel, initialWorkerBees),
      currentPropolisProductionRate: calculatePropolisProductionRate(initialHiveLevel),
    };
  });

  useEffect(() => {
    localStorage.setItem('buzzingBusinessGame', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - gameState.lastUpdated) / 1000);
    const maxOfflineSeconds = MAX_OFFLINE_PRODUCTION_HOURS * 3600;
    const effectiveElapsedSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);

    let accumulatedHoney = 0;
    let accumulatedPollen = 0;
    let accumulatedPropolis = 0;
    let bornBeesOffline = 0;
    let finalQueenBeeBirthCooldown = gameState.queenBeeBirthCooldown;

    const currentMaxBees = calculateMaxWorkerBees(gameState.hiveLevel);

    if (effectiveElapsedSeconds > 0) {
      const honeyProductionRatePerSecond = calculateHoneyProductionRate(gameState.hiveLevel, gameState.workerBees) / 3600;
      accumulatedHoney = honeyProductionRatePerSecond * effectiveElapsedSeconds;

      const pollenProductionRatePerSecond = calculatePollenProductionRate(gameState.hiveLevel, gameState.workerBees) / 3600;
      accumulatedPollen = pollenProductionRatePerSecond * effectiveElapsedSeconds;
      
      const propolisProductionRatePerSecond = calculatePropolisProductionRate(gameState.hiveLevel) / 3600;
      accumulatedPropolis = propolisProductionRatePerSecond * effectiveElapsedSeconds;

      if (gameState.hasQueen) {
        let remainingOfflineSeconds = effectiveElapsedSeconds;
        let currentOfflineCooldown = gameState.queenBeeBirthCooldown;
        
        while (remainingOfflineSeconds > 0) {
          if (remainingOfflineSeconds >= currentOfflineCooldown) {
            if (gameState.workerBees + bornBeesOffline < currentMaxBees) {
              bornBeesOffline += QUEEN_BEE_BIRTH_AMOUNT;
            }
            remainingOfflineSeconds -= currentOfflineCooldown;
            currentOfflineCooldown = QUEEN_BEE_BIRTH_INTERVAL_SECONDS;
          } else {
            currentOfflineCooldown -= remainingOfflineSeconds;
            remainingOfflineSeconds = 0;
          }
        }
        finalQueenBeeBirthCooldown = currentOfflineCooldown;
      }
      
      if (accumulatedHoney > 0 || accumulatedPollen > 0 || accumulatedPropolis > 0 || bornBeesOffline > 0) {
        let messages = [];
        if (accumulatedHoney > 0) messages.push(`${accumulatedHoney.toFixed(2)} honey`);
        if (accumulatedPollen > 0) messages.push(`${accumulatedPollen.toFixed(0)} pollen`);
        if (accumulatedPropolis > 0) messages.push(`${accumulatedPropolis.toFixed(0)} propolis`);
        if (bornBeesOffline > 0) messages.push(`${bornBeesOffline} new bees`);
        
        toast({
          title: "Welcome Back!",
          description: `You produced ${messages.join(', ')} while you were away.`,
        });
      }
    }
    
    setGameState(prev => ({
      ...prev,
      honey: prev.honey + accumulatedHoney,
      pollen: prev.pollen + accumulatedPollen,
      propolis: prev.propolis + accumulatedPropolis,
      workerBees: Math.min(prev.workerBees + bornBeesOffline, currentMaxBees),
      queenBeeBirthCooldown: finalQueenBeeBirthCooldown,
      lastUpdated: now,
      currentHoneyProductionRate: calculateHoneyProductionRate(prev.hiveLevel, prev.workerBees + bornBeesOffline),
      currentPollenProductionRate: calculatePollenProductionRate(prev.hiveLevel, prev.workerBees + bornBeesOffline),
      currentPropolisProductionRate: calculatePropolisProductionRate(prev.hiveLevel),
      maxWorkerBees: currentMaxBees,
    }));

    const intervalId = setInterval(() => {
      setGameState(prev => {
        const honeyProductionPerSecond = calculateHoneyProductionRate(prev.hiveLevel, prev.workerBees) / 3600;
        const pollenProductionPerSecond = calculatePollenProductionRate(prev.hiveLevel, prev.workerBees) / 3600;
        const propolisProductionPerSecond = calculatePropolisProductionRate(prev.hiveLevel) / 3600;

        let newWorkerBees = prev.workerBees;
        let newQueenBeeBirthCooldown = prev.queenBeeBirthCooldown - 1;
        let newMaxWorkerBees = calculateMaxWorkerBees(prev.hiveLevel);


        if (prev.hasQueen && newQueenBeeBirthCooldown <= 0) {
          if (newWorkerBees < newMaxWorkerBees) {
            newWorkerBees += QUEEN_BEE_BIRTH_AMOUNT;
            toast({
              title: "New Bee!",
              description: `The Queen has blessed the hive with ${QUEEN_BEE_BIRTH_AMOUNT} new worker bee(s).`,
            });
          }
          newQueenBeeBirthCooldown = QUEEN_BEE_BIRTH_INTERVAL_SECONDS;
        }
        
        return {
          ...prev,
          honey: prev.honey + honeyProductionPerSecond,
          pollen: prev.pollen + pollenProductionPerSecond,
          propolis: prev.propolis + propolisProductionPerSecond,
          workerBees: Math.min(newWorkerBees, newMaxWorkerBees),
          queenBeeBirthCooldown: newQueenBeeBirthCooldown,
          maxWorkerBees: newMaxWorkerBees,
          lastUpdated: Date.now(),
        };
      });
    }, 1000);

    const priceFluctuationInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        honeyPrice: Math.floor(Math.random() * (MARKET_HONEY_PRICE_MAX - MARKET_HONEY_PRICE_MIN + 1)) + MARKET_HONEY_PRICE_MIN,
        pollenPrice: Math.floor(Math.random() * (MARKET_POLLEN_PRICE_MAX - MARKET_POLLEN_PRICE_MIN + 1)) + MARKET_POLLEN_PRICE_MIN,
        propolisPrice: Math.floor(Math.random() * (MARKET_PROPOLIS_PRICE_MAX - MARKET_PROPOLIS_PRICE_MIN + 1)) + MARKET_PROPOLIS_PRICE_MIN,
      }));
    }, MARKET_PRICE_FLUCTUATION_INTERVAL);

    return () => {
      clearInterval(intervalId);
      clearInterval(priceFluctuationInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const collectHoney = useCallback(() => {
    const baseHoneyRate = calculateHoneyProductionRate(gameState.hiveLevel, gameState.workerBees);
    const bonusHoney = baseHoneyRate / 3600 * 10; // 10 seconds of production
    let newPollen = gameState.pollen;
    let newPropolis = gameState.propolis;
    let toastMessages: string[] = [];

    if (Math.random() < POLLEN_CHANCE_ON_COLLECT) {
      newPollen += 1;
      toastMessages.push("1 Pollen");
    }
    if (Math.random() < PROPOLIS_CHANCE_ON_COLLECT) {
      newPropolis += 1;
      toastMessages.push("1 Propolis");
    }

    setGameState(prev => ({
      ...prev,
      honey: prev.honey + bonusHoney,
      pollen: newPollen,
      propolis: newPropolis,
    }));
    
    let description = `Added ${bonusHoney.toFixed(2)} bonus honey.`;
    if (toastMessages.length > 0) {
        description += ` You also found: ${toastMessages.join(' and ')}!`;
    }
    toast({ title: "Bonus Collected!", description });

  }, [gameState.hiveLevel, gameState.workerBees, gameState.pollen, gameState.propolis, toast]);

  const upgradeHive = useCallback(() => {
    const cost = BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, gameState.hiveLevel -1);
    if (gameState.beeCoins >= cost) {
      setGameState(prev => {
        const newHiveLevel = prev.hiveLevel + 1;
        const newMaxBees = calculateMaxWorkerBees(newHiveLevel);
        const newWorkerBees = Math.min(prev.workerBees, newMaxBees); 
        return {
          ...prev,
          beeCoins: prev.beeCoins - cost,
          hiveLevel: newHiveLevel,
          maxWorkerBees: newMaxBees,
          workerBees: newWorkerBees,
          currentHoneyProductionRate: calculateHoneyProductionRate(newHiveLevel, newWorkerBees),
          currentPollenProductionRate: calculatePollenProductionRate(newHiveLevel, newWorkerBees),
          currentPropolisProductionRate: calculatePropolisProductionRate(newHiveLevel),
        };
      });
      toast({ title: "Hive Upgraded!", description: `Hive is now level ${gameState.hiveLevel + 1}. Max bees increased to ${calculateMaxWorkerBees(gameState.hiveLevel + 1)}.` });
    } else {
      toast({ title: "Not enough BeeCoins!", description: `You need ${cost.toFixed(0)} BeeCoins to upgrade.`, variant: "destructive" });
    }
  }, [gameState.beeCoins, gameState.hiveLevel, gameState.workerBees, toast]);

  const addWorkerBees = useCallback((amount: number) => {
    const cost = WORKER_BEE_COST * amount;
    if (gameState.beeCoins < cost) {
      toast({ title: "Not enough BeeCoins!", description: `You need ${cost} BeeCoins.`, variant: "destructive" });
      return;
    }
    if (gameState.workerBees >= gameState.maxWorkerBees) {
      toast({ title: "Hive is Full!", description: `No more space for bees. Upgrade hive to increase capacity.`, variant: "destructive" });
      return;
    }

    const actualAmountToAdd = Math.min(amount, gameState.maxWorkerBees - gameState.workerBees);
    if (actualAmountToAdd <= 0) {
         toast({ title: "Hive is Full!", description: `No more space for bees. Upgrade hive to increase capacity.`, variant: "destructive" });
         return;
    }
    const actualCost = WORKER_BEE_COST * actualAmountToAdd;


    setGameState(prev => {
      const newWorkerBees = prev.workerBees + actualAmountToAdd;
      return {
      ...prev,
      beeCoins: prev.beeCoins - actualCost,
      workerBees: newWorkerBees,
      currentHoneyProductionRate: calculateHoneyProductionRate(prev.hiveLevel, newWorkerBees),
      currentPollenProductionRate: calculatePollenProductionRate(prev.hiveLevel, newWorkerBees),
    }});
    toast({ title: "Worker Bees Acquired!", description: `Added ${actualAmountToAdd} worker bees.` });
    if (actualAmountToAdd < amount) {
        toast({ title: "Hive Reached Capacity", description: `Could only add ${actualAmountToAdd} bees. Upgrade hive for more space.`, variant: "default" });
    }

  }, [gameState.beeCoins, gameState.hiveLevel, gameState.workerBees, gameState.maxWorkerBees, toast]);

  const sellHoney = useCallback((amount: number) => {
    const roundedAmount = parseFloat(amount.toFixed(2));

    if (gameState.honey >= roundedAmount && roundedAmount > 0) {
      const earnings = Math.floor(roundedAmount * gameState.honeyPrice);
      setGameState(prev => ({
        ...prev,
        honey: prev.honey - roundedAmount,
        beeCoins: prev.beeCoins + earnings,
      }));
      toast({ title: "Honey Sold!", description: `You earned ${earnings} BeeCoins.` });
    } else if (roundedAmount <= 0) {
      toast({ title: "Invalid amount!", description: `Amount to sell must be positive.`, variant: "destructive" });
    }
     else {
      toast({ title: "Not enough honey!", description: `You only have ${gameState.honey.toFixed(2)} honey.`, variant: "destructive" });
    }
  }, [gameState.honey, gameState.honeyPrice, toast]);

  const buyHoney = useCallback((amount: number) => {
    const roundedAmount = parseFloat(amount.toFixed(2));
    const cost = Math.floor(roundedAmount * gameState.honeyPrice);
    if (gameState.beeCoins >= cost && roundedAmount > 0) {
      setGameState(prev => ({
        ...prev,
        honey: prev.honey + roundedAmount,
        beeCoins: prev.beeCoins - cost,
      }));
      toast({ title: "Honey Purchased!", description: `You bought ${roundedAmount.toFixed(2)} honey for ${cost} BeeCoins.` });
    } else if (roundedAmount <= 0) {
       toast({ title: "Invalid amount!", description: `Amount to buy must be positive.`, variant: "destructive" });
    } else {
      toast({ title: "Not enough BeeCoins!", description: `You need ${cost} BeeCoins.`, variant: "destructive" });
    }
  }, [gameState.beeCoins, gameState.honeyPrice, toast]);

  const sellPollen = useCallback((amount: number) => {
    const roundedAmount = Math.floor(amount); // Pollen is integer
    if (gameState.pollen >= roundedAmount && roundedAmount > 0) {
      const earnings = Math.floor(roundedAmount * gameState.pollenPrice);
      setGameState(prev => ({
        ...prev,
        pollen: prev.pollen - roundedAmount,
        beeCoins: prev.beeCoins + earnings,
      }));
      toast({ title: "Pollen Sold!", description: `You earned ${earnings} BeeCoins.` });
    } else if (roundedAmount <= 0) {
      toast({ title: "Invalid amount!", description: `Amount to sell must be positive.`, variant: "destructive" });
    } else {
      toast({ title: "Not enough pollen!", description: `You only have ${gameState.pollen.toFixed(0)} pollen.`, variant: "destructive" });
    }
  }, [gameState.pollen, gameState.pollenPrice, toast]);

  const sellPropolis = useCallback((amount: number) => {
    const roundedAmount = Math.floor(amount); // Propolis is integer
    if (gameState.propolis >= roundedAmount && roundedAmount > 0) {
      const earnings = Math.floor(roundedAmount * gameState.propolisPrice);
      setGameState(prev => ({
        ...prev,
        propolis: prev.propolis - roundedAmount,
        beeCoins: prev.beeCoins + earnings,
      }));
      toast({ title: "Propolis Sold!", description: `You earned ${earnings} BeeCoins.` });
    } else if (roundedAmount <= 0) {
      toast({ title: "Invalid amount!", description: `Amount to sell must be positive.`, variant: "destructive" });
    } else {
      toast({ title: "Not enough propolis!", description: `You only have ${gameState.propolis.toFixed(0)} propolis.`, variant: "destructive" });
    }
  }, [gameState.propolis, gameState.propolisPrice, toast]);


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
    <GameContext.Provider value={{ 
      ...gameState, 
      collectHoney, 
      upgradeHive, 
      addWorkerBees, 
      sellHoney, 
      buyHoney, 
      sellPollen,
      sellPropolis,
      getAIOptimization 
    }}>
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
