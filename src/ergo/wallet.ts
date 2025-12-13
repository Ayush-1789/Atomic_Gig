// Nautilus Wallet Connector
// Handles connection, address retrieval, and transaction signing

import { ERGO_CONFIG } from './config'

export type WalletState = {
    connected: boolean
    address: string | null
    balance: {
        erg: number
        djedTest: number
    }
}

interface NautilusContext {
    get_change_address(): Promise<string>
    get_used_addresses(): Promise<string[]>
    get_balance(tokenId?: string): Promise<string>
    sign_tx(tx: object): Promise<object>
    submit_tx(tx: object): Promise<string>
}

class WalletConnector {
    private context: NautilusContext | null = null

    async connect(): Promise<WalletState> {
        if (typeof window === 'undefined') {
            throw new Error('Window not available')
        }

        // Wait up to 2 seconds for injection
        const ergoConnector = await this.waitForConnector()

        if (!ergoConnector?.nautilus) {
            throw new Error('Nautilus wallet not detected. Please ensuring the extension is active and refresh the page.')
        }

        try {
            console.log('[Wallet] Requesting connection...')
            const connected = await ergoConnector.nautilus.connect()

            if (connected) {
                console.log('[Wallet] User approved connection. Waiting for API injection...')

                // Wait for window.ergo to be populated
                const ergoApi = await this.waitForErgoApi()

                if (ergoApi) {
                    this.context = ergoApi
                    const address = await ergoApi.get_change_address()
                    const balance = await this.getBalance()

                    console.log('[Wallet] Connected successfully:', address)
                    return { connected: true, address, balance }
                } else {
                    throw new Error('Wallet connected but API not injected')
                }
            } else {
                throw new Error('User rejected connection')
            }
        } catch (err) {
            console.error('[Wallet] Connection error:', err)
            throw err
        }
    }

    // Wait for ergoConnector to appear
    private async waitForConnector(retries = 20, interval = 100): Promise<any> {
        for (let i = 0; i < retries; i++) {
            if ((window as any).ergoConnector) {
                return (window as any).ergoConnector
            }
            await new Promise(resolve => setTimeout(resolve, interval))
        }
        return null
    }

    // Wait for window.ergo
    private async waitForErgoApi(retries = 30, interval = 100): Promise<NautilusContext | null> {
        for (let i = 0; i < retries; i++) {
            if ((window as any).ergo) {
                return (window as any).ergo
            }
            await new Promise(resolve => setTimeout(resolve, interval))
        }
        return null
    }

    async disconnect(): Promise<void> {
        const ergoConnector = (window as any).ergoConnector
        if (ergoConnector?.nautilus?.disconnect) {
            await ergoConnector.nautilus.disconnect()
        }
        this.context = null
    }

    // ... (rest of methods same)
    async isConnected(): Promise<boolean> {
        // Check connector first
        const ergoConnector = await this.waitForConnector(5) // quick check
        if (ergoConnector?.nautilus?.isConnected) {
            return ergoConnector.nautilus.isConnected()
        }
        return this.context !== null
    }

    async getAddress(): Promise<string> {
        if (!this.context) throw new Error('Wallet not connected')
        return this.context.get_change_address()
    }

    async getBalance(): Promise<{ erg: number; djedTest: number }> {
        if (!this.context) return { erg: 0, djedTest: 0 }
        // ... (rest same as before)
        try {
            const ergNano = await this.context.get_balance()
            const ergBalance = Number(ergNano) / 1e9
            let djedBalance = 0
            if (ERGO_CONFIG.tokens.DJED_TEST) {
                try {
                    const djedAmount = await this.context.get_balance(ERGO_CONFIG.tokens.DJED_TEST)
                    djedBalance = Number(djedAmount) || 0
                } catch { }
            }
            return { erg: ergBalance, djedTest: djedBalance }
        } catch (err) {
            return { erg: 0, djedTest: 0 }
        }
    }

    async signTransaction(tx: object): Promise<object> {
        if (!this.context) throw new Error('Wallet not connected')
        return this.context.sign_tx(tx)
    }

    async submitTransaction(tx: object): Promise<string> {
        if (!this.context) throw new Error('Wallet not connected')
        return this.context.submit_tx(tx)
    }

    getContext(): NautilusContext | null {
        return this.context
    }
}

export const wallet = new WalletConnector()
