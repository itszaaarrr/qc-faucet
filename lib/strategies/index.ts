import { LocalnetStrategy } from './LocalnetStrategy';
import { DevnetStrategy } from './DevnetStrategy';
import { TestnetStrategy } from './TestnetStrategy';
import { MainnetStrategy } from './MainnetStrategy';
import { IFaucetStrategy } from './types';
import { ENV } from '@/lib/config';

export function getStrategy(): IFaucetStrategy {
  switch (ENV.CHAIN_ENV) {
    case 'localnet':
      return new LocalnetStrategy();
    case 'testnet':
      return new TestnetStrategy();
    case 'mainnet':
      return new MainnetStrategy();
    case 'devnet':
    default:
      return new DevnetStrategy();
  }
}

export type { IFaucetStrategy };
