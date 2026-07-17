# Redis Setup Guide

The Armchain Faucet uses Redis for rate limiting to prevent spam and abuse. This guide covers setting up Redis for development and production.

## Why Redis?

- **Fast**: In-memory data store with microsecond latency
- **Reliable**: Battle-tested with automatic expiration (TTL)
- **Scalable**: Handles thousands of requests per second
- **Simple**: Key-value store perfect for rate limiting

## Development Setup

### Option 1: LocalNet (No Redis Required)

For quick local testing, use the `localnet` environment which uses in-memory storage:

```bash
# .env.local
CHAIN_ENV="localnet"
# No REDIS_URL needed!
```

The faucet automatically falls back to an in-memory Map when Redis is not configured.

### Option 2: Local Redis

For testing Redis integration locally:

#### macOS (Homebrew)

```bash
brew install redis
brew services start redis

# Test connection
redis-cli ping
# Should return: PONG
```

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test connection
redis-cli ping
```

#### Windows (WSL)

```bash
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt-get update
sudo apt-get install redis
sudo service redis-server start
```

#### Docker

```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Test connection
docker exec -it redis redis-cli ping
```

#### Configuration

```bash
# .env.local
REDIS_URL="redis://localhost:6379"
```

## Production Setup

### Option 1: Upstash (Recommended for Vercel)

Upstash offers serverless Redis with a generous free tier, perfect for Vercel deployments.

**Pros:**
- ✅ Free tier: 10,000 commands/day
- ✅ Global edge network
- ✅ Serverless (pay per use)
- ✅ Built-in REST API
- ✅ TLS by default

**Setup:**

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Create account and verify email
3. Click **Create Database**
4. Configure:
   - **Name**: armchain-faucet
   - **Type**: Regional
   - **Region**: Choose closest to your deployment
   - **TLS**: Enabled (default)
5. Click **Create**
6. Copy **Redis URL** (looks like `rediss://default:...@...upstash.io:6379`)

**Environment Variable:**

```bash
REDIS_URL="rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379"
```

**Pricing:**
- Free: 10,000 commands/day, 256MB storage
- Pay as you go: $0.20 per 100K commands

### Option 2: Redis Cloud

Official managed Redis service from Redis Inc.

**Pros:**
- ✅ Official Redis
- ✅ Free tier: 30MB storage
- ✅ High availability options
- ✅ Advanced features (Redis Stack)

**Setup:**

