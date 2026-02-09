# Namecheap CLI

Domain management via the Namecheap API.

## Location
`skills/namecheap/namecheap.sh`

## Commands

| Command | Description |
|---------|-------------|
| `check <domains>` | Check availability (auto-expands bare names to .com/.io/.co/.ai/.xyz) |
| `search <keyword>` | Check keyword across 9 TLDs |
| `register <domain> [--years N]` | Register a domain |
| `list [--page N] [--pageSize N]` | List owned domains |
| `info <domain>` | Domain details |
| `dns-get <domain>` | Get DNS records |
| `dns-set <domain> --records '<json>'` | Set DNS records |
| `nameservers-get <domain>` | Get nameservers |
| `nameservers-set <domain> --ns ns1,ns2` | Set nameservers |
| `ssl-list` | List SSL certs |
| `ssl-create <domain> [--type T] [--years N]` | Buy SSL |
| `ssl-activate <certId> <domain> --csr <file>` | Activate SSL |
| `whoisguard-enable <domain>` | Lock domain |
| `renew <domain> [--years N]` | Renew domain |
| `transfer-status <transferId>` | Transfer status |

## Output
All JSON to stdout. Errors as JSON to stderr.

## Config
Requires `NAMECHEAP_API_KEY` and `NAMECHEAP_USER` in `/root/.openclaw/.env`.
