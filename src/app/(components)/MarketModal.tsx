
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
import { TrendingUp, ShoppingCart, Layers } from 'lucide-react'; 
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
    buyHoney, 
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
  }, [isOpen, honeyPrice, pollenPrice, propolisPrice]);

 useEffect(() => {
    setAmount(1); 
  }, [activeTab]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setAmount(isNaN(value) || value < 1 ? 1 : value);
  };

  const handleSell = () => {
    if (activeTab === "honey") sellHoney(amount);
    else if (activeTab === "pollen") sellPollen(amount);
    else if (activeTab === "propolis") sellPropolis(amount);
    setAmount(1);
  };

  const handleBuy = () => { 
    if (activeTab === "honey") {
      buyHoney(amount);
      setAmount(1);
    }
  };

  const handleSellAll = () => {
    if (activeTab === "honey" && honey > 0) sellHoney(honey);
    else if (activeTab === "pollen" && pollen > 0) sellPollen(pollen);
    else if (activeTab === "propolis" && propolis > 0) sellPropolis(propolis);
    setAmount(1); 
  };

  const getCurrentResourceAmount = () => {
    if (activeTab === "honey") return honey;
    if (activeTab === "pollen") return pollen;
    if (activeTab === "propolis") return propolis;
    return 0;
  };

  const getCurrentResourcePrice = () => {
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
            Buy or sell resources. Prices fluctuate! 
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
            <div className="grid grid-cols-4 items-center gap-4 mb-4">
              <Label htmlFor="amount" className="text-right col-span-1">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="col-span-3"
                min="1"
              />
            </div>
            <div className="text-sm text-muted-foreground text-center mb-2">
              Selected: <span className="capitalize font-semibold text-primary">{activeTab}</span> | 
              Available: <span className="font-semibold text-primary">{getCurrentResourceAmount().toFixed(activeTab === 'honey' ? 2 : 0)}</span> | 
              Price: <span className="font-semibold text-primary">{getCurrentResourcePrice()}</span> Coins/unit
            </div>
          </div>
          
          <TabsContent value="honey">
            {/* Content specific to honey tab, if any, beyond the shared input and buttons below */}
          </TabsContent>
          <TabsContent value="pollen">
            {/* Content specific to pollen tab */}
          </TabsContent>
          <TabsContent value="propolis">
            {/* Content specific to propolis tab */}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 pt-2">
          {activeTab === "honey" && (
            <Button 
              onClick={handleBuy} 
              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={beeCoins < amount * getCurrentResourcePrice()}
            >
              <TrendingUp className="mr-2 h-4 w-4" /> Buy ({Math.floor(amount * getCurrentResourcePrice())} Coins)
            </Button>
          )}
          <Button 
            onClick={handleSellAll} 
            variant="outline" 
            className="w-full sm:flex-1"
            disabled={getCurrentResourceAmount() <= 0}
          >
            <Layers className="mr-2 h-4 w-4" /> Sell All ({Math.floor(getCurrentResourceAmount() * getCurrentResourcePrice())} Coins)
          </Button>
          <Button 
            onClick={handleSell} 
            className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white"
            disabled={getCurrentResourceAmount() < amount}
          >
            {getResourceIcon(activeTab)} Sell ({Math.floor(amount * getCurrentResourcePrice())} Coins)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
