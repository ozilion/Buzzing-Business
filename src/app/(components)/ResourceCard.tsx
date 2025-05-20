import type { ResourceType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Flower2, Gem, CircleDollarSign, type LucideIcon } from 'lucide-react';
import { cn, formatLargeNumber } from '@/lib/utils';

interface ResourceCardProps {
  type: ResourceType;
  value: number;
  className?: string;
}

const iconMap: Record<ResourceType, LucideIcon> = {
  honey: Droplets,
  pollen: Flower2,
  propolis: Gem,
  beeCoins: CircleDollarSign,
};

const nameMap: Record<ResourceType, string> = {
  honey: 'Honey',
  pollen: 'Pollen',
  propolis: 'Propolis',
  beeCoins: 'BeeCoins',
};

export function ResourceCard({ type, value, className }: ResourceCardProps) {
  const Icon = iconMap[type];
  const name = nameMap[type];
  const displayValue = formatLargeNumber(value);

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {displayValue}
        </div>
        {type === 'honey' && <p className="text-xs text-muted-foreground">units</p>}
        {type === 'beeCoins' && <p className="text-xs text-muted-foreground">coins</p>}
      </CardContent>
    </Card>
  );
}
