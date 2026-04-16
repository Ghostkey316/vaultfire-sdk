/**
 * Unit tests for the Vaultfire SDK.
 *
 * Tests cover:
 *   - SDK instantiation and chain configuration
 *   - Belief hashing
 *   - Module listing
 *   - Chain config retrieval
 *   - Type exports
 *   - SafeSDK privacy wrapper
 *   - Multi-chain support (Base + Avalanche)
 */

import {
  VaultfireSDK,
  VaultfireSafeSDK,
  ModuleType,
  createVaultfireSDK,
  createVaultfireSafeSDK,
  createVaultfireSafeSDKForChain,
} from '../src/index';

import type {
  ChainId,
  VaultfireConfig,
  BeliefAttestation,
  VerificationResult,
  Attestation,
  ModuleInfo,
  VaultfireSafeConfig,
  VerifyStatementRequest,
} from '../src/index';

// ---------------------------------------------------------------------------
// SDK Instantiation
// ---------------------------------------------------------------------------

describe('VaultfireSDK', () => {
  describe('constructor', () => {
    it('should instantiate with default config (base)', () => {
      const sdk = new VaultfireSDK();
      const config = sdk.getChainConfig();
      expect(config.chain).toBe('base');
      expect(config.chainId).toBe(8453);
    });

    it('should instantiate with base chain explicitly', () => {
      const sdk = new VaultfireSDK({ chain: 'base' });
      const config = sdk.getChainConfig();
      expect(config.chain).toBe('base');
      expect(config.chainId).toBe(8453);
    });

    it('should instantiate with avalanche chain', () => {
      const sdk = new VaultfireSDK({ chain: 'avalanche' });
      const config = sdk.getChainConfig();
      expect(config.chain).toBe('avalanche');
      expect(config.chainId).toBe(43114);
    });

    it('should instantiate with arbitrum chain', () => {
      const sdk = new VaultfireSDK({ chain: 'arbitrum' });
      const config = sdk.getChainConfig();
      expect(config.chain).toBe('arbitrum');
      expect(config.chainId).toBe(42161);
    });
  });

  describe('createVaultfireSDK helper', () => {
    it('should create a base SDK by default', () => {
      const sdk = createVaultfireSDK();
      expect(sdk.getChainConfig().chain).toBe('base');
    });

    it('should create an avalanche SDK', () => {
      const sdk = createVaultfireSDK('avalanche');
      expect(sdk.getChainConfig().chain).toBe('avalanche');
    });
  });
});

// ---------------------------------------------------------------------------
// Chain Configuration
// ---------------------------------------------------------------------------

describe('Chain Configuration', () => {
  it('base should have correct contract addresses', () => {
    const sdk = new VaultfireSDK({ chain: 'base' });
    const config = sdk.getChainConfig();
    expect(config.contracts.dilithiumAttestor).toBe('0xBBC0EFdEE23854e7cb7C4c0f56fF7670BB0530A4');
    expect(config.contracts.beliefVerifier).toBe('0xa5CEC47B48999EB398707838E3A18dd20A1ae272');
  });

  it('avalanche should have correct contract addresses', () => {
    const sdk = new VaultfireSDK({ chain: 'avalanche' });
    const config = sdk.getChainConfig();
    expect(config.contracts.dilithiumAttestor).toBe('0x211554bd46e3D4e064b51a31F61927ae9c7bCF1f');
    expect(config.contracts.beliefVerifier).toBe('0xb3d8063e67bdA1a869721D0F6c346f1Af0469D2F');
  });

  it('all contract addresses should be valid hex', () => {
    const chains: ChainId[] = ['base', 'avalanche', 'arbitrum', 'polygon'];
    for (const chain of chains) {
      const sdk = new VaultfireSDK({ chain });
      const config = sdk.getChainConfig();
      expect(config.contracts.dilithiumAttestor).toMatch(/^0x[0-9a-fA-F]{40}$/);
      expect(config.contracts.beliefVerifier).toMatch(/^0x[0-9a-fA-F]{40}$/);
    }
  });

  it('should allow custom RPC URL', () => {
    const sdk = new VaultfireSDK({
      chain: 'base',
      rpcUrl: 'https://custom-rpc.example.com',
    });
    // Should not throw
    expect(sdk.getChainConfig().chain).toBe('base');
  });

  it('should allow custom contract addresses', () => {
    const customAddr = '0x1234567890123456789012345678901234567890';
    const sdk = new VaultfireSDK({
      chain: 'base',
      contracts: { dilithiumAttestor: customAddr },
    });
    const config = sdk.getChainConfig();
    expect(config.contracts.dilithiumAttestor).toBe(customAddr);
  });
});

