// Wallet Connector (Nautilus + SAFEW Support)
// Connects to browser extension wallets

import { ERGO_CONFIG } from './config'

export type WalletState = {
    connected: boolean
    address: string | null
    balance: {
        erg: number
        djedTest: number
    }
    walletName: 'safew' | 'nautilus' | null
}

interface ErgoAPI {
    get_change_address(): Promise<string>
    get_used_addresses(): Promise<string[]>
    get_balance(tokenId?: string): Promise<string>
    sign_tx(tx: object): Promise<object>
    submit_tx(tx: object): Promise<string>
}

class WalletConnector {
    private context: ErgoAPI | null = null
    private activeWallet: 'safew' | 'nautilus' | null = null

    async connect(): Promise<WalletState> {
        if (typeof window === 'undefined') throw new Error('Window not available')

        const connector = await this.waitForConnector()
        if (!connector) throw new Error('No Ergo wallet found. Please install Nautilus.')

        // Try Nautilus first (since user is using it)
        const wallets = [
            { name: 'nautilus', instance: connector.nautilus },
            { name: 'safew', instance: connector.safew },
        ]

        for (const w of wallets) {
            if (w.instance) {
                try {
                    console.log(`[Wallet] Connecting to ${w.name}...`)
                    const connected = await w.instance.connect()

                    if (connected) {
                        const api = await this.waitForErgoApi()
                        if (api) {
                            this.context = api
                            this.activeWallet = w.name as any

                            const address = await api.get_change_address()
                            const balance = await this.getBalance()

                            console.log(`[Wallet] Connected to ${w.name}:`, address)
                            return {
                                connected: true,
                                address,
                                balance,
                                walletName: this.activeWallet
                            }
                        }
                    }
                } catch (e) {
                    console.warn(`[Wallet] Failed to connect to ${w.name}:`, e)
                }
            }
        }

        throw new Error('Connection failed or rejected')
    }

    // Helpers
    private async waitForConnector(retries = 20): Promise<any> {
        for (let i = 0; i < retries; i++) {
            if ((window as any).ergoConnector) return (window as any).ergoConnector
            await new Promise(r => setTimeout(r, 100))
        }
        return null
    }

    private async waitForErgoApi(retries = 30): Promise<ErgoAPI | null> {
        for (let i = 0; i < retries; i++) {
            if ((window as any).ergo) return (window as any).ergo
            await new Promise(r => setTimeout(r, 100))
        }
        return null
    }

    async disconnect(): Promise<void> {
        const connector = (window as any).ergoConnector
        if (this.activeWallet && connector?.[this.activeWallet]?.disconnect) {
            await connector[this.activeWallet].disconnect()
        }
        this.context = null
        this.activeWallet = null
    }

    async getAddress(): Promise<string> {
        if (!this.context) throw new Error('Wallet not connected')
        return this.context.get_change_address()
    }

    async getBalance(): Promise<{ erg: number; djedTest: number }> {
        if (!this.context) return { erg: 0, djedTest: 0 }
        try {
            const ergNano = await this.context.get_balance()
            return { erg: Number(ergNano) / 1e9, djedTest: 0 }
        } catch {
            return { erg: 0, djedTest: 0 }
        }
    }

    async getAllAddresses(): Promise<string[]> {
        if (!this.context) return []
        try {
            const used = await this.context.get_used_addresses()
            const change = await this.context.get_change_address()
            // Combine and dedupe
            const all = [...new Set([...used, change])]
            console.log(`[Wallet] Found ${all.length} addresses`)
            return all
        } catch {
            return []
        }
    }

    async signTransaction(unsignedTx: any): Promise<any> {
        if (!this.context) throw new Error('Wallet not connected')
        console.log('[Wallet] Requesting signature from Nautilus...')

        // Convert to EIP-12 format if available
        const txToSign = unsignedTx.toEIP12Object
            ? unsignedTx.toEIP12Object()
            : unsignedTx;

        console.log('[Wallet] TX Format:', txToSign)
        return this.context.sign_tx(txToSign)
    }

    async submitTransaction(signedTx: any): Promise<string> {
        if (!this.context) throw new Error('Wallet not connected')
        console.log('[Wallet] Submitting transaction via Nautilus...')
        return this.context.submit_tx(signedTx)
    }
}

export const wallet = new WalletConnector()
