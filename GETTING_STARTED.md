# Getting Started - Quick Setup

This guide will get you up and running with the Armchain Faucet in under 5 minutes.

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create `.env.local`:

```bash
# Minimal LocalNet Configuration (No Redis or Turnstile needed!)
NODE_ENV="development"
CHAIN_ENV="localnet"
NEXT_PUBLIC_CHAIN_NAME="Local Hardhat"
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_EXPLORER_URL="http://localhost:3000"

# LocalNet uses Hardhat defaults
LOCALNET_RPC_URL="http://127.0.0.1:8545"
LOCALNET_TREASURY_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
LOCALNET_DROP_AMOUNT="100"
LOCALNET_COOLDOWN_SECONDS="0"
```

### 3. Start Local Blockchain

In a separate terminal:

```bash
npx hardhat node
```

### 4. Run the Faucet

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Test It

1. Copy a Hardhat test address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
2. Paste into faucet form
3. Click "Request Funds" (no captcha needed!)
4. Done! ✅

## What Just Happened?

The **LocalNet strategy** skips all validation for fast local testing:
- ❌ No Cloudflare Turnstile (captcha)
- ❌ No Redis requirement (uses in-memory store)
- ❌ No rate limiting (by default)
- ✅ Perfect for rapid iteration!

## Project Structure

```
faucet/
├── app/
│   ├── api/claim/route.ts    # API endpoint
│   ├── page.tsx               # Main UI
│   └── layout.tsx             # Root layout
├── lib/
│   ├── config.ts              # Environment config with Zod
│   ├── chain.ts               # Blockchain (ethers.js)
│   ├── redis.ts               # Redis / in-memory store
│   ├── turnstile.ts           # Captcha verification
│   └── strategies/            # Environment strategies
│       ├── LocalnetStrategy.ts
│       ├── DevnetStrategy.ts
│       ├── TestnetStrategy.ts
│       └── MainnetStrategy.ts
├── components/ui/             # Shadcn UI components
└── types/                     # Shared TypeScript types
```

## Available Strategies

Switch environments by changing `CHAIN_ENV`:

| Strategy | Use Case | Requirements |
|----------|----------|--------------|
| **localnet** | Local dev/testing | Hardhat/Ganache only |
| **devnet** | Development network | Redis + Turnstile |
| **testnet** | Public testnet | Redis + Turnstile |
| **mainnet** | Production | Redis + Turnstile |

## Moving to Production

### 1. Set up Redis

Choose a provider:
- **Upstash** (Recommended for Vercel): [console.upstash.com](https://console.upstash.com/)
- **Redis Cloud**: [redis.com/try-free](https://redis.com/try-free/)
- **Local Redis**: `brew install redis` (Mac) or `apt-get install redis-server` (Linux)

See [REDIS_SETUP.md](./REDIS_SETUP.md) for detailed instructions.

### 2. Set up Turnstile

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/)
2. Navigate to **Turnstile**
3. Create a site
4. Copy Site Key and Secret Key

### 3. Update Environment

Create `.env.production`:

```bash
NODE_ENV="production"
CHAIN_ENV="testnet"

# Public config
NEXT_PUBLIC_CHAIN_NAME="Armchain Testnet"
NEXT_PUBLIC_CHAIN_ID=12345
NEXT_PUBLIC_EXPLORER_URL="https://explorer.armchain.io"

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAA..."
TURNSTILE_SECRET_KEY="0x4AAA..."

# Redis
REDIS_URL="rediss://default:PASSWORD@your-redis.upstash.io:6379"

# Testnet config
TESTNET_RPC_URL="https://rpc.testnet.armchain.io"
TESTNET_TREASURY_KEY="0xYOUR_PRIVATE_KEY"
TESTNET_DROP_AMOUNT="1"
TESTNET_COOLDOWN_SECONDS="86400"
```

### 4. Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Add environment variables
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

## Key Features

### ✨ Strategy Pattern

Different environments use different validation rules:

```typescript
// LocalNet: No validation
async validateRequest() {
  return; // Skip everything!
}

// DevNet/TestNet/MainNet: Full validation
async validateRequest() {
  await verifyTurnstile(token);
  await checkRateLimit(address);
}
```

### 🔒 Type-Safe Configuration

All environment variables are validated with Zod at startup:

```typescript
// If variables are missing or invalid, app crashes immediately
export const ENV = appConfigSchema.parse(process.env);
```

### 🚀 Automatic Fallbacks

- No Redis? → In-memory store (localnet only)
- No Turnstile? → Skip captcha (localnet only)
- RPC error? → User-friendly error message

### 🎨 Beautiful UI

- Dark blue / purple theme matching Armchain branding
- Responsive design
- Real-time claim status
- Toast notifications with explorer links

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Lint
npm run lint

# Test Redis connection
redis-cli -u $REDIS_URL ping
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CHAIN_ENV` | Yes | `devnet` | Active environment |
| `REDIS_URL` | No* | - | Redis connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No* | - | Turnstile site key |
| `TURNSTILE_SECRET_KEY` | No* | - | Turnstile secret |
| `{ENV}_RPC_URL` | Yes** | - | Blockchain RPC endpoint |
| `{ENV}_TREASURY_KEY` | Yes** | - | Treasury private key |
| `{ENV}_DROP_AMOUNT` | Yes** | - | Tokens per claim |
| `{ENV}_COOLDOWN_SECONDS` | Yes** | - | Cooldown period |

\* Optional for `localnet`
\*\* Required for active `CHAIN_ENV`

## Troubleshooting

### "Configuration validation failed"

**Cause**: Missing or invalid environment variables

**Solution**: 
1. Check `.env.local` exists
2. Verify all required variables for your `CHAIN_ENV` are set
3. Ensure private keys start with `0x` and are 64 hex characters

### "Unable to connect to blockchain network"

**Cause**: RPC endpoint not accessible

**Solution**:
- For localnet: Ensure `npx hardhat node` is running
- Check RPC URL is correct
- Test manually: `curl -X POST $RPC_URL -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`

### Faucet runs but shows captcha

**Cause**: Turnstile is configured

**Solution**: For localnet testing, remove or comment out `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### npm install fails (peer dependency)

**Solution**: 
```bash
npm install --legacy-peer-deps
```

## Next Steps

1. ✅ **Local testing**: You're already set up!
2. 📖 **Read docs**: Check [README.md](./README.md) for full documentation
3. 🔧 **Customize**: Modify drop amounts, cooldowns, UI colors
4. 🚀 **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
5. 📊 **Monitor**: Set up alerts for treasury balance

## Resources

- **Full Documentation**: [README.md](./README.md)
- **Redis Setup**: [REDIS_SETUP.md](./REDIS_SETUP.md)
- **Local Testing**: [LOCALNET.md](./LOCALNET.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Armchain Docs**: https://docs.armchain.io

## Support

- **GitHub Issues**: Report bugs or request features
- **Discord**: Join the Armchain community
- **Documentation**: All guides in this repository

---

Built with ❤️ for Armchain

Happy building! 🚀
