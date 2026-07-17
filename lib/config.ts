import { config } from 'dotenv';
import { resolve } from 'node:path';
import z from 'zod';

// 1. Load .env files based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
config({ path: resolve(process.cwd(), `.env.${nodeEnv}`) });
config({ path: resolve(process.cwd(), '.env') });

// 2. Define Validators
const ethAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum Address");
const hexKeySchema = z.string().regex(/^0x[a-fA-F0-9]{5120}$/, "Invalid Private Key (must start with 0x)");

// 3. Define the Schema - Clean design with defaults
const appConfigSchema = z.object({
  // System
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Strategy Selector
  CHAIN_ENV: z.enum(['localnet', 'devnet', 'testnet', 'mainnet']).default('localnet'),

  // Public facing values
  NEXT_PUBLIC_CHAIN_NAME: z.string().default('Armchain Testnet'),
  NEXT_PUBLIC_CHAIN_ID: z.coerce.number().int().positive().default(31337),
  NEXT_PUBLIC_EXPLORER_URL: z.string().default('http://localhost:3000/tx'),

  // Cloudflare Turnstile - Optional with empty string default
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().default(''),
  TURNSTILE_SECRET_KEY: z.string().default(''),

  // Redis Connection - Optional with empty string default
  REDIS_URL: z.string().default(''),

  // === Universal Faucet Config (applies to selected CHAIN_ENV) ===
  
  // RPC URL - defaults to localhost for localnet
  RPC_URL: z.string().default('http://127.0.0.1:8545'),
  
  // Treasury wallet private key - defaults to Hardhat account #0
  TREASURY_KEY: hexKeySchema.default('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
  
  // Amount to drop per claim
  DROP_AMOUNT: z.coerce.number().positive().default(100),
  
  // Cooldown in seconds (0 = no cooldown)
  COOLDOWN_SECONDS: z.coerce.number().int().nonnegative().default(0),
});

// 4. Parse & Export
function parseConfig() {
  try {
    return appConfigSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      console.error(JSON.stringify(error.issues, null, 2));
      throw new Error('Invalid environment configuration. Check the errors above.');
    }
    throw error;
  }
}

export const ENV = parseConfig();
export { ethAddressSchema, hexKeySchema };
