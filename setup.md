# Namecheap CLI Setup

## Prerequisites

1. **Namecheap Account** — Create one at [namecheap.com](https://www.namecheap.com)
2. **API Access Eligibility** — You need one of:
   - $50+ lifetime spend on your account
   - 20+ domains in your account
   - $50+ account balance

## Getting Your API Key

1. Log into Namecheap
2. Go to **Profile → Tools → Namecheap API Access**
3. Toggle API Access to **ON**
4. Copy your API Key

## Whitelist Your Server IP

On the same API Access page, add your server's IP address to the whitelist:
- Default: `95.216.209.150`

## Configure Environment

Add to `/root/.openclaw/.env`:

```
NAMECHEAP_API_KEY=your_api_key_here
NAMECHEAP_USER=your_username_here
```

Optional overrides:
```
NAMECHEAP_CLIENT_IP=your.server.ip
NAMECHEAP_FIRST_NAME=Josh
NAMECHEAP_LAST_NAME=Lloyd
NAMECHEAP_ADDRESS=252 Swan Lane
NAMECHEAP_CITY=Manchester
NAMECHEAP_POSTAL=WN2 4EY
NAMECHEAP_COUNTRY=GB
NAMECHEAP_PHONE=+47.91365265
NAMECHEAP_EMAIL=joshlloyd4031@gmail.com
```

## Install & Build

```bash
cd skills/namecheap
npm install
npm run build
chmod +x namecheap.sh
```

## Test

```bash
./namecheap.sh list
```
