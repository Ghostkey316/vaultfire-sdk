/**
 * Vaultfire SDK Safe Defaults
 *
 * This wrapper is intended for partners who want privacy-preserving defaults
 * and a narrower API surface that is harder to misuse.
 *
 * Design goals:
 * - Do not ship user statements/PII anywhere by default (hash locally)
 * - Disable analytics by default
 * - Avoid optional metadata (easy to accidentally leak)
 * - Keep dependencies minimal (reuses ethers + existing SDK)
 */
import type { Signer } from 'ethers';
import { VaultfireSDK } from './vaultfire';
import type { ChainId, VaultfireConfig, VerificationResult } from './vaultfire';
export interface VaultfireSafeConfig extends VaultfireConfig {
    /**
     * When set, statements are hashed as `keccak256(UTF8("${privacySalt}:${normalizedStatement}"))`.
     *
     * Recommended: provide a stable, secret per-application salt via env var.
     * This mitigates dictionary/rainbow-table attacks against short statements.
     */
    privacySalt?: string;
    /**
     * If `true`, statements are normalized before hashing (trim + collapse whitespace).
     * Default: true.
     */
    normalizeStatements?: boolean;
}
export interface VerifyStatementRequest {
    /** Human-readable statement. This wrapper will hash it locally. */
    statement: string;
    /** Module ID (see ModuleType enum in vaultfire.ts). */
    moduleId: number;
    /** Optional ZK proof bundle (hex). If omitted, the underlying SDK uses a minimal placeholder. */
    zkProofBundle?: string;
}
/**
 * Privacy-preserving wrapper around `VaultfireSDK`.
 */
export declare class VaultfireSafeSDK {
    private readonly sdk;
    private readonly privacySalt?;
    private readonly normalize;
    constructor(config?: VaultfireSafeConfig);
    /** Connect a signer for write operations (same as underlying SDK). */
    connect(signer: Signer): void;
    /**
     * Hash a statement locally.
     *
     * Note: This is *not* reversible and is safe to store/log compared to raw statement.
     */
    hashStatement(statement: string): string;
    /**
     * Verify a statement (hashes locally and sends only `beliefHash` on-chain).
     */
    verifyStatement(request: VerifyStatementRequest): Promise<VerificationResult>;
    /** Convenience passthroughs (read-only). */
    isSovereign(beliefHash: string): Promise<boolean>;
    getModules(): Promise<import("./vaultfire").ModuleInfo[]>;
    getChainConfig(): {
        chain: ChainId;
        chainId: number;
        contracts: {
            dilithiumAttestor?: string;
            beliefVerifier?: string;
        };
    };
    /** Escape hatch: access the underlying SDK if you truly need it. */
    unsafeRaw(): VaultfireSDK;
}
export declare function createVaultfireSafeSDK(config?: VaultfireSafeConfig): VaultfireSafeSDK;
export declare function createVaultfireSafeSDKForChain(chain?: ChainId, config?: Omit<VaultfireSafeConfig, 'chain'>): VaultfireSafeSDK;
