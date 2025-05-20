
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

// Define flower data: 3 types, 6 of each = 18 flowers
const flowerTypes = [
  '/assets/flowers/sunflower.gif',
  '/assets/flowers/rose.gif',
  '/assets/flowers/growing_plant.gif',
];

const flowersData = Array.from({ length: 18 }).map((_, index) => {
  const typeIndex = index % flowerTypes.length;
  const positions = [
    { top: '5%', left: '10%', size: 'w-10 h-10', rotate: 'rotate-[-15deg]' },
    { top: '15%', left: '30%', size: 'w-12 h-12', rotate: 'rotate-[5deg]' },
    { top: '8%', left: '50%', size: 'w-10 h-10', rotate: 'rotate-[20deg]' },
    { top: '20%', left: '70%', size: 'w-14 h-14', rotate: 'rotate-[-10deg]' },
    { top: '35%', left: '85%', size: 'w-10 h-10', rotate: 'rotate-[25deg]' },
    { top: '40%', left: '20%', size: 'w-12 h-12', rotate: 'rotate-[-5deg]' },
    { top: '50%', left: '40%', size: 'w-10 h-10', rotate: 'rotate-[15deg]' },
    { top: '55%', left: '60%', size: 'w-14 h-14', rotate: 'rotate-[-20deg]' },
    { top: '65%', left: '5%', size: 'w-12 h-12', rotate: 'rotate-[10deg]' },
    { top: '70%', left: '75%', size: 'w-10 h-10', rotate: 'rotate-[-8deg]' },
    { top: '80%', left: '30%', size: 'w-12 h-12', rotate: 'rotate-[18deg]' },
    { top: '60%', left: '90%', size: 'w-10 h-10', rotate: 'rotate-[-22deg]' },
    // Additional 6 flower positions
    { top: '25%', left: '5%', size: 'w-11 h-11', rotate: 'rotate-[8deg]' },
    { top: '45%', left: '50%', size: 'w-10 h-10', rotate: 'rotate-[-12deg]' },
    { top: '75%', left: '15%', size: 'w-12 h-12', rotate: 'rotate-[22deg]' },
    { top: '10%', left: '80%', size: 'w-10 h-10', rotate: 'rotate-[30deg]' },
    { top: '50%', left: '70%', size: 'w-11 h-11', rotate: 'rotate-[-25deg]' },
    { top: '85%', left: '55%', size: 'w-12 h-12', rotate: 'rotate-[12deg]' },
  ];
  const style = positions[index % positions.length]; // Cycle through predefined styles

  return {
    id: `flower-${index}`,
    src: flowerTypes[typeIndex],
    alt: `Animated flower type ${typeIndex + 1}`,
    className: `${style.size} ${style.rotate} transform`,
    style: { top: style.top, left: style.left, position: 'absolute' as const },
  };
});


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
          <main className="flex flex-col items-center justify-end p-4 pb-8 min-h-[calc(100%-100px)] relative">
            <div className="text-center mt-12">
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

            {/* Flower Container */}
            <div className="relative w-full h-32 mt-4"> {/* Adjust height (h-32) and margin-top (mt-4) as needed */}
              {flowersData.map(flower => (
                <Image
                  key={flower.id}
                  src={flower.src}
                  alt={flower.alt}
                  width={50} // Default width, overridden by className
                  height={50} // Default height, overridden by className
                  className={flower.className}
                  style={flower.style}
                  unoptimized={true} // Important for GIFs to preserve animation
                  data-ai-hint="animated flower"
                />
              ))}
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

