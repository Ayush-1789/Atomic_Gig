import { useWallet } from '../context/WalletContext'

export function WalletButton() {
    const { state, isConnecting, error, connect, disconnect } = useWallet()

    if (state.connected) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.75rem' }}>
                    <div style={{ color: '#10b981' }}>● Connected</div>
                    <div style={{ color: '#666', fontFamily: 'monospace' }}>
                        {state.address?.slice(0, 8)}...{state.address?.slice(-6)}
                    </div>
                </div>
                <div style={{ fontSize: '0.6875rem', textAlign: 'right' }}>
                    <div>{state.balance.erg.toFixed(2)} ERG</div>
                    <div style={{ color: '#f59e0b' }}>{state.balance.djedTest} DJED</div>
                </div>
                <button
                    onClick={disconnect}
                    className="btn"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem' }}
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
                onClick={connect}
                disabled={isConnecting}
                className="btn btn-green"
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
            >
                {isConnecting ? 'Connecting...' : '🔗 Connect Nautilus'}
            </button>
            {error && (
                <span style={{ color: '#ef4444', fontSize: '0.6875rem' }}>{error}</span>
            )}
        </div>
    )
}
