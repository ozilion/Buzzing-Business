'use server';

/**
 * @fileOverview A flow for providing AI-powered personalized tips on how to optimize virtual honey production.
 *
 * - optimizeHoneyProduction - A function that handles the honey production optimization process.
 * - OptimizeHoneyProductionInput - The input type for the optimizeHoneyProduction function.
 * - OptimizeHoneyProductionOutput - The return type for the optimizeHoneyProduction function.
 * - OptimizeHoneyProductionInputSchema - The Zod schema for the input.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const OptimizeHoneyProductionInputSchema = z.object({
  hiveLevel: z.number().describe('The current level of the beehive.'),
  workerBeeCount: z.number().describe('The number of worker bees in the hive.'),
  flowerTypes: z
    .string()
    .array()
    .describe('The types of flowers planted near the hive.'),
  currentHoneyProductionRate: z
    .number()
    .describe('The current honey production rate in units per hour.'),
  availableResources: z
    .object({
      pollen: z.number().describe('The amount of pollen available.'),
      propolis: z.number().describe('The amount of propolis available.'),
    })
    .describe('The available resources for the hive.'),
});
export type OptimizeHoneyProductionInput = z.infer<
  typeof OptimizeHoneyProductionInputSchema
>;

const OptimizeHoneyProductionOutputSchema = z.object({
  optimizationTips: z
    .string()
    .array()
    .describe(
      'A list of AI-powered personalized tips to optimize honey production.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning behind the provided optimization tips, explaining why each tip is suggested based on the input data.'
    ),
});
export type OptimizeHoneyProductionOutput = z.infer<
  typeof OptimizeHoneyProductionOutputSchema
>;

export async function optimizeHoneyProduction(
  input: OptimizeHoneyProductionInput
): Promise<OptimizeHoneyProductionOutput> {
  return optimizeHoneyProductionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeHoneyProductionPrompt',
  input: {schema: OptimizeHoneyProductionInputSchema},
  output: {schema: OptimizeHoneyProductionOutputSchema},
  prompt: `You are an expert in bee colony management and honey production optimization. Analyze the current state of the virtual beehive and provide personalized tips to the player to improve their honey production.

Current Beehive State:
- Hive Level: {{{hiveLevel}}}
- Worker Bee Count: {{{workerBeeCount}}}
- Flower Types Planted: {{#each flowerTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Current Honey Production Rate: {{{currentHoneyProductionRate}}} units/hour
- Available Resources: Pollen - {{{availableResources.pollen}}}, Propolis - {{{availableResources.propolis}}}

Based on this information, provide a list of actionable optimization tips. Also, provide a reasoning section explaining why each tip is suggested based on the input data. Be specific and provide quantitative suggestions where applicable.

Output Format:
{
  "optimizationTips": ["Tip 1", "Tip 2", ...],
  "reasoning": "Explanation of the reasoning behind the tips."
}
`,
});

const optimizeHoneyProductionFlow = ai.defineFlow(
  {
    name: 'optimizeHoneyProductionFlow',
    inputSchema: OptimizeHoneyProductionInputSchema,
    outputSchema: OptimizeHoneyProductionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
