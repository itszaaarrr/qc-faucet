# LocalNet Development Guide

This guide explains how to run the Armchain Faucet locally for testing with Hardhat or Ganache.

## What is LocalNet Strategy?

The LocalNet strategy is designed for rapid local development and testing. It **skips all validation** including:

- ❌ No Cloudflare Turnstile / Captcha
- ❌ No Redis / Vercel KV requirement
- ❌ No rate limiting (uses in-memory store)
- ❌ No cooldown by default
- ✅ Perfect for testing with Hardhat / Ganache!

⚠️ **WARNING**: Never use LocalNet in production! It has no security whatsoever.

## Quick Start

### 1. Set Up Local Blockchain

#### Option A: Using Hardhat

```bash
# In a separate terminal
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with 20 pre-funded accounts.

#### Option B: Using Ganache

```bash
npm install -g ganache
ganache --port 8545
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```bash
# App Configuration
NODE_ENV="development"
LOG_LEVEL="debug"
CHAIN_ENV="localnet"

# Public Configuration
NEXT_PUBLIC_CHAIN_NAME="Local Hardhat"
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_EXPLORER_URL="http://localhost:3000"

# LocalNet Configuration
LOCALNET_RPC_URL="http://127.0.0.1:8545"
# Hardhat Account #0 private key (publicly known, safe for local testing!)
LOCALNET_TREASURY_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
LOCALNET_DROP_AMOUNT="100"
LOCALNET_COOLDOWN_SECONDS="0"
```

**Note**: You can omit `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN` when using localnet.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Faucet

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Test the Faucet

1. Copy any Hardhat test address (e.g., `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`)
2. Paste it into the faucet form
3. Click "Request Funds" (no captcha required!)
4. Tokens are sent instantly with no cooldown

## Using Custom Private Keys

If you want to use a different treasury wallet:

### Generate a new private key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Fund the wallet on Hardhat:

```javascript
// In Hardhat console
const [signer] = await ethers.getSigners();
await signer.sendTransaction({
  to: "YOUR_TREASURY_ADDRESS",
  value: ethers.parseEther("1000")
});
```

### Update .env.local:

```bash
LOCALNET_TREASURY_KEY="0xYOUR_PRIVATE_KEY"
```

## Default Hardhat Accounts

Hardhat provides 20 pre-funded accounts. Here are the first 3:

| Account | Address | Private Key |
|---------|---------|-------------|
| #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |

**Important**: These keys are publicly known! Only use them for local testing.

## Configuration Options

### Drop Amount

```bash
LOCALNET_DROP_AMOUNT="100"  # Send 100 tokens per claim
```

### Cooldown (Testing Rate Limiting)

```bash
LOCALNET_COOLDOWN_SECONDS="10"  # 10 second cooldown for testing
```

Even with a cooldown, no captcha is required.

### Custom RPC URL

```bash
LOCALNET_RPC_URL="http://localhost:9545"  # Custom port
```

## Architecture Notes

### How LocalNet Strategy Works

The LocalNet strategy (`lib/strategies/LocalnetStrategy.ts`) is intentionally minimal:

```typescript
async validateRequest(): Promise<void> {
  // NO VALIDATION - intentionally empty
  return Promise.resolve();
}
```

### In-Memory Rate Limiting

When `KV_REST_API_URL` is not configured, the faucet uses an in-memory Map for rate limiting:

```typescript
const localStore = new Map<string, { value: string; expiry: number }>();
```

This resets when the server restarts.

## Testing Scenarios

### Test 1: Basic Claim

```bash
# Request tokens for an address
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "turnstileToken": "bypass"
  }'
```

### Test 2: Rate Limiting (if cooldown is set)

```bash
# First request succeeds
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "turnstileToken": "bypass"}'

# Immediate second request fails (if LOCALNET_COOLDOWN_SECONDS > 0)
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "turnstileToken": "bypass"}'
```

### Test 3: Multiple Addresses

```bash
# Different addresses work simultaneously (no global rate limit)
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "turnstileToken": "bypass"}'
```

## Debugging

### Check Treasury Balance

```javascript
// In Hardhat console
const balance = await ethers.provider.getBalance("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
console.log(ethers.formatEther(balance), "ETH");
```

### View Logs

The faucet logs all actions when `LOG_LEVEL="debug"`:

```
[LocalNet] Skipping all validation for: 0x70997...
[LocalNet] Rate limit set for 0x70997... (10s)
```

### Common Issues

**Error: "Unable to connect to blockchain network"**
- Solution: Ensure Hardhat/Ganache is running on the correct port

**Error: "Faucet treasury has insufficient funds"**
- Solution: The default Hardhat account has 10,000 ETH. If depleted, restart Hardhat

**Frontend shows captcha widget**
- Solution: Ensure `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is NOT set in `.env.local`

## Switching Between Environments

### From LocalNet to DevNet

1. Update `.env.local`:
   ```bash
   CHAIN_ENV="devnet"
   ```

2. Add required DevNet variables:
   ```bash
   NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."
   TURNSTILE_SECRET_KEY="..."
   KV_REST_API_URL="..."
   KV_REST_API_TOKEN="..."
   ```

3. Restart the server

### Environment Comparison

| Feature | LocalNet | DevNet | TestNet | MainNet |
|---------|----------|---------|---------|---------|
| Captcha | ❌ | ✅ | ✅ | ✅ |
| Rate Limiting | In-Memory | Redis | Redis | Redis |
| Cooldown | Optional (0s default) | Yes | Yes | Yes |
| Use Case | Local Testing | Development | Public Testing | Production |

## Advanced: Custom Network

Testing with a custom local network (e.g., BSC local, Polygon local):

```bash
LOCALNET_RPC_URL="http://localhost:9650"
NEXT_PUBLIC_CHAIN_ID=43112  # Avalanche local
LOCALNET_DROP_AMOUNT="50"
```

## Security Reminder

🚨 **Never set `CHAIN_ENV=localnet` in production!**

The LocalNet strategy has:
- No bot protection
- No spam prevention
- No authentication
- Default private keys that are publicly known

Always use `devnet`, `testnet`, or `mainnet` for deployed environments.

## Support

For issues with local development:
- Hardhat Docs: https://hardhat.org/docs
- Ganache Docs: https://trufflesuite.com/docs/ganache/

---

Happy local testing! 🚀
