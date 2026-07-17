import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStrategy } from '@/lib/strategies';
import { sendFaucetTx } from '@/lib/chain';
import { setRateLimit } from '@/lib/redis';
import { ENV, ethAddressSchema } from '@/lib/config';
import type { ClaimSuccessResponse, ClaimErrorResponse } from '@/types';

// Request body schema
const claimRequestSchema = z.object({
  address: ethAddressSchema,
  turnstileToken: z.string().min(1, 'Captcha token is required'),
});

export async function POST(req: Request) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validation = claimRequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid request data';
      return NextResponse.json<ClaimErrorResponse>(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { address, turnstileToken } = validation.data;

    // 2. Get the active strategy for current environment
    const strategy = getStrategy();

    // 3. Validate request (Captcha + Pre-check Cooldown)
    try {
      await strategy.validateRequest(req, { address, turnstileToken });
    } catch (error: any) {
      // Known validation errors (captcha, cooldown)
      return NextResponse.json<ClaimErrorResponse>(
        { success: false, error: error.message || 'Validation failed' },
        { status: 429 }
      );
    }

    // 4. Execute blockchain transaction
    let txResult;
    try {
      txResult = await sendFaucetTx(
        strategy.getRpcUrl(),
        strategy.getTreasuryPrivateKey(),
        address,
        strategy.getDropAmount()
      );
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      // Return user-friendly error without exposing internals
      return NextResponse.json<ClaimErrorResponse>(
        { 
          success: false, 
          error: error.message || 'Service temporarily unavailable. Please try again later.' 
        },
        { status: 503 }
      );
    }

    // 5. Set rate limit lock ONLY after successful transaction
    try {
      await setRateLimit(
        strategy.getEnvironmentName(),
        address,
        strategy.getCooldownSeconds()
      );
    } catch (error) {
      // Log error but don't fail the request since tx already succeeded
      console.error('Failed to set rate limit (tx succeeded):', error);
    }

    // 6. Build explorer URL
    const explorerUrl = `${ENV.NEXT_PUBLIC_EXPLORER_URL}/tx/${txResult.txHash}`;

    // 7. Success response
    const response: ClaimSuccessResponse = {
      success: true,
      data: {
        txHash: txResult.txHash,
        amount: txResult.amount,
        timestamp: Date.now(),
        from: txResult.from,
        to: txResult.to,
        explorerUrl,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in claim endpoint:', error);
    
    // Generic error for unexpected issues
    return NextResponse.json<ClaimErrorResponse>(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: Add OPTIONS handler for CORS if needed
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
