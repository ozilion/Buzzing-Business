
import { NextResponse, type NextRequest } from 'next/server';
import { optimizeHoneyProduction, OptimizeHoneyProductionInputSchema } from '@/ai/flows/optimize-honey-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = OptimizeHoneyProductionInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsedInput.error.format() }, { status: 400 });
    }

    const result = await optimizeHoneyProduction(parsedInput.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Optimization API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to get optimization tips from AI.', details: errorMessage }, { status: 500 });
  }
}
