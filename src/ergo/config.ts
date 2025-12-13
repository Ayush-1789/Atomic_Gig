// Ergo Network Configuration
// Using Ergo Testnet for development

export const ERGO_CONFIG = {
    // Network
    network: 'testnet' as const,
    networkType: 0, // 0 = mainnet, 16 = testnet

    // Explorer API (for querying blockchain state)
    explorerUrl: 'https://api-testnet.ergoplatform.com',
    explorerApiUrl: 'https://api-testnet.ergoplatform.com/api/v1',

    // Node API (for submitting transactions)
    nodeUrl: 'https://testnet.ergoplatform.com',

    // Token IDs
    tokens: {
        // We'll mint this DJED-TEST token for the demo
        DJED_TEST: '' as string, // Will be set after minting
    },

    // Contract parameters
    contracts: {
        // Minimum unlock time (5 seconds in demo)
        MIN_UNLOCK_MS: 5_000,
        // Maximum unlock time (120 seconds)
        MAX_UNLOCK_MS: 120_000,
        // Base unlock time (30 seconds)
        BASE_UNLOCK_MS: 30_000,
    },
}

// Ergo Box Register indices
export const REGISTERS = {
    // R0-R3 are system registers
    R4: 4, // Custom data 1 (e.g., Worker PK)
    R5: 5, // Custom data 2 (e.g., Jobs completed)
    R6: 6, // Custom data 3 (e.g., Pending amount)
    R7: 7, // Custom data 4 (e.g., Disputes lost)
    R8: 8, // Custom data 5 (e.g., Unlock timestamp)
    R9: 9, // Custom data 6 (e.g., Gig amount)
}

// Nautilus wallet API types
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

declare global {
    interface Window {
        ergoConnector?: {
            nautilus?: {
                connect(): Promise<NautilusAPI>
                isConnected(): Promise<boolean>
            }
        }
    }
}
