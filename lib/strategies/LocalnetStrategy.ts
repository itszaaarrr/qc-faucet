import { IFaucetStrategy } from './types';
import { ENV } from '@/lib/config';

/**
 * LocalNet Strategy for local testing (Hardhat, Ganache, etc.)
 * 
 * This strategy SKIPS all validation:
 * - No Turnstile/Captcha verification
 * - No rate limiting
 * - No cooldown checks
 * 
 * ⚠️ WARNING: Only use this for local development/testing!
 */
export class LocalnetStrategy implements IFaucetStrategy {
  
  async validateRequest(req: Request, body: { address: string; turnstileToken: string }): Promise<void> {
    // NO VALIDATION - intentionally empty for local testing
    console.log('[LocalNet] Skipping all validation for:', body.address);
    return Promise.resolve();
  }

  getDropAmount(): number {
    return ENV.DROP_AMOUNT;
  }

  getTreasuryPrivateKey(): string {
    return ENV.TREASURY_KEY;
  }

  getRpcUrl(): string {
    return ENV.RPC_URL;
  }

  getCooldownSeconds(): number {
    return ENV.COOLDOWN_SECONDS;
  }

  getEnvironmentName(): string {
    return 'localnet';
  }
}
