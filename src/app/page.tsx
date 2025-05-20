
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { TopResourceDisplay } from '@/app/(components)/TopResourceDisplay';
import { MarketModal } from '@/app/(components)/MarketModal';
import { AIOptimizationModal } from '@/app/(components)/AIOptimizationModal';
import { HiveActionsModal } from '@/app/(components)/HiveActionsModal';
import { useGame } from '@/app/(context)/GameContext';
import { Users, Home as HomeIcon } from 'lucide-react';
import {
  INITIAL_WORKER_BEES,
  INITIAL_HIVE_LEVEL,
  BASE_PRODUCTION_PER_BEE_PER_SECOND,
} from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatLargeNumber } from '@/lib/utils';

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
          {/* Main content area: Pushes content (hive) to the bottom and adds padding */}
          <main className="flex flex-col items-center justify-end p-4 pb-8 min-h-[calc(100%-100px)] relative">
            {/* Increased margin-top to move the hive further down */}
            <div className="text-center mt-8">
              <div className="relative inline-block">
                <Image
                  src="/assets/images/hive.png"
                  alt="Arı Kovanı"
                  width={180}
                  height={180}
                  className="object-contain drop-shadow-xl"
                  data-ai-hint="cartoon beehive"
                  priority
                />
                {/* Info card positioned relative to the hive image */}
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
                      Prod: <span className="font-semibold">{formatLargeNumber(displayCurrentHoneyProductionRate)}</span>/hr
                  </p>
                </div>
              </div>
            </div>
          </main>
        </ScrollArea>

        <footer className="p-3 bg-black/60 backdrop-blur-lg border-t border-white/20">
          <div className="grid grid-cols-3 gap-2">
            <HiveActionsModal />
            <MarketModal />
            <AIOptimizationModal />
          </div>
        </footer>
      </div>
    </div>
  );
}
