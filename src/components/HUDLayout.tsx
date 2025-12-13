import { WalletButton } from './WalletButton'

export function HUDLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <header style={{
                borderBottom: '1px solid #222',
                padding: '0.75rem 1rem',
                background: '#0a0a0a',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <strong style={{ fontSize: '0.875rem' }}>ATOMIC-GIG</strong>
                        <span style={{ color: '#666', marginLeft: '0.5rem', fontSize: '0.6875rem' }}>
                            Reputation Escrow on Ergo
                        </span>
                    </div>
                    <WalletButton />
                </div>
            </header>

            <main className="container">
                {children}
            </main>
        </div>
    )
}