// ---------------------------------------------------------------------------
// Belief Hashing
// ---------------------------------------------------------------------------

describe('hashBelief', () => {
  const sdk = new VaultfireSDK({ chain: 'base' });

  it('should return a hex string starting with 0x', () => {
    const hash = sdk.hashBelief('test statement');
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it('should produce deterministic hashes', () => {
    const hash1 = sdk.hashBelief('I contribute to open source');
    const hash2 = sdk.hashBelief('I contribute to open source');
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different statements', () => {
    const hash1 = sdk.hashBelief('statement A');
    const hash2 = sdk.hashBelief('statement B');
    expect(hash1).not.toBe(hash2);
  });

  it('should produce 32-byte (64 hex char) keccak256 hashes', () => {
    const hash = sdk.hashBelief('test');
    // Remove 0x prefix, should be exactly 64 hex chars
    expect(hash.slice(2).length).toBe(64);
  });

  it('should handle empty string', () => {
    const hash = sdk.hashBelief('');
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });

  it('should handle unicode', () => {
    const hash = sdk.hashBelief('私はオープンソースに貢献しています');
    expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
  });
});

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

describe('getModules', () => {
  const sdk = new VaultfireSDK({ chain: 'base' });

  it('should return all 8 modules', async () => {
    const modules = await sdk.getModules();
    expect(modules).toHaveLength(8);
  });

  it('should include all module types', async () => {
    const modules = await sdk.getModules();
    const ids = modules.map(m => m.id);
    expect(ids).toContain(ModuleType.GENERIC);
    expect(ids).toContain(ModuleType.GITHUB);
    expect(ids).toContain(ModuleType.NS3);
    expect(ids).toContain(ModuleType.BASE);
    expect(ids).toContain(ModuleType.CREDENTIAL);
    expect(ids).toContain(ModuleType.REPUTATION);
    expect(ids).toContain(ModuleType.IDENTITY);
    expect(ids).toContain(ModuleType.GOVERNANCE);
  });

  it('all modules should be enabled', async () => {
    const modules = await sdk.getModules();
    for (const mod of modules) {
      expect(mod.enabled).toBe(true);
    }
  });

  it('all modules should have name and description', async () => {
    const modules = await sdk.getModules();
    for (const mod of modules) {
      expect(mod.name.length).toBeGreaterThan(0);
      expect(mod.description.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// ModuleType Enum
// ---------------------------------------------------------------------------

describe('ModuleType', () => {
  it('should have correct numeric values', () => {
    expect(ModuleType.GENERIC).toBe(0);
    expect(ModuleType.GITHUB).toBe(1);
    expect(ModuleType.NS3).toBe(2);
    expect(ModuleType.BASE).toBe(3);
    expect(ModuleType.CREDENTIAL).toBe(4);
    expect(ModuleType.REPUTATION).toBe(5);
    expect(ModuleType.IDENTITY).toBe(6);
    expect(ModuleType.GOVERNANCE).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// verifyBelief (without signer)
// ---------------------------------------------------------------------------

describe('verifyBelief without signer', () => {
  const sdk = new VaultfireSDK({ chain: 'base' });

  it('should throw when no signer is connected', async () => {
    await expect(
      sdk.verifyBelief({
        beliefHash: sdk.hashBelief('test'),
        moduleId: ModuleType.GENERIC,
      })
    ).rejects.toThrow('SDK not connected');
  });
});

// ---------------------------------------------------------------------------
// isSovereign (read-only, will fail without network but should not throw)
// ---------------------------------------------------------------------------

describe('isSovereign', () => {
  const sdk = new VaultfireSDK({ chain: 'base' });

  it('should return false for a random hash (network error handled gracefully)', async () => {
    const hash = sdk.hashBelief('definitely not attested');
    const result = await sdk.isSovereign(hash);
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gas Estimation (will use fallback without network)
// ---------------------------------------------------------------------------

describe('estimateGas', () => {
  const sdk = new VaultfireSDK({ chain: 'base' });

  it('should return a default estimate when network is unavailable', async () => {
    const gas = await sdk.estimateGas({
      beliefHash: sdk.hashBelief('test'),
      moduleId: ModuleType.GENERIC,
    });
    expect(gas).toBe(BigInt(61000));
  });
});

// ---------------------------------------------------------------------------
// VaultfireSafeSDK
// ---------------------------------------------------------------------------

describe('VaultfireSafeSDK', () => {
  describe('constructor', () => {
    it('should instantiate with default config', () => {
      const sdk = new VaultfireSafeSDK();
      const config = sdk.getChainConfig();
      expect(config.chain).toBe('base');
    });

    it('should instantiate with avalanche', () => {
      const sdk = new VaultfireSafeSDK({ chain: 'avalanche' });
      const config = sdk.getChainConfig();
      expect(config.chain).toBe('avalanche');
    });
  });

  describe('hashStatement', () => {
    it('should produce deterministic hashes', () => {
      const sdk = new VaultfireSafeSDK();
      const h1 = sdk.hashStatement('test statement');
      const h2 = sdk.hashStatement('test statement');
      expect(h1).toBe(h2);
    });

    it('should produce different hashes with different salts', () => {
      const sdk1 = new VaultfireSafeSDK({ privacySalt: 'salt-a' });
      const sdk2 = new VaultfireSafeSDK({ privacySalt: 'salt-b' });
      const h1 = sdk1.hashStatement('same statement');
      const h2 = sdk2.hashStatement('same statement');
      expect(h1).not.toBe(h2);
    });

    it('should normalize whitespace by default', () => {
      const sdk = new VaultfireSafeSDK();
      const h1 = sdk.hashStatement('  hello   world  ');
      const h2 = sdk.hashStatement('hello world');
      expect(h1).toBe(h2);
    });

    it('should not normalize when disabled', () => {
      const sdk = new VaultfireSafeSDK({ normalizeStatements: false });
      const h1 = sdk.hashStatement('  hello   world  ');
      const h2 = sdk.hashStatement('hello world');
      expect(h1).not.toBe(h2);
    });

    it('should produce valid hex hash', () => {
      const sdk = new VaultfireSafeSDK({ privacySalt: 'my-salt' });
      const hash = sdk.hashStatement('I value privacy');
      expect(hash).toMatch(/^0x[0-9a-fA-F]{64}$/);
    });
  });

  describe('unsafeRaw', () => {
    it('should return the underlying VaultfireSDK', () => {
      const safe = new VaultfireSafeSDK({ chain: 'base' });
      const raw = safe.unsafeRaw();
      expect(raw).toBeInstanceOf(VaultfireSDK);
      expect(raw.getChainConfig().chain).toBe('base');
    });
  });

  describe('factory functions', () => {
    it('createVaultfireSafeSDK should create instance', () => {
      const sdk = createVaultfireSafeSDK();
      expect(sdk.getChainConfig().chain).toBe('base');
    });

    it('createVaultfireSafeSDKForChain should create for specific chain', () => {
      const sdk = createVaultfireSafeSDKForChain('avalanche');
      expect(sdk.getChainConfig().chain).toBe('avalanche');
    });
  });
});

// ---------------------------------------------------------------------------
// Type Exports (compile-time check)
// ---------------------------------------------------------------------------

describe('Type exports', () => {
  it('all expected types should be importable', () => {
    // These are compile-time checks — if the imports above work, this passes
    const config: VaultfireConfig = { chain: 'base' };
    const attestation: BeliefAttestation = {
      beliefHash: '0x' + '00'.repeat(32),
      moduleId: 0,
    };
    const safeConfig: VaultfireSafeConfig = { chain: 'base', privacySalt: 'test' };
    const request: VerifyStatementRequest = {
      statement: 'test',
      moduleId: 0,
    };

    expect(config.chain).toBe('base');
    expect(attestation.moduleId).toBe(0);
    expect(safeConfig.privacySalt).toBe('test');
    expect(request.statement).toBe('test');
  });
});
