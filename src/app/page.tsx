
"use client";

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TopResourceDisplay } from '@/app/(components)/TopResourceDisplay';
import { MarketModal } from '@/app/(components)/MarketModal';
import { AIOptimizationModal } from '@/app/(components)/AIOptimizationModal';
import { HiveActionsModal } from '@/app/(components)/HiveActionsModal';
import { useGame } from '@/app/(context)/GameContext';
import { Users, Home as HomeIcon } from 'lucide-react';
import {
  INITIAL_WORKER_BEES,
  INITIAL_HIVE_LEVEL,
  BASE_MAX_WORKER_BEES,
  MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL,
} from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatLargeNumber } from '@/lib/utils';

const flowerImagePaths = [
  '/assets/flowers/sunflower.gif',
  '/assets/flowers/rose.gif',
  '/assets/flowers/growing_plant.gif',
];

const flowerVisualPositions = [
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

const flowersData = Array.from({ length: 18 }).map((_, index) => {
  const typeIndex = index % flowerImagePaths.length;
  const style = flowerVisualPositions[index % flowerVisualPositions.length];

  return {
    id: `flower-${index}`,
    src: flowerImagePaths[typeIndex],
    alt: `Animated flower type ${typeIndex + 1}`,
    className: `${style.size} ${style.rotate} transform z-10`,
    style: { top: style.top, left: style.left, position: 'absolute' as const },
  };
});

const HIVE_POINT = { x: 190, y: 169 }; 

const FLOWER_CONTAINER_TOP_OFFSET = 48 + 180 + 16; 
const FLOWER_CONTAINER_HEIGHT = 128; 
const APPROX_MAIN_CONTENT_WIDTH = 420 - (2 * 16); 

const POTENTIAL_FLOWER_TARGETS = flowerVisualPositions.map(p => {
  const topPercent = parseFloat(p.top) / 100;
  const leftPercent = parseFloat(p.left) / 100;
  
  let sizePx = 40; 
  if (p.size.includes('w-11')) sizePx = 44; 
  else if (p.size.includes('w-12')) sizePx = 48; 
  else if (p.size.includes('w-14')) sizePx = 56; 

  const centerX = Math.round(leftPercent * APPROX_MAIN_CONTENT_WIDTH + sizePx / 2);
  const centerY = Math.round(FLOWER_CONTAINER_TOP_OFFSET + (topPercent * FLOWER_CONTAINER_HEIGHT) + (sizePx / 2));
  
  const targetX = centerX + 10; // 10px right of center
  const targetY = centerY + 10; // 10px down from center

  return { x: targetX, y: targetY };
});


const FLIGHT_DURATION = 2000; 
const STAY_DURATION = 2000;   

function getRandomUniqueElements<T>(arr: T[], numElements: number): T[] {
  if (numElements >= arr.length) {
    const shuffledAll = [...arr].sort(() => 0.5 - Math.random());
    return shuffledAll.slice(0, arr.length);
  }
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numElements);
}

export default function HomePage() {
  const {
    hiveLevel: contextHiveLevel,
    workerBees: contextWorkerBees,
    maxWorkerBees: contextMaxWorkerBees,
    currentHoneyProductionRate: contextHoneyProductionRate,
  } = useGame();

  const [displayWorkerBees, setDisplayWorkerBees] = useState(INITIAL_WORKER_BEES);
  const [displayMaxWorkerBees, setDisplayMaxWorkerBees] = useState(BASE_MAX_WORKER_BEES + (INITIAL_HIVE_LEVEL -1) * MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL);
  const [displayHiveLevel, setDisplayHiveLevel] = useState(INITIAL_HIVE_LEVEL);
  const [displayCurrentHoneyProductionRate, setDisplayCurrentHoneyProductionRate] = useState(0);

  const [beePosition, setBeePosition] = useState(HIVE_POINT);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [currentFlightPath, setCurrentFlightPath] = useState<Array<{x: number; y: number}>>([]);
  const hasPausedAtCurrentHiveStartRef = useRef(false);

  const generateNewFlightPath = useCallback(() => {
    const randomFlowers = getRandomUniqueElements(POTENTIAL_FLOWER_TARGETS, 3);
    setCurrentFlightPath([HIVE_POINT, ...randomFlowers]); 
    setCurrentPathIndex(0); 
    setBeePosition(HIVE_POINT); 
    hasPausedAtCurrentHiveStartRef.current = false; 
  }, []);

  useEffect(() => {
    generateNewFlightPath();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (currentFlightPath.length === 0) return; 

    const targetPosition = currentFlightPath[currentPathIndex];
    setBeePosition(targetPosition);

    let delay;

    if (currentPathIndex === 0 && !hasPausedAtCurrentHiveStartRef.current) {
      delay = STAY_DURATION; 
      hasPausedAtCurrentHiveStartRef.current = true; 
    } else {
      delay = FLIGHT_DURATION + STAY_DURATION; 
    }

    const timer = setTimeout(() => {
      const nextIdx = (currentPathIndex + 1);
      if (nextIdx >= currentFlightPath.length) { 
        generateNewFlightPath(); 
      } else {
        setCurrentPathIndex(nextIdx);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentPathIndex, currentFlightPath, generateNewFlightPath]);


  useEffect(() => {
    setDisplayWorkerBees(contextWorkerBees);
    setDisplayMaxWorkerBees(contextMaxWorkerBees);
    setDisplayHiveLevel(contextHiveLevel);
    setDisplayCurrentHoneyProductionRate(contextHoneyProductionRate);
  }, [contextWorkerBees, contextMaxWorkerBees, contextHiveLevel, contextHoneyProductionRate]);


  return (
    <div className="mobile-screen-desktop-wrapper">
      <div
        className="mobile-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/images/scene.png)' }}
      >
        <TopResourceDisplay />

        <ScrollArea className="flex-1">
          <main className="flex flex-col items-center justify-end p-4 pb-8 min-h-[calc(100%-100px)] relative">
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
                  <span>Bees: <span className="font-bold">{displayWorkerBees} / {displayMaxWorkerBees}</span></span>
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
                transform: 'translate(-50%, -50%)', 
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
