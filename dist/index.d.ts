/**
 * @vaultfire/sdk — Official TypeScript SDK for Vaultfire Protocol
 *
 * The trust and accountability layer for AI agents.
 * Deployed on Base and Avalanche.
 *
 * @packageDocumentation
 */
export { VaultfireSDK, createVaultfireSDK, } from './vaultfire';
export { VaultfireSafeSDK, createVaultfireSafeSDK, createVaultfireSafeSDKForChain, } from './safe';
export type { ChainId, VaultfireConfig, BeliefAttestation, VerificationResult, Attestation, ModuleInfo, } from './vaultfire';
export type { VaultfireSafeConfig, VerifyStatementRequest, } from './safe';
export { ModuleType } from './vaultfire';
