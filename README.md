# @vaultfire/sdk

> Official TypeScript SDK for the Vaultfire Protocol — the trust and accountability layer for AI agents.

![npm version](https://img.shields.io/npm/v/@vaultfire/sdk.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Base](https://img.shields.io/badge/Chain-Base-blue.svg)
![Avalanche](https://img.shields.io/badge/Chain-Avalanche-red.svg)

---

## What is This?

The TypeScript SDK for integrating Vaultfire trust verification into any application. Verify beliefs, check attestations, query agent reputation — all on-chain, on Base and Avalanche.

Built on ERC-8004 identity, CRYSTALS-Dilithium quantum-resistant attestations, and the Vaultfire belief verification system.

**Two modes:**
- **VaultfireSDK** — Full access, raw `beliefHash` input, all methods exposed
- **VaultfireSafeSDK** — Privacy-preserving wrapper, hashes statements locally, analytics off by default

---

## Installation

```bash
npm install @vaultfire/sdk ethers
```

---

## Quick Start

### Recommended: Safe Defaults (Privacy-Preserving)

```typescript
import { VaultfireSafeSDK, ModuleType } from '@vaultfire/sdk';
import { Wallet } from 'ethers';

const vaultfire = new VaultfireSafeSDK({
  chain: 'base',
  privacySalt: process.env.VAULTFIRE_PRIVACY_SALT,
});

vaultfire.connect(new Wallet(process.env.AGENT_PRIVATE_KEY));

const result = await vaultfire.verifyStatement({
  statement: 'I contribute to open source',
  moduleId: ModuleType.GITHUB,
});

console.log('Verified:', result.verified);
console.log('TX Hash:', result.txHash);
```

### Raw SDK (Advanced)

```typescript
import { VaultfireSDK, ModuleType } from '@vaultfire/sdk';
import { Wallet } from 'ethers';

const vaultfire = new VaultfireSDK({ chain: 'base' });
vaultfire.connect(new Wallet(process.env.AGENT_PRIVATE_KEY));

const result = await vaultfire.verifyBelief({
  beliefHash: vaultfire.hashBelief('I contribute to open source'),
  moduleId: ModuleType.GITHUB,
});

console.log('Verified:', result.verified);
console.log('TX Hash:', result.txHash);
```

### Avalanche

```typescript
const vaultfire = new VaultfireSDK({ chain: 'avalanche' });
```

That's it. The SDK handles RPC endpoints and contract addresses automatically for each chain.

---

## Features

- **Multi-chain** — Base (chain ID 8453) and Avalanche C-Chain (chain ID 43114) out of the box
- **Post-quantum attestations** — CRYSTALS-Dilithium via DilithiumAttestor contracts
- **Privacy-preserving mode** — VaultfireSafeSDK hashes statements locally with a salt, never sends raw text on-chain
- **Type-safe** — Full TypeScript types and declaration files
- **Minimal dependencies** — Just `ethers` v6
- **Read and write** — Query attestations (read-only) or submit new ones (with a connected signer)

---

## Supported Chains

| Chain | Chain ID | Status | DilithiumAttestor | BeliefVerifier |
|-------|----------|--------|-------------------|----------------|
| Base | 8453 | **Live** | [`0xBBC0...0A4`](https://basescan.org/address/0xBBC0EFdEE23854e7cb7C4c0f56fF7670BB0530A4) | [`0xa5CE...272`](https://basescan.org/address/0xa5CEC47B48999EB398707838E3A18dd20A1ae272) |
| Avalanche | 43114 | **Live** | [`0x2115...cF1f`](https://snowtrace.io/address/0x211554bd46e3D4e064b51a31F61927ae9c7bCF1f) | [`0xb3d8...D2F`](https://snowtrace.io/address/0xb3d8063e67bdA1a869721D0F6c346f1Af0469D2F) |
| Base Sepolia | 84532 | Testnet | — | — |

---

## API Reference

### VaultfireSDK

```typescript
import { VaultfireSDK } from '@vaultfire/sdk';

const sdk = new VaultfireSDK({
  chain: 'base',           // 'base' | 'avalanche' | 'base-sepolia' | 'base-goerli'
  rpcUrl: '...',           // Optional custom RPC
  contracts: { ... },      // Optional custom contract addresses
  apiKey: '...',           // Optional API key
  analytics: true,         // Optional (default: true)
});
```

#### Methods

| Method | Description |
|--------|-------------|
| `connect(signer)` | Connect an ethers Signer for write operations |
| `verifyBelief(attestation)` | Submit a belief attestation on-chain |
| `isSovereign(beliefHash)` | Check if a belief has been attested |
| `getAttestations(address, limit?)` | Get attestations for an address |
| `getModules()` | List available verification modules |
| `hashBelief(statement)` | Hash a statement with keccak256 |
| `estimateGas(attestation)` | Estimate gas for a verification |
| `getChainConfig()` | Get current chain configuration |

### VaultfireSafeSDK

Privacy-preserving wrapper. Hashes statements locally before sending on-chain.

```typescript
import { VaultfireSafeSDK } from '@vaultfire/sdk';

const sdk = new VaultfireSafeSDK({
  chain: 'base',
  privacySalt: process.env.VAULTFIRE_PRIVACY_SALT,  // Recommended
});
```

| Method | Description |
|--------|-------------|
| `connect(signer)` | Connect an ethers Signer |
| `verifyStatement(request)` | Hash locally + verify on-chain |
| `hashStatement(statement)` | Hash with salt (never sends raw text) |
| `isSovereign(beliefHash)` | Check attestation status |
| `getModules()` | List modules |
| `getChainConfig()` | Get chain config |
| `unsafeRaw()` | Escape hatch to underlying VaultfireSDK |

See [SAFE_DEFAULTS.md](./SAFE_DEFAULTS.md) for the full privacy model.

### ModuleType Enum

```typescript
enum ModuleType {
  GENERIC = 0,      // Generic belief attestation
  GITHUB = 1,       // GitHub contributions
  NS3 = 2,          // NS3 namespace ownership
  BASE = 3,         // Base transactions
  CREDENTIAL = 4,   // Professional credentials
  REPUTATION = 5,   // On-chain reputation
  IDENTITY = 6,     // Identity verification
  GOVERNANCE = 7,   // DAO governance proofs
}
```

---

## Examples

### DeFi: Prove Trading History

```typescript
const result = await sdk.verifyBelief({
  beliefHash: sdk.hashBelief('Profitable trader Q1 2026'),
  moduleId: ModuleType.REPUTATION,
  metadata: { pnl: '+15%', trades: 47 }, // stays off-chain
});
```

### DAO: Reputation-Weighted Voting

```typescript
const attestations = await sdk.getAttestations(memberAddress);
const reputationScore = attestations.filter(a => a.zkVerified).length;

if (reputationScore >= 10) {
  // Allow proposal submission
}
```

See the `examples/` directory for complete runnable examples.

---

## Full API Documentation

See [API_REFERENCE.md](./API_REFERENCE.md) for the complete API reference including REST API endpoints, error handling, and rate limits.

---

## Architecture

```
┌────────────────────────────────────────────────────┐
│                  Your Application                  │
├────────────────────────────────────────────────────┤
│                                                    │
│   VaultfireSafeSDK (privacy-preserving)            │
│       └── VaultfireSDK (core)                      │
│               └── ethers.js (provider + signer)    │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│   Base (8453)            Avalanche (43114)          │
│   ├── DilithiumAttestor  ├── DilithiumAttestor     │
│   └── BeliefVerifier     └── BeliefVerifier        │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Ecosystem

The SDK is one piece of the Vaultfire stack. Combine with these packages for the full agent operating system:

| Package | Description |
|---|---|
| [`@vaultfire/x402`](https://github.com/Ghostkey316/vaultfire-x402) | x402 payment protocol — HTTP 402 USDC micropayments on Base & Avalanche |
| [`@vaultfire/xmtp`](https://github.com/Ghostkey316/vaultfire-xmtp) | Trust-gated encrypted agent messaging via XMTP |
| [`@vaultfire/vns`](https://github.com/Ghostkey316/vaultfire-vns) | On-chain `.vns` name service for AI agents |
| [`vaultfire-contracts`](https://github.com/Ghostkey316/vaultfire-contracts) | Canonical contract registry — all deployed ABIs and addresses |

---

## Explore

- **Hub:** [theloopbreaker.com](https://theloopbreaker.com)
- **Main Protocol Repo:** [ghostkey-316-vaultfire-init](https://github.com/Ghostkey316/ghostkey-316-vaultfire-init)
- **Vaultfire on Base:** [vaultfire-base](https://github.com/Ghostkey316/vaultfire-base)
- **Vaultfire on Avalanche:** [vaultfire-avalanche](https://github.com/Ghostkey316/vaultfire-avalanche)
- **Hermes Integration:** [hermes-vaultfire](https://github.com/Ghostkey316/hermes-vaultfire)
- **OpenClaw Plugin:** [openclaw-vaultfire](https://github.com/Ghostkey316/openclaw-vaultfire)

---

## Mission

> Morals over metrics. Privacy over surveillance. Freedom over control.

---

## License

MIT — Vaultfire Protocol is open source.
