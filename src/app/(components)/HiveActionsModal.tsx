
"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGame } from '@/app/(context)/GameContext';
import { ArrowUpCircle, PlusCircle, Home, Users, Info } from 'lucide-react';
import { BASE_HIVE_UPGRADE_COST, HIVE_UPGRADE_COST_MULTIPLIER, WORKER_BEE_COST, INITIAL_HIVE_LEVEL, MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL, BASE_MAX_WORKER_BEES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HiveActionsModal() {
  const { 
    beeCoins, 
    hiveLevel: contextHiveLevel, 
    workerBees: contextWorkerBees, 
    maxWorkerBees: contextMaxWorkerBees,
    upgradeHive, 
    addWorkerBees 
  } = useGame();
  
  const [isOpen, setIsOpen] = useState(false);
  const [displayHiveLevel, setDisplayHiveLevel] = useState(INITIAL_HIVE_LEVEL);
  const [displayNextUpgradeCost, setDisplayNextUpgradeCost] = useState(
    BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, INITIAL_HIVE_LEVEL -1)
  );
  const [displayMaxWorkerBees, setDisplayMaxWorkerBees] = useState(BASE_MAX_WORKER_BEES + (INITIAL_HIVE_LEVEL -1) * MAX_WORKER_BEES_INCREASE_PER_HIVE_LEVEL);


  useEffect(() => {
    if (isOpen) {
      setDisplayHiveLevel(contextHiveLevel);
      setDisplayNextUpgradeCost(
        BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, contextHiveLevel -1)
      );
      setDisplayMaxWorkerBees(contextMaxWorkerBees);
    }
  }, [isOpen, contextHiveLevel, contextMaxWorkerBees]);

  const handleUpgradeHive = () => {
    upgradeHive();
    // Recalculate cost for next level after attempted upgrade
    // contextHiveLevel will be updated by useGame hook after successful upgrade
    // For immediate UI feedback, we can predict the next cost based on current contextHiveLevel before it updates
     setDisplayNextUpgradeCost(
       BASE_HIVE_UPGRADE_COST * Math.pow(HIVE_UPGRADE_COST_MULTIPLIER, contextHiveLevel) // Use current contextHiveLevel for prediction
     );
  };

  const handleAddBee = () => {
    addWorkerBees(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-full h-10 border-orange-400 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 bg-white/10 shadow-md">
          <Home className="h-5 w-5" />
          <span className="sr-only">Hive Actions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Home className="mr-2 h-5 w-5 text-primary" /> Hive Management
          </DialogTitle>
          <DialogDescription>
            Upgrade your hive or purchase more worker bees to boost your production.
            Your BeeCoins: <span className="font-semibold text-primary">{beeCoins.toFixed(0)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><ArrowUpCircle className="mr-2 h-5 w-5" />Upgrade Hive</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Level: {displayHiveLevel}</p>
              <p className="text-sm text-muted-foreground">Next Upgrade Cost: <span className="font-semibold text-primary">{displayNextUpgradeCost.toFixed(0)}</span> BeeCoins</p>
              <Button 
                onClick={handleUpgradeHive} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={beeCoins < displayNextUpgradeCost}
              >
                Upgrade to Level {displayHiveLevel + 1}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><PlusCircle className="mr-2 h-5 w-5" />Add Worker Bee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Worker Bees: {contextWorkerBees} / {displayMaxWorkerBees}</p>
              <p className="text-sm text-muted-foreground">Cost per Bee: <span className="font-semibold text-primary">{WORKER_BEE_COST}</span> BeeCoins</p>
              <Button 
                onClick={handleAddBee} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={beeCoins < WORKER_BEE_COST || contextWorkerBees >= displayMaxWorkerBees}
              >
                Add 1 Worker Bee
              </Button>
               {contextWorkerBees >= displayMaxWorkerBees && (
                <p className="text-xs text-destructive mt-1 text-center">Hive capacity full. Upgrade hive for more space.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