1. Go to [redis.com/try-free](https://redis.com/try-free/)
2. Create free account
3. Click **New subscription** → **Fixed plan** → **Free**
4. Select cloud provider and region
5. Create database
6. Copy **Public endpoint** and **Password**

**Environment Variable:**

```bash
REDIS_URL="redis://default:YOUR_PASSWORD@YOUR_ENDPOINT:PORT"
```

**Pricing:**
- Free: 30MB storage, 30 connections
- Paid plans from $5/month

### Option 3: Railway

Simple platform with Redis plugin.

**Pros:**
- ✅ Simple one-click Redis
- ✅ $5 free credit/month
- ✅ Auto-scaling
- ✅ Easy integration

**Setup:**

1. Go to [railway.app](https://railway.app/)
2. Create project
3. Click **+ New** → **Database** → **Add Redis**
4. Copy `REDIS_URL` from **Variables** tab

**Pricing:**
- $5 free credit/month
- Pay as you go: ~$5/month for basic Redis

### Option 4: Self-Hosted

Host Redis on your own server or VPS.

**Pros:**
- ✅ Full control
- ✅ No vendor lock-in
- ✅ Can be cheaper at scale

**Cons:**
- ❌ Manual maintenance
- ❌ Need to handle backups
- ❌ Security configuration

**Quick Setup on Ubuntu:**

```bash
# Install Redis
sudo apt-get update
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password (uncomment and change)
requirepass YOUR_STRONG_PASSWORD

# Bind to all interfaces (if accessing remotely)
bind 0.0.0.0

# Restart Redis
sudo systemctl restart redis-server

# Test
redis-cli -a YOUR_STRONG_PASSWORD ping
```

**Environment Variable:**

```bash
# Local network
REDIS_URL="redis://:YOUR_PASSWORD@YOUR_SERVER_IP:6379"

# With TLS (recommended for production)
REDIS_URL="rediss://:YOUR_PASSWORD@YOUR_SERVER_IP:6380"
```

## Connection String Format

```
redis://[username]:[password]@[host]:[port]/[database]
rediss://[username]:[password]@[host]:[port]/[database]
```

- `redis://` - Standard connection
- `rediss://` - TLS/SSL encrypted connection (recommended for production)
- `username` - Usually `default` (Redis 6+)
- `password` - Your Redis password
- `host` - Redis server hostname/IP
- `port` - Default is `6379`
- `database` - Database number (0-15), default is 0

**Examples:**

```bash
# Local Redis without password
REDIS_URL="redis://localhost:6379"

# Local Redis with password
REDIS_URL="redis://:mypassword@localhost:6379"

# Cloud Redis with TLS
REDIS_URL="rediss://default:abc123@my-redis.cloud.com:6379"

# Upstash
REDIS_URL="rediss://default:AbCd1234567890@example-12345.upstash.io:6379"
```

## Verifying Your Setup

### Test Redis Connection

```bash
# Install redis-cli
npm install -g redis-cli

# Test connection
redis-cli -u $REDIS_URL ping
# Should return: PONG
```

### Test from Node.js

Create `test-redis.mjs`:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Test set/get
await redis.set('test:key', 'hello', 'EX', 10);
const value = await redis.get('test:key');
console.log('Retrieved value:', value);

await redis.quit();
```

Run:

```bash
node test-redis.mjs
```

### Test in Faucet

1. Start your faucet with Redis configured
2. Make a claim
3. Check Redis for the rate limit key:

```bash
redis-cli -u $REDIS_URL

# List all faucet keys
KEYS faucet:*

# Check specific key
GET faucet:devnet:0x123...
TTL faucet:devnet:0x123...
```

## Monitoring

### Redis CLI Commands

```bash
# Connect
redis-cli -u $REDIS_URL

# View all faucet keys
KEYS faucet:*

# Check key expiration
TTL faucet:devnet:0x1234567890abcdef...

# Delete a key (remove rate limit)
DEL faucet:devnet:0x1234567890abcdef...

# View database info
INFO
```

### Upstash Dashboard

If using Upstash:
1. Go to your database dashboard
2. View **Metrics** tab for:
   - Commands per second
   - Storage usage
   - Connection count
3. Use **CLI** tab for debugging

## Troubleshooting

### Error: "ECONNREFUSED"

**Cause**: Cannot connect to Redis

**Solutions:**
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_URL` is correct
- Check firewall settings
- For cloud Redis, ensure IP whitelist includes your server

### Error: "NOAUTH Authentication required"

**Cause**: Redis requires password but none provided

**Solution:**
- Add password to connection string: `redis://:YOUR_PASSWORD@host:6379`

### Error: "Connection timeout"

**Cause**: Network issues or wrong host

**Solutions:**
- Verify host/port in `REDIS_URL`
- Check if Redis is accessible from your network
- Try `redis-cli -u $REDIS_URL ping`

### Fallback to In-Memory

If Redis is unavailable, the faucet automatically falls back to in-memory storage:

```
[LocalNet] Rate limit set for 0x123... (3600s)
```

This works but is not suitable for production (data lost on restart).

## Security Best Practices

1. **Use TLS in Production**: Always use `rediss://` in production
2. **Strong Passwords**: Generate with `openssl rand -hex 32`
3. **Limit Access**: Whitelist only necessary IPs
4. **Regular Backups**: Enable automated backups (cloud providers)
5. **Monitor Access**: Check Redis logs regularly
6. **Separate Environments**: Use different Redis instances for dev/prod

## Cost Comparison

| Provider | Free Tier | Basic Paid | Best For |
|----------|-----------|------------|----------|
| **Upstash** | 10K cmds/day | $0.20/100K cmds | Serverless, Vercel |
| **Redis Cloud** | 30MB | $5/month | Traditional apps |
| **Railway** | $5 credit/month | ~$5/month | Simple setup |
| **Self-Hosted** | Server cost only | Server cost | High volume |

**Recommendation**: Start with Upstash free tier, upgrade if you exceed 10K claims/day.

## Environment Examples

### Development

```bash
CHAIN_ENV="localnet"
# No REDIS_URL needed - uses in-memory store
```

### Staging

```bash
CHAIN_ENV="devnet"
REDIS_URL="redis://localhost:6379"
```

### Production

```bash
CHAIN_ENV="testnet"
REDIS_URL="rediss://default:PASSWORD@your-redis.upstash.io:6379"
```

---

Need help? Check the [main README](./README.md) or open an issue on GitHub.
