
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/app/(components)/AppHeader';
import { ResourceCard } from '@/app/(components)/ResourceCard';
import { HiveManagementCard } from '@/app/(components)/HiveManagementCard';
import { MarketModal } from '@/app/(components)/MarketModal';
import { AIOptimizationModal } from '@/app/(components)/AIOptimizationModal';
import { useGame } from '@/app/(context)/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  INITIAL_HONEY,
  INITIAL_POLLEN,
  INITIAL_PROPOLIS,
  INITIAL_BEE_COINS
} from '@/lib/constants';

export default function HomePage() {
  const { honey, pollen, propolis, beeCoins } = useGame();

  // State for values to display, initialized to match server-rendered output
  const [displayHoney, setDisplayHoney] = useState<number>(INITIAL_HONEY);
  const [displayPollen, setDisplayPollen] = useState<number>(INITIAL_POLLEN);
  const [displayPropolis, setDisplayPropolis] = useState<number>(INITIAL_PROPOLIS);
  const [displayBeeCoins, setDisplayBeeCoins] = useState<number>(INITIAL_BEE_COINS);

  // Effect to update display values after client-side hydration and context updates
  useEffect(() => {
    setDisplayHoney(honey);
    setDisplayPollen(pollen);
    setDisplayPropolis(propolis);
    setDisplayBeeCoins(beeCoins);
  }, [honey, pollen, propolis, beeCoins]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <ScrollArea className="flex-1">
        <main className="container mx-auto p-4 sm:p-6 md:p-8">
          <div className="grid gap-6 md:gap-8">
            {/* Resources Overview */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground/90">Your Resources</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ResourceCard type="honey" value={displayHoney} />
                <ResourceCard type="pollen" value={displayPollen} />
                <ResourceCard type="propolis" value={displayPropolis} />
                <ResourceCard type="beeCoins" value={displayBeeCoins} />
              </div>
            </section>

            {/* Hive Management */}
            <section>
               <HiveManagementCard />
            </section>
            
            {/* Actions Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <MarketModal />
                <AIOptimizationModal />
            </section>
          </div>
        </main>
      </ScrollArea>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Buzzing Business. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
