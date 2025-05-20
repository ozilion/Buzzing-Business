
"use client";

import { useGame } from '@/app/(context)/GameContext';
import { ResourceCard } from './ResourceCard';
import { INITIAL_BEE_COINS, INITIAL_HONEY, INITIAL_POLLEN, INITIAL_PROPOLIS } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function TopResourceDisplay() {
  const { honey, pollen, propolis, beeCoins } = useGame();

  const [displayHoney, setDisplayHoney] = useState(INITIAL_HONEY);
  const [displayPollen, setDisplayPollen] = useState(INITIAL_POLLEN);
  const [displayPropolis, setDisplayPropolis] = useState(INITIAL_PROPOLIS);
  const [displayBeeCoins, setDisplayBeeCoins] = useState(INITIAL_BEE_COINS);

  useEffect(() => {
    setDisplayHoney(honey);
    setDisplayPollen(pollen);
    setDisplayPropolis(propolis);
    setDisplayBeeCoins(beeCoins);
  }, [honey, pollen, propolis, beeCoins]);

  const cardClassName = "bg-transparent border-none shadow-none text-white [&_.text-muted-foreground]:text-gray-300 [&_.text-2xl]:text-lg [&_.text-xs]:text-[10px] p-1";

  return (
    <div className="py-0.5 px-2 bg-black/40 backdrop-blur-sm sticky top-0 z-10"> {/* Reduced vertical padding */}
      <div className="grid grid-cols-4 gap-1">
        <ResourceCard type="honey" value={displayHoney} className={cn(cardClassName, "[&_.text-2xl]:text-yellow-300")} />
        <ResourceCard type="pollen" value={displayPollen} className={cn(cardClassName, "[&_.text-2xl]:text-purple-300")} />
        <ResourceCard type="propolis" value={displayPropolis} className={cn(cardClassName, "[&_.text-2xl]:text-green-300")} />
        <ResourceCard type="beeCoins" value={displayBeeCoins} className={cn(cardClassName, "[&_.text-2xl]:text-amber-400")} />
      </div>
    </div>
  );
}
