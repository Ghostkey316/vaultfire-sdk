"use strict";
/**
 * @vaultfire/sdk — Official TypeScript SDK for Vaultfire Protocol
 *
 * The trust and accountability layer for AI agents.
 * Deployed on Base and Avalanche.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleType = exports.createVaultfireSafeSDKForChain = exports.createVaultfireSafeSDK = exports.VaultfireSafeSDK = exports.createVaultfireSDK = exports.VaultfireSDK = void 0;
// Core SDK
var vaultfire_1 = require("./vaultfire");
Object.defineProperty(exports, "VaultfireSDK", { enumerable: true, get: function () { return vaultfire_1.VaultfireSDK; } });
Object.defineProperty(exports, "createVaultfireSDK", { enumerable: true, get: function () { return vaultfire_1.createVaultfireSDK; } });
// Safe-defaults wrapper (privacy-preserving)
var safe_1 = require("./safe");
Object.defineProperty(exports, "VaultfireSafeSDK", { enumerable: true, get: function () { return safe_1.VaultfireSafeSDK; } });
Object.defineProperty(exports, "createVaultfireSafeSDK", { enumerable: true, get: function () { return safe_1.createVaultfireSafeSDK; } });
Object.defineProperty(exports, "createVaultfireSafeSDKForChain", { enumerable: true, get: function () { return safe_1.createVaultfireSafeSDKForChain; } });
// Enums
var vaultfire_2 = require("./vaultfire");
Object.defineProperty(exports, "ModuleType", { enumerable: true, get: function () { return vaultfire_2.ModuleType; } });
