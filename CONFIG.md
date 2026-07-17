# Configuration Guide

The Armchain Faucet uses a **clean, environment-agnostic configuration pattern**. Instead of duplicating variables for each environment (DEVNET_RPC_URL, TESTNET_RPC_URL, etc.), you use the same variable names and switch environments via `CHAIN_ENV`.

## Quick Start

Create a `.env.local` file:

```bash
# Select your environment
CHAIN_ENV="localnet"

# Universal configuration (applies to selected environment)
RPC_URL="http://127.0.0.1:8545"
TREASURY_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DROP_AMOUNT="100"
COOLDOWN_SECONDS="0"
```

That's it! Change `CHAIN_ENV` to switch environments.

## All Environment Variables

### Required Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHAIN_ENV` | `localnet` | Active environment: `localnet`, `devnet`, `testnet`, `mainnet` |
| `RPC_URL` | `http://127.0.0.1:8545` | Blockchain RPC endpoint |
| `TREASURY_KEY` | Hardhat #0 | Private key of treasury wallet (64 hex chars with 0x prefix) |
| `DROP_AMOUNT` | `100` | Number of tokens to send per claim |
| `COOLDOWN_SECONDS` | `0` | Cooldown period between claims (0 = no cooldown) |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `""` | Redis connection string (empty = in-memory store for localnet) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `""` | Cloudflare Turnstile site key (empty = skip captcha) |
| `TURNSTILE_SECRET_KEY` | `""` | Cloudflare Turnstile secret key |
| `NEXT_PUBLIC_CHAIN_NAME` | `"Armchain Testnet"` | Display name for the chain |
| `NEXT_PUBLIC_CHAIN_ID` | `31337` | Chain ID for network identification |
| `NEXT_PUBLIC_EXPLORER_URL` | `http://localhost:3000/tx` | Block explorer base URL |
| `NODE_ENV` | `development` | Node environment |
| `LOG_LEVEL` | `info` | Logging level: `error`, `warn`, `info`, `debug` |

## Environment Examples

### LocalNet (Default - Local Testing)

Perfect for development with Hardhat/Ganache. No Redis or Turnstile needed!

```bash
CHAIN_ENV="localnet"

# Optional overrides (shown with defaults)
RPC_URL="http://127.0.0.1:8545"
TREASURY_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DROP_AMOUNT="100"
COOLDOWN_SECONDS="0"

NEXT_PUBLIC_CHAIN_NAME="Local Hardhat"
NEXT_PUBLIC_CHAIN_ID=31337
```

### DevNet (Development Network)

```bash
CHAIN_ENV="devnet"

# Network configuration
RPC_URL="https://rpc.devnet.armchain.io"
TREASURY_KEY="0x<your-devnet-treasury-key>"
DROP_AMOUNT="10"
COOLDOWN_SECONDS="3600"

# Security (optional but recommended)
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAA..."
TURNSTILE_SECRET_KEY="0x4AAA..."

# Public config
NEXT_PUBLIC_CHAIN_NAME="Armchain DevNet"
NEXT_PUBLIC_CHAIN_ID=12345
NEXT_PUBLIC_EXPLORER_URL="https://explorer.devnet.armchain.io"
```

### TestNet (Public Testnet)

```bash
CHAIN_ENV="testnet"

# Network configuration
RPC_URL="https://rpc.testnet.armchain.io"
TREASURY_KEY="0x<your-testnet-treasury-key>"
DROP_AMOUNT="1"
COOLDOWN_SECONDS="86400"

# Security (required for public access)
REDIS_URL="rediss://default:password@your-redis.upstash.io:6379"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAA..."
TURNSTILE_SECRET_KEY="0x4AAA..."

# Public config
NEXT_PUBLIC_CHAIN_NAME="Armchain Testnet"
NEXT_PUBLIC_CHAIN_ID=67890
NEXT_PUBLIC_EXPLORER_URL="https://explorer.testnet.armchain.io"
```

### MainNet (Production)

```bash
NODE_ENV="production"
CHAIN_ENV="mainnet"

# Network configuration
RPC_URL="https://rpc.mainnet.armchain.io"
TREASURY_KEY="0x<your-mainnet-treasury-key>"
DROP_AMOUNT="0.1"
COOLDOWN_SECONDS="86400"

# Security (required)
REDIS_URL="rediss://default:password@prod-redis.upstash.io:6379"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAA..."
TURNSTILE_SECRET_KEY="0x4AAA..."

# Public config
NEXT_PUBLIC_CHAIN_NAME="Armchain"
NEXT_PUBLIC_CHAIN_ID=11111
NEXT_PUBLIC_EXPLORER_URL="https://explorer.armchain.io"
```

