# QC Faucet

A minimalistic, high-performance Web3 Faucet for **PQC-compatible chain** - a quantum-resistant L1 EVM-compatible blockchain. This faucet distributes test tokens to users for paying gas fees.

## Features

- ✨ **Simple & Secure**: No OAuth, no complex databases
- 🛡️ **Bot Protection**: Cloudflare Turnstile integration
- ⚡ **High Performance**: Redis for low-latency rate limiting
- 🎯 **Modular Architecture**: Strategy pattern for easy network switching
- 🔒 **Type-Safe**: Full TypeScript with Zod validation
- 🎨 **Modern UI**: Built with Next.js 14, Tailwind CSS, and Shadcn UI

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI
- **Blockchain**: ethers.js v6
- **Database**: Vercel KV (Redis)
- **Validation**: Zod
- **Bot Protection**: Cloudflare Turnstile

## Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ POST /api/claim
       ▼
┌─────────────────────────────┐
│     API Route Handler       │
│  (Input Validation)         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Strategy Factory          │
│  (DevNet/TestNet/MainNet)   │
└──────┬──────────────────────┘
       │
       ├──► Turnstile Verification
       ├──► Rate Limit Check (Redis)
       ├──► Send Transaction (ethers.js)
       └──► Set Rate Limit (Redis)
```

### Strategy Pattern

The application uses the Strategy Pattern to support multiple environments (Devnet, Testnet, Mainnet) without code duplication:

- **DevnetStrategy**: Development environment configuration
- **TestnetStrategy**: Public testnet configuration
- **MainnetStrategy**: Production mainnet configuration

Switch between environments by changing the `CHAIN_ENV` variable.

## Environment Variables

### Required Variables

Create a `.env` file in the project root with the following variables:

```bash
# App & Security
NODE_ENV="development"
LOG_LEVEL="debug"
CHAIN_ENV="devnet"  # Options: devnet, testnet, mainnet

# Public Configuration (Visible to client)
NEXT_PUBLIC_CHAIN_NAME="PQC Devnet"
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_EXPLORER_URL="https://explorer.example.com"

# Cloudflare Turnstile (Get keys from https://dash.cloudflare.com/)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAA..."
TURNSTILE_SECRET_KEY="0x4AAAA..."

# Redis Connection String (Optional for localnet)
REDIS_URL="redis://localhost:6379"
# Or for cloud Redis (e.g., Upstash, Redis Cloud):
# REDIS_URL="rediss://default:password@host:port"

# === Devnet Configuration ===
DEVNET_RPC_URL="https://rpc.devnet.example.com"
DEVNET_TREASURY_KEY="0x..."  # Private key of treasury wallet (64 hex chars)
DEVNET_DROP_AMOUNT="10"      # Amount to send per claim
DEVNET_COOLDOWN_SECONDS="3600"  # 1 hour cooldown

# === Testnet Configuration (Optional if using devnet) ===
TESTNET_RPC_URL="https://rpc.testnet.example.com"
TESTNET_TREASURY_KEY="0x..."
TESTNET_DROP_AMOUNT="1"
TESTNET_COOLDOWN_SECONDS="86400"  # 24 hours

# === Mainnet Configuration (Optional) ===
MAINNET_RPC_URL="https://rpc.mainnet.example.com"
MAINNET_TREASURY_KEY="0x..."
MAINNET_DROP_AMOUNT="0.1"
MAINNET_COOLDOWN_SECONDS="86400"
```

### Environment Variable Details

| Variable | Required | Description |
|----------|----------|-------------|
| `CHAIN_ENV` | Yes | Active environment: `localnet`, `devnet`, `testnet`, or `mainnet` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No* | Cloudflare Turnstile site key (visible to client) |
| `TURNSTILE_SECRET_KEY` | No* | Cloudflare Turnstile secret key (server-side only) |
| `REDIS_URL` | No* | Redis connection string (e.g., `redis://localhost:6379`) |
| `{ENV}_RPC_URL` | Yes* | RPC endpoint for the blockchain network |
| `{ENV}_TREASURY_KEY` | Yes* | Private key of the treasury wallet (must start with 0x) |
| `{ENV}_DROP_AMOUNT` | Yes* | Amount of tokens to send per claim |
| `{ENV}_COOLDOWN_SECONDS` | Yes* | Cooldown period between claims in seconds |

*Required for the active `CHAIN_ENV` environment.
*Optional for `localnet` - will use in-memory storage for development.

## Installation

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Redis instance (local, Upstash, Redis Cloud, or any Redis-compatible service)
- A Cloudflare account (for Turnstile)
- A funded treasury wallet for the target network

**Note**: For local development, you can skip Redis and Turnstile by using the `localnet` environment.

### Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd faucet
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Redis**

   Choose one of the following options:

   **Option A: Local Redis (for development)**
   ```bash
   # Install Redis locally
   # macOS:
   brew install redis
   redis-server
   
   # Ubuntu/Debian:
   sudo apt-get install redis-server
   sudo service redis-server start
   
   # Use: REDIS_URL="redis://localhost:6379"
   ```

   **Option B: Cloud Redis (for production)**
   - [Upstash](https://upstash.com/) - Free tier available
   - [Redis Cloud](https://redis.com/cloud/) - Free tier available
   - [Railway](https://railway.app/) - Redis plugin
   - Copy the Redis connection string

4. **Set up Cloudflare Turnstile**

   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Turnstile
   - Create a new site
   - Copy the Site Key and Secret Key

5. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in all required values:

```bash
cp .env.example .env
# Edit .env with your values
```

6. **Run the development server**

```bash
npm run dev
```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   In the Vercel project settings, add all environment variables from your `.env` file.

   **⚠️ Important**: Never commit `.env` to version control!

4. **Deploy**

   Vercel will automatically deploy your application.

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Docker**: Create a Dockerfile using the Next.js standalone build
- **AWS**: Use AWS Amplify or deploy to EC2
- **Railway**: Connect your GitHub repo
- **Render**: Deploy as a Node.js service

Ensure you have a Redis-compatible database and configure the `KV_REST_API_URL` and `KV_REST_API_TOKEN` accordingly.

## Usage

### For End Users

1. Visit the faucet website
2. Enter your Ethereum-compatible wallet address (0x...)
3. Complete the Turnstile captcha challenge
4. Click "Request Funds"
5. Wait for the transaction to complete
6. View your transaction on the block explorer

### Rate Limiting

- Each address is rate-limited based on `{ENV}_COOLDOWN_SECONDS`
- The cooldown is environment-specific (devnet, testnet, mainnet)
- Rate limits are stored in Redis with automatic expiration

## Development

### Project Structure

```
faucet/
├── app/
│   ├── api/
│   │   └── claim/
│   │       └── route.ts        # API endpoint for claims
│   ├── layout.tsx              # Root layout with Toaster
│   ├── page.tsx                # Main faucet UI
│   └── globals.css             # Global styles with theme
├── components/
│   └── ui/                     # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── toaster.tsx
├── lib/
│   ├── chain.ts                # Blockchain service (ethers.js)
│   ├── config.ts               # Zod-based config validation
│   ├── redis.ts                # Redis/KV helpers
│   ├── turnstile.ts            # Turnstile verification
│   ├── utils.ts                # Utility functions (cn)
│   └── strategies/             # Strategy pattern implementation
│       ├── types.ts            # IFaucetStrategy interface
│       ├── DevnetStrategy.ts
│       ├── TestnetStrategy.ts
│       ├── MainnetStrategy.ts
│       └── index.ts            # Strategy factory
├── types/
│   └── index.ts                # Shared TypeScript types
└── public/                     # Static assets
```

### Adding a New Network

To add support for a new network environment:

1. **Add environment variables** to `.env`:

```bash
NEWNET_RPC_URL="https://rpc.newnet.example.com"
NEWNET_TREASURY_KEY="0x..."
NEWNET_DROP_AMOUNT="5"
NEWNET_COOLDOWN_SECONDS="7200"
```

2. **Update the config schema** in `lib/config.ts`:

```typescript
NEWNET_RPC_URL: z.string().url().optional(),
NEWNET_TREASURY_KEY: hexKeySchema.optional(),
// ... etc
```

3. **Create a new strategy** in `lib/strategies/NewnetStrategy.ts`

4. **Update the factory** in `lib/strategies/index.ts`:

```typescript
case 'newnet':
  return new NewnetStrategy();
```

### Swapping ethers.js for Custom Fork

The blockchain logic is isolated in `lib/chain.ts`. To use a custom fork of ethers.js:

1. Install your custom package: `npm install pqc-ethers`
2. Update the import in `lib/chain.ts`:

```typescript
import { ethers } from 'pqc-ethers';
```

3. Adjust any API differences in the `sendFaucetTx` function

## Security Considerations

1. **Private Keys**: Never commit private keys. Use environment variables only.
2. **Server-Side Validation**: All validation happens server-side. Never trust client input.
3. **Rate Limiting**: Redis ensures cooldowns are enforced across all instances.
4. **Error Masking**: Raw RPC errors are masked to prevent information leakage.
5. **Treasury Monitoring**: Monitor the treasury balance to prevent fund depletion.

## Troubleshooting

### Configuration Validation Failed

If you see configuration validation errors at startup:

```
❌ Configuration validation failed:
[
  {
    "code": "invalid_string",
    "validation": "url",
    "path": ["DEVNET_RPC_URL"],
    "message": "Invalid url"
  }
]
```

**Solution**: Check your `.env` file and ensure all required variables for your active `CHAIN_ENV` are set correctly.

### Turnstile Verification Failed

**Symptoms**: "Captcha validation failed" error

**Solutions**:
- Verify your Turnstile keys are correct
- Ensure the site key is prefixed with `NEXT_PUBLIC_`
- Check that your domain is allowed in Cloudflare Turnstile settings
- For localhost testing, ensure Turnstile is configured to allow localhost

### Transaction Failures

**Symptoms**: "Failed to send transaction" error

**Solutions**:
- Verify the RPC URL is correct and accessible
- Check that the treasury wallet has sufficient balance
- Ensure the private key is valid and properly formatted (0x + 64 hex chars)
- Check network connectivity to the blockchain RPC

### Redis Connection Issues

**Symptoms**: Rate limit checks fail or return errors

**Solutions**:
- Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct
- Check that your Vercel KV database is active
- Ensure network connectivity to Vercel KV

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Create an issue](<repository-url>/issues)
- Documentation: [Documentation](https://docs.example.com)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the PQC-compatible chain community
