// Ergo Network Configuration
// MAINNET MODE with Nautilus Browser Extension

export const ERGO_CONFIG = {
    // Network (MAINNET)
    network: 'mainnet' as const,
    networkType: 0, // 0 = Mainnet

    // Real Transactions via Nautilus
    SIMULATION_MODE: false,

    // Explorer API (Mainnet)
    explorerUrl: 'https://explorer.ergoplatform.com',
    explorerApiUrl: 'https://api.ergoplatform.com/api/v1',

    // Node API (Mainnet)
    nodeUrl: 'http://213.239.193.208:9053',

    // Token IDs
    tokens: {
        DJED_TEST: '0000000000000000000000000000000000000000000000000000000000000000',
    },

    // Contract parameters
    contracts: {
        MIN_UNLOCK_MS: 5_000,
        MAX_UNLOCK_MS: 120_000,
        BASE_UNLOCK_MS: 30_000,
    },

    // Not using Burner Wallet - Using Nautilus Extension
    BURNER_WALLET: {
        MNEMONIC: '',
        ADDRESS: ''
    }
}

// Ergo Box Register indices
export const REGISTERS = { R4: 4, R5: 5, R6: 6, R7: 7, R8: 8, R9: 9 }

export interface NautilusAPI {
    connect(): Promise<boolean>
    disconnect(): Promise<void>
    isConnected(): Promise<boolean>
    getChangeAddress(): Promise<string>
    getUsedAddresses(): Promise<string[]>
    signTx(tx: string): Promise<string>
    submitTx(tx: string): Promise<string>
    getBalance(): Promise<{ nanoErgs: string; tokens: { tokenId: string; amount: string }[] }>
}
