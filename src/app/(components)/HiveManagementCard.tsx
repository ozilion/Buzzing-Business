
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/app/(context)/GameContext';
import { Home, Users, PlusCircle, ArrowUpCircle, PackagePlus } from 'lucide-react';
import { 
  BASE_HIVE_UPGRADE_COST, 
  HIVE_UPGRADE_COST_MULTIPLIER, 
  WORKER_BEE_COST,
  INITIAL_HIVE_LEVEL,
  INITIAL_WORKER_BEES,
  BASE_PRODUCTION_PER_BEE_PER_SECOND,
  INITIAL_HONEY_PRICE // Added for calculating initial upgrade cost correctly
} from '@/lib/constants';

export function HiveManagementCard() {
  const { 
    hiveLevel: contextHiveLevel, 
    workerBees: contextWorkerBees, 
    currentHoneyProductionRate: contextHoneyProductionRate, 
    collectHoney, 
    upgradeHive, 
    addWorkerBees 
  } = useGame();

  // State for values to display, initialized to match server-rendered output
  const [displayWorkerBees, setDisplayWorkerBees] = useState(INITIAL_WORKER_BEES);
  const [displayHiveLevel, setDisplayHiveLevel] = useState(INITIAL_HIVE_LEVEL);
  const [displayCurrentHoneyProductionRate, setDisplayCurrentHoneyProductionRate] = useState(
    INITIAL_HIVE_LEVEL * INITIAL_WORKER_BEES * BASE_PRODUCTION_PER_BEE_PER_SECOND * 3600
  );
  const [displayNextUpgradeCost, setDisplayNextUpgradeCost] = useState(
    BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, INITIAL_HIVE_LEVEL - 1)
  );

  // Effect to update display values after client-side hydration and context updates
  useEffect(() => {
    setDisplayWorkerBees(contextWorkerBees);
    setDisplayHiveLevel(contextHiveLevel);
    setDisplayCurrentHoneyProductionRate(contextHoneyProductionRate);
    // Recalculate next upgrade cost based on the context hive level
    setDisplayNextUpgradeCost(
      BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, contextHiveLevel - 1)
    );
  }, [contextWorkerBees, contextHiveLevel, contextHoneyProductionRate]);

  return (
    <Card className="shadow-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">My Hive</CardTitle>
          <Home className="h-8 w-8 text-primary" />
        </div>
        <CardDescription>Manage and grow your bee colony.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-full h-48 rounded-md overflow-hidden mb-4">
            {/* Background Image */}
            <Image
              src="/images/scene.png"
              alt="Beehive scene"
              layout="fill"
              objectFit="cover"
              className="z-0"
              data-ai-hint="nature landscape"
            />
            {/* Overlay Image Container */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="relative w-32 h-32"> {/* Adjust size as needed */}
                <Image
                  src="/images/hive.png"
                  alt="Beehive"
                  layout="fill"
                  objectFit="contain"
                  data-ai-hint="beehive"
                />
              </div>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Worker Bees</p>
            <p className="text-xl font-bold">{displayWorkerBees}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <ArrowUpCircle className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Hive Level</p>
            <p className="text-xl font-bold">{displayHiveLevel}</p>
          </div>
        </div>

        <div className="text-center p-3 bg-accent/10 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">Honey Production</p>
            <p className="text-lg font-semibold text-foreground">{displayCurrentHoneyProductionRate.toFixed(2)} units/hour</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
        <Button onClick={collectHoney} className="w-full sm:w-auto flex-1 bg-primary hover:bg-primary/90">
          <PackagePlus className="mr-2 h-4 w-4" /> Collect Bonus
        </Button>
        <Button onClick={upgradeHive} variant="outline" className="w-full sm:w-auto flex-1">
          <ArrowUpCircle className="mr-2 h-4 w-4" /> Upgrade Hive ({displayNextUpgradeCost.toFixed(0)} Coins)
        </Button>
        <Button onClick={() => addWorkerBees(1)} variant="outline" className="w-full sm:w-auto flex-1">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Worker ({WORKER_BEE_COST} Coins)
        </Button>
      </CardFooter>
    </Card>
  );
}
