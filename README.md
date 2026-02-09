# Namecheap CLI

A TypeScript CLI for managing domains, DNS, SSL, and more via the Namecheap API.

## Features

- **Domain Availability** — Check single or multiple domains, auto-expands bare keywords to popular TLDs
- **Domain Search** — Check a keyword across 9 TLDs (.com, .io, .co, .ai, .xyz, .dev, .app, .net, .org)
- **Domain Registration** — Register domains with configurable registrant info
- **Domain Management** — List, get info, renew owned domains
- **DNS Management** — Get and set DNS host records
- **Nameserver Management** — Get and set custom nameservers
- **SSL Certificates** — List, purchase, and activate SSL certs
- **WhoisGuard** — Enable registrar lock
- **Transfer Status** — Check domain transfer progress

## Quick Start

```bash
./namecheap.sh list                    # List your domains
./namecheap.sh check example           # Check example.com/.io/.co/.ai/.xyz
./namecheap.sh dns-get example.com     # Get DNS records
./namecheap.sh dns-set example.com --records '[{"type":"A","name":"@","value":"1.2.3.4","ttl":1800}]'
```

## Requirements

- Node.js 18+
- Namecheap API key (see setup.md)
