
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TopResourceDisplay } from '@/app/(components)/TopResourceDisplay';
import { MarketModal } from '@/app/(components)/MarketModal';
import { AIOptimizationModal } from '@/app/(components)/AIOptimizationModal';
import { HiveActionsModal } from '@/app/(components)/HiveActionsModal';
import { useGame } from '@/app/(context)/GameContext';
import { ThemeToggle } from '@/app/(components)/ThemeToggle';
import { Users, Home as HomeIcon, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    collectHoney, // Added collectHoney
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

        {/* Bonus Button - Positioned below TopResourceDisplay */}
        <Button
          onClick={collectHoney}
          variant="ghost"
          size="icon"
          className="absolute top-[80px] left-3 z-20 h-9 w-9 bg-yellow-500/30 hover:bg-yellow-500/50 text-white shadow-md"
          aria-label="Collect Bonus"
        >
          <PackagePlus className="h-5 w-5" />
        </Button>

        <ScrollArea className="flex-1">
          <main className="flex flex-col items-center justify-center p-4 min-h-[calc(100%-140px)] relative"> {/* Adjusted min-height slightly for new layout */}
            <div className="text-center my-auto"> {/* Vertically centers the hive section if space allows */}
              <div className="relative inline-block"> {/* Wrapper for image and info card to allow absolute positioning of info card */}
                <Image
                  src="/assets/images/hive.png"
                  alt="Arı Kovanı"
                  width={180}
                  height={180}
                  className="object-contain drop-shadow-xl" // mx-auto removed, inline-block with text-center on parent handles centering
                  data-ai-hint="cartoon beehive"
                  priority
                />
                {/* Hive Info Card - Positioned top-right of the image */}
                <div className="absolute top-1 -right-2 p-2 text-on-image-bg space-y-1 rounded-md max-w-[150px] text-xs shadow-lg">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-yellow-300" />
                    <span>Bees: <span className="font-bold">{displayWorkerBees}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HomeIcon className="h-3 w-3 text-yellow-300" />
                    <span>Level: <span className="font-bold">{displayHiveLevel}</span></span>
                  </div>
                  <p className="text-left">
                      Prod: <span className="font-semibold">{displayCurrentHoneyProductionRate.toFixed(2)}</span>/hr
                  </p>
                </div>
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
          {/* Copyright text removed */}
        </footer>
      </div>
    </div>
  );
}
