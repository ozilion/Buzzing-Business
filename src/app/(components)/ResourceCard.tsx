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

// nameMap removed as resource names will no longer be displayed

export function ResourceCard({ type, value, className }: ResourceCardProps) {
  const Icon = iconMap[type];
  const displayValue = formatLargeNumber(value);

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-center space-y-0 p-0">
        {/* CardTitle removed */}
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0 text-center">
        <div className="text-2xl font-bold leading-none">
          {displayValue}
        </div>
        {/* Unit text (e.g., "units", "coins") removed for compactness */}
      </CardContent>
    </Card>
  );
}
