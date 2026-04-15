/**
 * @vaultfire/sdk — Official TypeScript SDK for Vaultfire Protocol
 *
 * The trust and accountability layer for AI agents.
 * Deployed on Base and Avalanche.
 *
 * @packageDocumentation
 */

// Core SDK
export {
  VaultfireSDK,
  createVaultfireSDK,
} from './vaultfire';

// Safe-defaults wrapper (privacy-preserving)
export {
  VaultfireSafeSDK,
  createVaultfireSafeSDK,
  createVaultfireSafeSDKForChain,
} from './safe';

// Types
export type {
  ChainId,
  VaultfireConfig,
  BeliefAttestation,
  VerificationResult,
  Attestation,
  ModuleInfo,
} from './vaultfire';

export type {
  VaultfireSafeConfig,
  VerifyStatementRequest,
} from './safe';

// Enums
export { ModuleType } from './vaultfire';
