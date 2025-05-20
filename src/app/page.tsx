
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
} from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatLargeNumber } from '@/lib/utils';

const flowerImagePaths = [
  '/assets/flowers/sunflower.gif',
  '/assets/flowers/rose.gif',
  '/assets/flowers/growing_plant.gif',
];

const flowersData = Array.from({ length: 18 }).map((_, index) => {
  const typeIndex = index % flowerImagePaths.length;
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
    { top: '25%', left: '5%', size: 'w-11 h-11', rotate: 'rotate-[8deg]' },
    { top: '45%', left: '50%', size: 'w-10 h-10', rotate: 'rotate-[-12deg]' },
    { top: '75%', left: '15%', size: 'w-12 h-12', rotate: 'rotate-[22deg]' },
    { top: '10%', left: '80%', size: 'w-10 h-10', rotate: 'rotate-[30deg]' },
    { top: '50%', left: '70%', size: 'w-11 h-11', rotate: 'rotate-[-25deg]' },
    { top: '85%', left: '55%', size: 'w-12 h-12', rotate: 'rotate-[12deg]' },
  ];
  const style = positions[index % positions.length];

  return {
    id: `flower-${index}`,
    src: flowerImagePaths[typeIndex],
    alt: `Animated flower type ${typeIndex + 1}`,
    className: `${style.size} ${style.rotate} transform z-10`, // Added z-10
    style: { top: style.top, left: style.left, position: 'absolute' as const },
  };
});

// Define bee flight path coordinates (relative to the main content area)
// These are approximate and might need fine-tuning
// Assuming main content area width ~380px, height ~600px for content
const HIVE_POINT = { x: 175, y: 380 }; // Adjusted for bee size (30x30), near hive center
const FLOWER_POINT_1 = { x: 70, y: 480 }; // Lower-left flower area
const FLOWER_POINT_2 = { x: 180, y: 530 }; // Lower-mid flower area
const FLOWER_POINT_3 = { x: 290, y: 490 }; // Lower-right flower area

const flightPath = [
  HIVE_POINT,
  FLOWER_POINT_1,
  FLOWER_POINT_2,
  FLOWER_POINT_3,
];

const FLIGHT_DURATION = 2000; // 2 seconds to fly
const STAY_DURATION = 1500; // 1.5 seconds at flower/hive

export default function HomePage() {
  const {
    hiveLevel: contextHiveLevel,
    workerBees: contextWorkerBees,
    currentHoneyProductionRate: contextHoneyProductionRate,
  } = useGame();

  const [displayWorkerBees, setDisplayWorkerBees] = useState(INITIAL_WORKER_BEES);
  const [displayHiveLevel, setDisplayHiveLevel] = useState(INITIAL_HIVE_LEVEL);
  const [displayCurrentHoneyProductionRate, setDisplayCurrentHoneyProductionRate] = useState(0);

  const [beePosition, setBeePosition] = useState(HIVE_POINT);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);

  useEffect(() => {
    setDisplayWorkerBees(contextWorkerBees);
    setDisplayHiveLevel(contextHiveLevel);
    setDisplayCurrentHoneyProductionRate(contextHoneyProductionRate);
  }, [contextWorkerBees, contextHiveLevel, contextHoneyProductionRate]);

  useEffect(() => {
    const animateBee = () => {
      // Set target position for the bee
      setBeePosition(flightPath[currentPathIndex]);

      // Determine next index
      const nextIndex = (currentPathIndex + 1) % flightPath.length;

      // Schedule next movement
      const timer = setTimeout(() => {
        setCurrentPathIndex(nextIndex);
      }, FLIGHT_DURATION + STAY_DURATION);

      return () => clearTimeout(timer);
    };

    const animationTimeoutId = animateBee();
    return () => clearTimeout(animationTimeoutId); // Clear timeout if component unmounts or index changes

  }, [currentPathIndex]);


  return (
    <div className="mobile-screen-desktop-wrapper">
      <div
        className="mobile-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/images/scene.png)' }}
      >
        <TopResourceDisplay />

        <ScrollArea className="flex-1">
          <main className="flex flex-col items-center justify-end p-4 pb-8 min-h-[calc(100%-100px)] relative">
            {/* Hive Section */}
            <div className="relative inline-block mt-12 text-center">
              <Image
                src="/assets/images/hive.png"
                alt="Beehive"
                width={180}
                height={180}
                className="object-contain drop-shadow-xl"
                data-ai-hint="cartoon beehive"
                priority
              />
              <div className="absolute top-1 -right-2 p-1.5 text-on-image-bg space-y-0.5 rounded-md max-w-[150px] text-[10px] shadow-lg bg-black/60 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5 text-yellow-300" />
                  <span>Bees: <span className="font-bold">{displayWorkerBees}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  <HomeIcon className="h-2.5 w-2.5 text-yellow-300" />
                  <span>Level: <span className="font-bold">{displayHiveLevel}</span></span>
                </div>
                <p className="text-left">
                  Prod: <span className="font-semibold">{formatLargeNumber(displayCurrentHoneyProductionRate)}</span>/hr
                </p>
              </div>
            </div>

            {/* Flower Container */}
            <div className="relative w-full h-32 mt-4">
              {flowersData.map(flower => (
                <Image
                  key={flower.id}
                  src={flower.src}
                  alt={flower.alt}
                  width={50}
                  height={50}
                  className={flower.className}
                  style={flower.style}
                  unoptimized={true}
                  data-ai-hint="animated flower"
                />
              ))}
            </div>

            {/* Animated Bee */}
            <Image
              src="/assets/images/bee_1.gif"
              alt="Flying bee"
              width={30}
              height={30}
              unoptimized={true}
              className="absolute z-20 transition-all ease-in-out pointer-events-none"
              style={{
                top: `${beePosition.y}px`,
                left: `${beePosition.x}px`,
                transitionDuration: `${FLIGHT_DURATION}ms`,
              }}
              data-ai-hint="animated bee"
            />
          </main>
        </ScrollArea>

        <footer className="p-2 bg-black/50 backdrop-blur-md border-t border-white/20">
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
