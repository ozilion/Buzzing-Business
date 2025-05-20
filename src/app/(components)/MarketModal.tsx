
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGame } from '@/app/(context)/GameContext';
import { TrendingUp, ShoppingCart, Banknote, Repeat, Layers } from 'lucide-react'; // Added Layers for Sell All

export function MarketModal() {
  const { honey, beeCoins, honeyPrice, sellHoney, buyHoney } = useGame();
  const [amount, setAmount] = useState<number>(1);
  const [isOpen, setIsOpen] = useState(false);
  
  const [clientHoneyPrice, setClientHoneyPrice] = useState<number | null>(null);
  useEffect(() => {
    setClientHoneyPrice(honeyPrice);
  }, [honeyPrice]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setAmount(isNaN(value) || value < 1 ? 1 : value);
  };

  const handleSell = () => {
    sellHoney(amount);
    setAmount(1);
  };

  const handleBuy = () => {
    buyHoney(amount);
    setAmount(1);
  };

  const handleSellAll = () => {
    if (honey > 0) {
      sellHoney(honey); // Sell all available honey
      setAmount(1); // Reset amount input
    }
  };

  if (clientHoneyPrice === null) {
    return (
      <Button variant="outline" disabled>
        <ShoppingCart className="mr-2 h-4 w-4" /> Loading Market...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
          <ShoppingCart className="mr-2 h-4 w-4" /> Visit Honey Market
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md"> {/* Adjusted max-width slightly for better fit */}
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-primary" /> Honey Market
          </DialogTitle>
          <DialogDescription>
            Buy or sell honey. Prices fluctuate! Current price: 
            <span className="font-semibold text-primary"> {clientHoneyPrice} BeeCoins</span> per unit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
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
          <div className="text-sm text-muted-foreground text-center">
            You have <span className="font-semibold text-primary">{honey.toFixed(2)}</span> Honey and <span className="font-semibold text-primary">{beeCoins}</span> BeeCoins.
          </div>
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"> {/* Allow wrapping */}
          <Button 
            onClick={handleSellAll} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={honey <= 0}
          >
            <Layers className="mr-2 h-4 w-4" /> Sell All ({Math.floor(honey * clientHoneyPrice)} Coins)
          </Button>
          <Button 
            onClick={handleBuy} 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            disabled={beeCoins < amount * clientHoneyPrice}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> Buy ({amount * clientHoneyPrice} Coins)
          </Button>
          <Button 
            onClick={handleSell} 
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            disabled={honey < amount}
          >
            <Banknote className="mr-2 h-4 w-4" /> Sell (+{amount * clientHoneyPrice} Coins)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
