import { IFaucetStrategy } from './types';
import { ENV } from '@/lib/config';
import { verifyTurnstile } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/redis';

export class DevnetStrategy implements IFaucetStrategy {
  
  async validateRequest(req: Request, body: { address: string; turnstileToken: string }): Promise<void> {
    const { address, turnstileToken } = body;

    // 1. Turnstile Check (skip if not configured)
    if (ENV.TURNSTILE_SECRET_KEY) {
      const isHuman = await verifyTurnstile(turnstileToken, ENV.TURNSTILE_SECRET_KEY);
      if (!isHuman) {
        throw new Error("Captcha validation failed. Please try again.");
      }
    }

    // 2. Redis Cooldown Check
    const isBlocked = await checkRateLimit('devnet', address);
    
    if (isBlocked) {
      const hours = Math.floor(ENV.COOLDOWN_SECONDS / 3600);
      throw new Error(`Cooldown active. Please wait ${hours} hour(s) before claiming again.`);
    }
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
    return 'devnet';
  }
}
