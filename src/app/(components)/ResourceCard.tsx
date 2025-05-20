
import type { ResourceType } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CircleDollarSign, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { cn, formatLargeNumber } from '@/lib/utils';

interface ResourceCardProps {
  type: ResourceType;
  value: number;
  className?: string;
}

const iconMap: Record<ResourceType, LucideIcon | string> = {
  honey: "/assets/images/honey.png",
  pollen: "/assets/images/pollen.png",
  propolis: "/assets/images/propolis.png",
  beeCoins: CircleDollarSign,
};

export function ResourceCard({ type, value, className }: ResourceCardProps) {
  const IconOrUrl = iconMap[type];
  const displayValue = formatLargeNumber(value);

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-center space-y-0 p-0">
        {typeof IconOrUrl === 'string' ? (
          <Image src={IconOrUrl} alt={`${type} icon`} width={16} height={16} className="h-4 w-4 text-muted-foreground" />
        ) : (
          <IconOrUrl className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="p-0 text-center">
        <div className="text-lg font-bold leading-none">
          {displayValue}
        </div>
      </CardContent>
    </Card>
  );
}
