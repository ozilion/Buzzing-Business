
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import type { OptimizeHoneyProductionInput, OptimizeHoneyProductionOutput } from '@/ai/flows/optimize-honey-production';
import { FLOWER_TYPES } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  hiveLevel: z.number().min(1),
  workerBeeCount: z.number().min(0),
  flowerTypes: z.array(z.string()).min(1, "Select at least one flower type"),
  currentHoneyProductionRate: z.number().min(0),
  pollen: z.number().min(0),
  propolis: z.number().min(0),
});

type FormData = {
  hiveLevel: number;
  workerBeeCount: number;
  flowerTypes: string[];
  currentHoneyProductionRate: number;
  pollen: number;
  propolis: number;
};

export function AIOptimizationModal() {
  const { hiveLevel, workerBees, currentHoneyProductionRate, pollen, propolis, getAIOptimization } = useGame();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<OptimizeHoneyProductionOutput | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hiveLevel,
      workerBeeCount: workerBees, // Corrected: use workerBees from context
      flowerTypes: [FLOWER_TYPES[0]],
      currentHoneyProductionRate,
      pollen,
      propolis,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        hiveLevel,
        workerBeeCount: workerBees, // Corrected: use workerBees from context
        flowerTypes: [FLOWER_TYPES[0]],
        currentHoneyProductionRate,
        pollen,
        propolis,
      });
      setAiResponse(null); // Clear previous response when modal opens
    }
  }, [isOpen, hiveLevel, workerBees, currentHoneyProductionRate, pollen, propolis, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setAiResponse(null);
    try {
      const input: OptimizeHoneyProductionInput = {
        hiveLevel: data.hiveLevel,
        workerBeeCount: data.workerBeeCount,
        flowerTypes: data.flowerTypes,
        currentHoneyProductionRate: data.currentHoneyProductionRate,
        availableResources: {
          pollen: data.pollen,
          propolis: data.propolis,
        },
      };
      const response = await getAIOptimization(input);
      setAiResponse(response);
    } catch (error) {
      console.error("AI Optimization Error:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to get AI tips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <BrainCircuit className="mr-2 h-4 w-4" /> Get AI Optimization Tips
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" /> AI Honey Production Optimizer
          </DialogTitle>
          <DialogDescription>
            Fill in your current hive details to get personalized optimization tips from our AI.
          </DialogDescription>
        </DialogHeader>
        {!aiResponse ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="hiveLevel"
                control={control}
                render={({ field }) => (
                  <FormItem field={field} label="Hive Level" type="number" error={errors.hiveLevel?.message} />
                )}
              />
              <Controller
                name="workerBeeCount"
                control={control}
                render={({ field }) => (
                  <FormItem field={field} label="Worker Bees" type="number" error={errors.workerBeeCount?.message} />
                )}
              />
              <Controller
                name="currentHoneyProductionRate"
                control={control}
                render={({ field }) => (
                  <FormItem field={field} label="Honey Rate (units/hr)" type="number" error={errors.currentHoneyProductionRate?.message} />
                )}
              />
              <Controller
                name="pollen"
                control={control}
                render={({ field }) => (
                  <FormItem field={field} label="Available Pollen" type="number" error={errors.pollen?.message} />
                )}
              />
              <Controller
                name="propolis"
                control={control}
                render={({ field }) => (
                  <FormItem field={field} label="Available Propolis" type="number" error={errors.propolis?.message} />
                )}
              />
            </div>
            
            <div>
              <Label>Flower Types</Label>
              <Controller
                name="flowerTypes"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 rounded-md border p-2 max-h-32 overflow-y-auto">
                    {FLOWER_TYPES.map((flower) => (
                      <div key={flower} className="flex items-center space-x-2">
                        <Checkbox
                          id={`flower-${flower}`}
                          checked={field.value?.includes(flower)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), flower])
                              : field.onChange((field.value || []).filter((value) => value !== flower));
                          }}
                        />
                        <label htmlFor={`flower-${flower}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {flower}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.flowerTypes && <p className="text-sm text-destructive mt-1">{errors.flowerTypes.message}</p>}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Tips
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <ScrollArea className="max-h-[60vh] p-1">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2">Optimization Tips:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {aiResponse.optimizationTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary mb-2">Reasoning:</h3>
                <p className="text-sm text-muted-foreground">{aiResponse.reasoning}</p>
              </div>
              <Button onClick={() => setAiResponse(null)} variant="outline" className="w-full">
                Ask Again
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper component for form items
function FormItem({ field, label, type, error }: { field: any; label: string; type: string; error?: string }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={field.name}>{label}</Label>
      <Input id={field.name} type={type} {...field} onChange={e => field.onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

