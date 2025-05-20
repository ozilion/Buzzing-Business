
"use client";

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TopResourceDisplay } from '@/app/(components)/TopResourceDisplay';
import { MarketModal } from '@/app/(components)/MarketModal';
import { AIOptimizationModal } from '@/app/(components)/AIOptimizationModal';
import { HiveActionsModal } from '@/app/(components)/HiveActionsModal';
import { useGame } from '@/app/(context)/GameContext';
import { Users, Home as HomeIcon, ShoppingCart, Brain } from 'lucide-react';
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
    className: `${style.size} ${style.rotate} transform z-10`,
    style: { top: style.top, left: style.left, position: 'absolute' as const },
  };
});

// User-adjusted HIVE_POINT, representing the hive entrance.
// Example: { x: 175, y: 169 } - User should have their specific correct value.
const HIVE_POINT = { x: 175, y: 169 }; // Using example, user has their own value

// Potential flower target points for the bee (pixel coordinates relative to main container)
const POTENTIAL_FLOWER_TARGETS = [
  { x: 70, y: 480 }, { x: 180, y: 530 }, { x: 290, y: 490 },
  { x: 100, y: 510 }, { x: 250, y: 520 }, { x: 150, y: 470 },
  { x: 220, y: 480 }, { x: 50, y: 500 }, { x: 300, y: 510 },
  { x: 120, y: 460 },
];

const FLIGHT_DURATION = 2000; // 2 seconds to fly
const STAY_DURATION = 2000;   // 2 seconds at flower/hive

// Helper function to get N unique random elements from an array
function getRandomUniqueElements<T>(arr: T[], numElements: number): T[] {
  if (numElements > arr.length) {
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
    currentHoneyProductionRate: contextHoneyProductionRate,
  } = useGame();

  const [displayWorkerBees, setDisplayWorkerBees] = useState(INITIAL_WORKER_BEES);
  const [displayHiveLevel, setDisplayHiveLevel] = useState(INITIAL_HIVE_LEVEL);
  const [displayCurrentHoneyProductionRate, setDisplayCurrentHoneyProductionRate] = useState(0);

  const [beePosition, setBeePosition] = useState(HIVE_POINT);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [currentFlightPath, setCurrentFlightPath] = useState<Array<{x: number; y: number}>>([]);
  // Ref to manage pause state at the beginning of each hive visit (start of a new tour)
  const hasPausedAtCurrentHiveStartRef = useRef(false);


  const generateNewFlightPath = useCallback(() => {
    const randomFlowers = getRandomUniqueElements(POTENTIAL_FLOWER_TARGETS, 3);
    setCurrentFlightPath([HIVE_POINT, ...randomFlowers]); // Path: Hive, F1, F2, F3
    setCurrentPathIndex(0); // Start path from the beginning (Hive)
    setBeePosition(HIVE_POINT); // Ensure bee is visually at hive
    hasPausedAtCurrentHiveStartRef.current = false; // Reset pause flag for the new path start at Hive
  }, []);

  useEffect(() => {
    // Generate initial flight path when the component mounts
    generateNewFlightPath();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount as generateNewFlightPath is memoized

  useEffect(() => {
    if (currentFlightPath.length === 0) return; // Path not yet generated

    const targetPosition = currentFlightPath[currentPathIndex];
    // Set bee position to current target. The visual transition is handled by CSS.
    setBeePosition(targetPosition);

    let delay;

    if (currentPathIndex === 0 && !hasPausedAtCurrentHiveStartRef.current) {
      // This condition is met at the start of a new flight path (when bee is at HIVE_POINT).
      // Pause at the hive before flying out.
      delay = STAY_DURATION;
      hasPausedAtCurrentHiveStartRef.current = true; // Mark that pause for this hive visit has been initiated
    } else {
      // For all other movements:
      // - Flying from Hive (index 0, after initial pause) to Flower 1 (index 1)
      // - Flying from Flower X to Flower Y
      // - Flying from Last Flower and logically arriving at Hive (next index would be 0, triggering path regeneration)
      // The delay includes the flight time to the *current* target and the stay duration *at* that target.
      delay = FLIGHT_DURATION + STAY_DURATION;
    }

    const timer = setTimeout(() => {
      const nextIdx = (currentPathIndex + 1) % currentFlightPath.length;
      if (nextIdx === 0) {
        // Bee has completed a tour (H -> F1 -> F2 -> F3 -> H_implicitly)
        // and is now logically at the last flower (index 3),
        // about to "return" to hive by generating a new path that starts at the hive.
        generateNewFlightPath();
      } else {
        // Move to the next point in the current path (e.g., next flower)
        setCurrentPathIndex(nextIdx);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentPathIndex, currentFlightPath, generateNewFlightPath]);


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
          {/* The main content area for the hive and flowers */}
          <main className="flex flex-col items-center justify-end p-4 pb-8 min-h-[calc(100%-100px)] relative">
            {/* Hive Section - Positioned towards the bottom by justify-end and padding */}
            <div className="relative inline-block mt-12 text-center"> {/* mt-12 to push down a bit more if needed */}
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

            {/* Flower Container - Positioned below the hive */}
            <div className="relative w-full h-32 mt-4"> {/* Adjust h-32 and mt-4 as needed */}
              {flowersData.map(flower => (
                <Image
                  key={flower.id}
                  src={flower.src}
                  alt={flower.alt}
                  width={50} // Default width, overridden by className
                  height={50} // Default height, overridden by className
                  className={flower.className}
                  style={flower.style}
                  unoptimized={true} // Important for GIFs
                  data-ai-hint="animated flower"
                />
              ))}
            </div>

            {/* Animated Bee */}
            <Image
              src="/assets/images/bee_1.gif"
              alt="Flying bee"
              width={30} // Adjust size as needed
              height={30} // Adjust size as needed
              unoptimized={true} // Important for GIFs
              className="absolute z-20 transition-all ease-in-out pointer-events-none"
              style={{
                top: `${beePosition.y}px`,
                left: `${beePosition.x}px`,
                transitionDuration: `${FLIGHT_DURATION}ms`,
                // transform: 'translate(-50%, -50%)' // Optional: centers the bee image on its coordinates
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
    
