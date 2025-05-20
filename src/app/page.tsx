
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TopResourceDisplay } from '@/app/(components)/TopResourceDisplay';
import { MarketModal } from '@/app/(components)/MarketModal';
import { AIOptimizationModal } from '@/app/(components)/AIOptimizationModal';
import { HiveActionsModal } from '@/app/(components)/HiveActionsModal'; // Yeni modal import edildi
import { useGame } from '@/app/(context)/GameContext';
import { ThemeToggle } from '@/app/(components)/ThemeToggle';
import { Users, Home as HomeIcon } from 'lucide-react'; // Home Icon import edildi
import {
  INITIAL_WORKER_BEES,
  INITIAL_HIVE_LEVEL,
  BASE_PRODUCTION_PER_BEE_PER_SECOND,
} from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  const {
    hiveLevel: contextHiveLevel,
    workerBees: contextWorkerBees,
    currentHoneyProductionRate: contextHoneyProductionRate,
  } = useGame();

  const [displayWorkerBees, setDisplayWorkerBees] = useState(INITIAL_WORKER_BEES);
  const [displayHiveLevel, setDisplayHiveLevel] = useState(INITIAL_HIVE_LEVEL);
  const [displayCurrentHoneyProductionRate, setDisplayCurrentHoneyProductionRate] = useState(
    INITIAL_HIVE_LEVEL * INITIAL_WORKER_BEES * BASE_PRODUCTION_PER_BEE_PER_SECOND * 3600
  );

  useEffect(() => {
    setDisplayWorkerBees(contextWorkerBees);
    setDisplayHiveLevel(contextHiveLevel);
    setDisplayCurrentHoneyProductionRate(contextHoneyProductionRate);
  }, [contextWorkerBees, contextHiveLevel, contextHoneyProductionRate]);


  return (
    <div className="mobile-screen-desktop-wrapper">
      <div 
        className="mobile-screen bg-cover bg-center" 
        style={{ backgroundImage: 'url(/assets/images/scene.png)' }}
      >
        <TopResourceDisplay />
        
        <ScrollArea className="flex-1">
          <main className="flex flex-col items-center justify-center p-4 min-h-[calc(100%-160px)] relative"> {/* Adjust min-height based on header/footer & add relative for positioning */}
            <div className="text-center my-auto"> {/* Added my-auto for vertical centering if space allows */}
              <Image 
                src="/assets/images/hive.png" 
                alt="Arı Kovanı" 
                width={180} 
                height={180} 
                className="object-contain drop-shadow-xl mx-auto"
                data-ai-hint="cartoon beehive"
                priority
              />
              <div className="mt-6 p-4 text-on-image-bg space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-yellow-300" />
                  <p className="text-base">Worker Bees: <span className="font-bold text-lg">{displayWorkerBees}</span></p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <HomeIcon className="h-6 w-6 text-yellow-300" />
                  <p className="text-base">Hive Level: <span className="font-bold text-lg">{displayHiveLevel}</span></p>
                </div>
                <p className="text-sm">Honey Production: <span className="font-semibold">{displayCurrentHoneyProductionRate.toFixed(2)}</span> units/hr</p>
              </div>
            </div>
          </main>
        </ScrollArea>
        
        <div className="absolute top-3 right-3 z-20">
            <ThemeToggle />
        </div>

        <footer className="p-3 bg-black/60 backdrop-blur-lg border-t border-white/20">
          <div className="grid grid-cols-3 gap-2">
            <HiveActionsModal />
            <MarketModal />
            <AIOptimizationModal />
          </div>
          <p className="text-center text-xs text-gray-400 mt-3 pb-1">
            &copy; {new Date().getFullYear()} Buzzing Business
          </p>
        </footer>
      </div>
    </div>
  );
}