## Strategy Pattern

Each `CHAIN_ENV` uses a different validation strategy:

### LocalNet Strategy
- ❌ No Turnstile validation
- ❌ No Redis requirement
- ❌ No rate limiting (uses in-memory store)
- ✅ Perfect for rapid local testing

### DevNet/TestNet/MainNet Strategies
- ✅ Turnstile validation (if configured)
- ✅ Redis-based rate limiting
- ✅ Configurable cooldown periods
- ✅ Production-ready security

## Switching Environments

### For Development
```bash
# .env.local
CHAIN_ENV="localnet"
```

### For Staging
```bash
# .env.staging
CHAIN_ENV="testnet"
RPC_URL="https://rpc.testnet.armchain.io"
TREASURY_KEY="0x..."
```

### For Production
```bash
# Set in Vercel/hosting platform
CHAIN_ENV="mainnet"
RPC_URL="https://rpc.mainnet.armchain.io"
TREASURY_KEY="0x..."
```

## Configuration Validation

The app validates all config on startup using Zod. If any required values are missing or invalid:

```bash
❌ Configuration validation failed:
[
  {
    "code": "invalid_string",
    "validation": "regex",
    "path": ["TREASURY_KEY"],
    "message": "Invalid Private Key (must start with 0x)"
  }
]
```

### Common Validation Errors

**Invalid Private Key:**
```bash
# ❌ Wrong
TREASURY_KEY="abc123"

# ✅ Correct
TREASURY_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

**Invalid RPC URL:**
```bash
# ❌ Wrong
RPC_URL="localhost:8545"

# ✅ Correct
RPC_URL="http://localhost:8545"
```

**Negative Values:**
```bash
# ❌ Wrong
DROP_AMOUNT="-5"
COOLDOWN_SECONDS="-100"

# ✅ Correct
DROP_AMOUNT="5"
COOLDOWN_SECONDS="0"
```

## Default Values Explained

### RPC_URL
- **Default**: `http://127.0.0.1:8545`
- **Why**: Standard Hardhat node address
- **Change for**: Any non-local network

### TREASURY_KEY
- **Default**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Why**: Hardhat's first account (publicly known, safe for local testing only!)
- **Change for**: Any non-local environment (use your own secure key)

### DROP_AMOUNT
- **Default**: `100`
- **Why**: Generous amount for local testing
- **Typical values**:
  - LocalNet: 100-1000
  - DevNet: 5-10
  - TestNet: 0.5-1
  - MainNet: 0.01-0.1

### COOLDOWN_SECONDS
- **Default**: `0` (no cooldown)
- **Why**: No rate limiting for rapid local testing
- **Typical values**:
  - LocalNet: 0-60 seconds
  - DevNet: 1-6 hours (3600-21600)
  - TestNet/MainNet: 24 hours (86400)

## Security Notes

### LocalNet
- ⚠️ Uses publicly known Hardhat keys
- ⚠️ No validation or rate limiting
- ⚠️ **NEVER use in production**

### Production Environments
- ✅ Use strong, unique private keys
- ✅ Enable Turnstile for bot protection
- ✅ Use TLS for Redis (`rediss://`)
- ✅ Set appropriate cooldown periods
- ✅ Monitor treasury balance
- ✅ Use environment variables, never commit secrets

## Troubleshooting

### "Configuration validation failed"
Check that all required variables are set with valid formats.

### "Unable to connect to blockchain network"
Verify `RPC_URL` is correct and accessible.

### "Faucet treasury has insufficient funds"
Treasury wallet needs more tokens. Check balance and fund accordingly.

### Captcha not showing
If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is empty, captcha is skipped (intended for localnet).

### Rate limiting not working
- For localnet: Expected behavior (uses in-memory store)
- For production: Check `REDIS_URL` is configured correctly

## Best Practices

1. **Use `.env.local` for development** (git-ignored)
2. **Use environment variables in production** (Vercel, Railway, etc.)
3. **Never commit private keys to git**
4. **Use different treasury wallets for each environment**
5. **Start with localnet, then move to testnet, finally mainnet**
6. **Monitor treasury balance regularly**
7. **Set appropriate drop amounts and cooldowns**

---

For more information, see [README.md](./README.md) and [GETTING_STARTED.md](./GETTING_STARTED.md).
