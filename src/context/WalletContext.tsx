import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { wallet, WalletState } from '../ergo/wallet'

interface WalletContextType {
    state: WalletState
    isConnecting: boolean
    error: string | null
    connect: () => Promise<void>
    disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WalletState>({
        connected: false,
        address: null,
        balance: { erg: 0, djedTest: 0 },
    })
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const connect = useCallback(async () => {
        setIsConnecting(true)
        setError(null)

        try {
            const walletState = await wallet.connect()
            setState(walletState)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to connect wallet'
            setError(message)
            console.error('[WalletContext]', message)
        } finally {
            setIsConnecting(false)
        }
    }, [])

    const disconnect = useCallback(async () => {
        await wallet.disconnect()
        setState({
            connected: false,
            address: null,
            balance: { erg: 0, djedTest: 0 },
        })
    }, [])

    return (
        <WalletContext.Provider value={{ state, isConnecting, error, connect, disconnect }}>
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (!context) throw new Error('useWallet must be used within WalletProvider')
    return context
}
