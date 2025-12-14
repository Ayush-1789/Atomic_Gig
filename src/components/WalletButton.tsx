import { useWallet } from '../context/WalletContext'

export function WalletButton() {
    const { state, isConnecting, error, connect, disconnect } = useWallet()

    if (state.connected) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.75rem' }}>
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ● Connected
                        <span style={{
                            fontSize: '0.625rem',
                            padding: '0.1rem 0.3rem',
                            borderRadius: '4px',
                            color: state.walletName === 'burner' ? '#fff' : '#888',
                            background: state.walletName === 'burner' ? '#ef4444' : '#222',
                            textTransform: 'uppercase'
                        }}>
                            {state.walletName === 'burner' ? '⚡ BURNER' : state.walletName}
                        </span>
                    </div>
                    <div style={{ color: '#666', fontFamily: 'monospace' }}>
                        {state.address?.slice(0, 8)}...{state.address?.slice(-6)}
                    </div>
                </div>
                <div style={{ fontSize: '0.6875rem', textAlign: 'right' }}>
                    <div>{state.balance.erg.toFixed(2)} ERG</div>
                </div>
                {
                    state.walletName !== 'burner' && (
                        <button
                            onClick={disconnect}
                            className="btn"
                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem' }}
                        >
                            Disconnect
                        </button>
                    )
                }
            </div >
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
                {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
            </button>
            {error && (
                <span style={{ color: '#ef4444', fontSize: '0.6875rem' }}>{error}</span>
            )}
        </div>
    )
}
