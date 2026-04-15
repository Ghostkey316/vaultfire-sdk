"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultfireSafeSDK = void 0;
exports.createVaultfireSafeSDK = createVaultfireSafeSDK;
exports.createVaultfireSafeSDKForChain = createVaultfireSafeSDKForChain;
const vaultfire_1 = require("./vaultfire");
function normalizeStatement(statement) {
    return statement.trim().replace(/\s+/g, ' ');
}
/**
 * Privacy-preserving wrapper around `VaultfireSDK`.
 */
class VaultfireSafeSDK {
    constructor(config = {}) {
        const { privacySalt, normalizeStatements, ...rest } = config;
        this.privacySalt = privacySalt;
        this.normalize = normalizeStatements !== false;
        // Safe defaults: analytics OFF, apiKey empty unless explicitly provided.
        this.sdk = new vaultfire_1.VaultfireSDK({
            ...rest,
            analytics: false,
            apiKey: rest.apiKey || '',
        });
    }
    /** Connect a signer for write operations (same as underlying SDK). */
    connect(signer) {
        this.sdk.connect(signer);
    }
    /**
     * Hash a statement locally.
     *
     * Note: This is *not* reversible and is safe to store/log compared to raw statement.
     */
    hashStatement(statement) {
        const normalized = this.normalize ? normalizeStatement(statement) : statement;
        const payload = this.privacySalt ? `${this.privacySalt}:${normalized}` : normalized;
        return this.sdk.hashBelief(payload);
    }
    /**
     * Verify a statement (hashes locally and sends only `beliefHash` on-chain).
     */
    async verifyStatement(request) {
        const beliefHash = this.hashStatement(request.statement);
        // Intentionally do not accept metadata to reduce accidental leakage.
        return this.sdk.verifyBelief({
            beliefHash,
            moduleId: request.moduleId,
            zkProofBundle: request.zkProofBundle,
        });
    }
    /** Convenience passthroughs (read-only). */
    isSovereign(beliefHash) {
        return this.sdk.isSovereign(beliefHash);
    }
    getModules() {
        return this.sdk.getModules();
    }
    getChainConfig() {
        return this.sdk.getChainConfig();
    }
    /** Escape hatch: access the underlying SDK if you truly need it. */
    unsafeRaw() {
        return this.sdk;
    }
}
exports.VaultfireSafeSDK = VaultfireSafeSDK;
function createVaultfireSafeSDK(config = {}) {
    return new VaultfireSafeSDK(config);
}
function createVaultfireSafeSDKForChain(chain = 'base', config = {}) {
    return new VaultfireSafeSDK({ ...config, chain });
}
