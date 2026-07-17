# Deployment Guide

This guide walks you through deploying the Armchain Faucet to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. ✅ A GitHub account with your code pushed
2. ✅ A Vercel account ([sign up free](https://vercel.com/signup))
3. ✅ A Cloudflare account for Turnstile
4. ✅ A funded treasury wallet on your target network

## Step-by-Step Deployment

### 1. Set Up Cloudflare Turnstile

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the sidebar
3. Click **Add Site**
4. Configure:
   - **Site name**: Armchain Faucet
   - **Domain**: Your domain (or `localhost` for testing)
   - **Widget Mode**: Managed
5. Click **Create**
6. Copy your **Site Key** and **Secret Key** - you'll need these later

### 2. Prepare Your Repository

1. **Commit all changes**:

```bash
git add .
git commit -m "Initial faucet implementation"
```

2. **Push to GitHub**:

```bash
git push origin main
```

3. **Verify `.env` is in `.gitignore`** (it should be - never commit secrets!)

### 3. Set Up Redis Database

For production deployment, you'll need a Redis instance. Here are recommended options:

#### Option A: Upstash Redis (Recommended for Vercel)

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up or log in
3. Click **Create Database**
4. Configure:
   - **Name**: armchain-faucet-redis
   - **Type**: Regional (select region close to your deployment)
   - **TLS**: Enabled
5. Click **Create**
6. Copy the **Redis URL** (looks like `rediss://default:...@...upstash.io:6379`)

#### Option B: Redis Cloud

1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Copy the connection string

#### Option C: Railway Redis

1. Go to [Railway](https://railway.app/)
2. Create a new project
3. Add **Redis** plugin
4. Copy `REDIS_URL` from variables

### 4. Deploy to Vercel

1. Go to [Vercel New Project](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your faucet repository
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables** - Click "Environment Variables" and add:

```bash
# System
NODE_ENV=production
LOG_LEVEL=info
CHAIN_ENV=devnet

# Public Configuration
NEXT_PUBLIC_CHAIN_NAME=Armchain Devnet
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_EXPLORER_URL=https://explorer.armchain.io

# Cloudflare Turnstile (from Step 1)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...
TURNSTILE_SECRET_KEY=0x4AAAA...

# Redis Connection (from Step 3)
REDIS_URL=rediss://default:...@...upstash.io:6379

# Devnet Configuration
DEVNET_RPC_URL=https://rpc.devnet.armchain.io
DEVNET_TREASURY_KEY=0x... (your private key)
DEVNET_DROP_AMOUNT=10
DEVNET_COOLDOWN_SECONDS=3600
```

⚠️ **Security Note**: Make sure `DEVNET_TREASURY_KEY`, `TURNSTILE_SECRET_KEY`, and `REDIS_URL` do NOT have the `NEXT_PUBLIC_` prefix - they should be server-side only!

6. Click **Deploy**

### 5. Update Turnstile Domain

1. Go back to [Cloudflare Turnstile](https://dash.cloudflare.com/)
2. Click on your site
3. Update **Domains** to include your Vercel domain:
   - `your-project.vercel.app`
   - Add custom domain if you have one
4. Save changes

### 6. Verify Deployment

1. Visit your Vercel deployment URL
2. Test the faucet:
   - Enter a wallet address
   - Complete the Turnstile captcha
   - Click "Request Funds"
   - Verify the transaction on the block explorer

## Setting Up a Custom Domain

### Add Custom Domain to Vercel

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `faucet.armchain.io`)
4. Follow Vercel's DNS configuration instructions

### Update Turnstile

1. Add your custom domain to Cloudflare Turnstile settings
2. Redeploy if needed (Vercel usually handles this automatically)

## Environment Management

### Development vs Production

Create different environments for development and production:

**Development** (`.env.local`):
```bash
CHAIN_ENV=devnet
DEVNET_DROP_AMOUNT=10
DEVNET_COOLDOWN_SECONDS=60  # 1 minute for testing
```

**Production** (Vercel Environment Variables):
```bash
CHAIN_ENV=testnet
TESTNET_DROP_AMOUNT=1
TESTNET_COOLDOWN_SECONDS=86400  # 24 hours
```

### Switching Networks

To switch from devnet to testnet in production:

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Update `CHAIN_ENV` from `devnet` to `testnet`
3. Ensure all `TESTNET_*` variables are configured
4. Redeploy (or let automatic deployment handle it)

## Monitoring & Maintenance

### Monitor Treasury Balance

Create a simple script to check treasury balance:

```bash
# Check balance
curl -X POST https://rpc.devnet.armchain.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["YOUR_TREASURY_ADDRESS","latest"],"id":1}'
```

Set up alerts when balance drops below a threshold.

### Monitor Faucet Usage

Check Redis to see active rate limits:

```bash
# Connect to your Redis instance
redis-cli -u $REDIS_URL

# List all faucet keys
KEYS faucet:*

# Check a specific key
TTL faucet:devnet:0x123...
```

### View Logs

1. Go to Vercel project → **Deployments**
2. Click on a deployment
3. View **Function Logs** to see:
   - Successful claims
   - Failed validation attempts
   - Errors

## Troubleshooting Deployment

### Build Fails

**Error**: `Module not found` or similar

**Solution**:
```bash
# Locally test the build
npm run build

# If successful locally, ensure all dependencies are in package.json
npm install --save-dev <missing-package>
git commit && git push
```

### Environment Variables Not Working

**Error**: "Configuration validation failed"

**Solution**:
1. Check that variables are spelled correctly
2. Ensure no extra spaces in values
3. Verify private keys start with `0x`
4. Redeploy after changes

### Turnstile Not Loading

**Error**: Captcha widget doesn't appear

**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set correctly
3. Ensure domain is whitelisted in Cloudflare
4. Try incognito mode to rule out extensions

### Transactions Failing

**Error**: "Failed to send transaction"

**Solution**:
1. Check RPC URL is accessible from Vercel's network
2. Verify treasury wallet has sufficient funds
3. Test RPC endpoint manually:
   ```bash
   curl -X POST YOUR_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

## Advanced Configuration

### Enable Analytics

Add Vercel Analytics:

```bash
npm install @vercel/analytics
```

In `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Add to JSX:
<Analytics />
```

### Set Up Monitoring

Add Vercel Speed Insights:

```bash
npm install @vercel/speed-insights
```

### Configure CORS (if needed)

If building a separate frontend, configure CORS in `app/api/claim/route.ts`:

```typescript
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://your-frontend.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

## Rollback

If a deployment breaks:

1. Go to Vercel → **Deployments**
2. Find a previous working deployment
3. Click **⋯** → **Promote to Production**

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- GitHub Issues: [Report an issue]

---

Happy deploying! 🚀
