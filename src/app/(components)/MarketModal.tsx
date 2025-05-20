
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGame } from '@/app/(context)/GameContext';
import { ShoppingCart, Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INITIAL_HONEY_PRICE, INITIAL_POLLEN_PRICE, INITIAL_PROPOLIS_PRICE } from '@/lib/constants';

type ResourceTab = "honey" | "pollen" | "propolis";

export function MarketModal() {
  const {
    honey,
    pollen,
    propolis,
    beeCoins,
    honeyPrice, 
    pollenPrice, 
    propolisPrice, 
    sellHoney,
    sellPollen,
    sellPropolis
  } = useGame();

  const [amount, setAmount] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ResourceTab>("honey");

  const [clientHoneyPrice, setClientHoneyPrice] = useState<number>(INITIAL_HONEY_PRICE);
  const [clientPollenPrice, setClientPollenPrice] = useState<number>(INITIAL_POLLEN_PRICE);
  const [clientPropolisPrice, setClientPropolisPrice] = useState<number>(INITIAL_PROPOLIS_PRICE);

  useEffect(() => {
    if (isOpen) {
      setClientHoneyPrice(honeyPrice);
      setClientPollenPrice(pollenPrice);
      setClientPropolisPrice(propolisPrice);
      setAmount(1); 
    }
  }, [isOpen]);

 useEffect(() => {
    setAmount(1); 
  }, [activeTab]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const currentMax = getCurrentResourceAmount();
    setAmount(isNaN(value) || value < 1 ? 1 : Math.min(value, currentMax > 0 ? currentMax : 1));
  };

  const handleSellSpecificAmount = () => {
    if (activeTab === "honey") sellHoney(amount);
    else if (activeTab === "pollen") sellPollen(amount);
    else if (activeTab === "propolis") sellPropolis(amount);
    setAmount(1);
  };

  const handleSetMaxAmount = () => {
    setAmount(getCurrentResourceAmount());
  };

  const handleSellAllResources = () => {
    if (honey > 0) sellHoney(honey);
    if (pollen > 0) sellPollen(pollen);
    if (propolis > 0) sellPropolis(propolis);
    setAmount(1);
  };
  
  const getCurrentResourceAmount = () => {
    if (activeTab === "honey") return honey;
    if (activeTab === "pollen") return pollen;
    if (activeTab === "propolis") return propolis;
    return 0;
  };

  const getCurrentResourceClientPrice = () => {
    if (activeTab === "honey") return clientHoneyPrice;
    if (activeTab === "pollen") return clientPollenPrice;
    if (activeTab === "propolis") return clientPropolisPrice;
    return 0;
  };

  const getResourceIcon = (resource: ResourceTab) => {
    const iconSize = 16;
    const iconClassName = "mr-2 h-4 w-4";
    if (resource === "honey") return <Image src="/assets/images/honey.png" alt="Honey" width={iconSize} height={iconSize} className={iconClassName} />;
    if (resource === "pollen") return <Image src="/assets/images/pollen.png" alt="Pollen" width={iconSize} height={iconSize} className={iconClassName} />;
    if (resource === "propolis") return <Image src="/assets/images/propolis.png" alt="Propolis" width={iconSize} height={iconSize} className={iconClassName} />;
    return null;
  }

  const totalEarningsFromAllResources = 
    Math.floor(honey * clientHoneyPrice) + 
    Math.floor(pollen * clientPollenPrice) + 
    Math.floor(propolis * clientPropolisPrice);

  const canSellAnyResource = honey > 0 || pollen > 0 || propolis > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-full h-10 border-green-400 text-green-300 hover:bg-green-500/20 hover:text-green-200 bg-white/10 shadow-md">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Market</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-primary" /> Resource Market
          </DialogTitle>
          <DialogDescription>
            Sell resources. Prices are fixed while this window is open.
            Your BeeCoins: <span className="font-semibold text-primary">{beeCoins.toFixed(0)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResourceTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="honey">Honey</TabsTrigger>
            <TabsTrigger value="pollen">Pollen</TabsTrigger>
            <TabsTrigger value="propolis">Propolis</TabsTrigger>
          </TabsList>

          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="flex-1"
                min="1"
                max={getCurrentResourceAmount()} 
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSetMaxAmount}
                disabled={getCurrentResourceAmount() <= 0}
              >
                Max
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center mb-2">
              Selected: <span className="capitalize font-semibold text-primary">{activeTab}</span> |
              Available: <span className="font-semibold text-primary">{getCurrentResourceAmount().toFixed(activeTab === 'honey' ? 2 : 0)}</span> |
              Price: <span className="font-semibold text-primary">{getCurrentResourceClientPrice()}</span> Coins/unit
            </div>
          </div>

          <TabsContent value="honey">
          </TabsContent>
          <TabsContent value="pollen">
          </TabsContent>
          <TabsContent value="propolis">
          </TabsContent>
        </Tabs>

        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <Button
            onClick={handleSellSpecificAmount}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={getCurrentResourceAmount() < amount || amount <= 0}
          >
            {getResourceIcon(activeTab)} Sell {amount} ({Math.floor(amount * getCurrentResourceClientPrice())} Coins)
          </Button>

          <Button
            onClick={handleSellAllResources}
            variant="outline"
            className="w-full"
            disabled={!canSellAnyResource}
          >
            <Coins className="mr-2 h-4 w-4" />
            Sell All Resources ({totalEarningsFromAllResources} Coins)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

