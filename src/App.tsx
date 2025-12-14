import { useState } from 'react'
import { HUDLayout } from './components/HUDLayout'
import { LandingPage } from './components/LandingPage'
import { ClientView } from './components/ClientView'
import { WorkerView } from './components/WorkerView'
import { ContractMonitor } from './components/ContractMonitor' // Add Monitor
import { ReputationProvider, useReputation } from './context/ReputationContext'
import { EscrowProvider } from './context/EscrowContext'
import { WalletProvider } from './context/WalletContext'

type Role = 'client' | 'worker-alice' | 'worker-bob'

function Dashboard() {
    const [role, setRole] = useState<Role>('client')
    const { resetToDefaults } = useReputation()

    return (
        <div>
            {/* Role Toggle */}
            <div style={{ marginBottom: '2rem' }}>
                <div className="label" style={{ marginBottom: '0.5rem' }}>VIEW AS</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setRole('client')}
                        className="btn"
                        style={{
                            background: role === 'client' ? '#1a1a1a' : 'transparent',
                            borderColor: role === 'client' ? '#fff' : '#333',
                            color: role === 'client' ? '#fff' : '#666',
                        }}
                    >
                        👔 CLIENT
                    </button>
                    <button
                        onClick={() => setRole('worker-alice')}
                        className="btn"
                        style={{
                            background: role === 'worker-alice' ? '#1a1a1a' : 'transparent',
                            borderColor: role === 'worker-alice' ? '#10b981' : '#333',
                            color: role === 'worker-alice' ? '#10b981' : '#666',
                        }}
                    >
                        🔧 ALICE (EXPERT)
                    </button>
                    <button
                        onClick={() => setRole('worker-bob')}
                        className="btn"
                        style={{
                            background: role === 'worker-bob' ? '#1a1a1a' : 'transparent',
                            borderColor: role === 'worker-bob' ? '#f59e0b' : '#333',
                            color: role === 'worker-bob' ? '#f59e0b' : '#666',
                        }}
                    >
                        🔧 BOB (NOVICE)
                    </button>
                    <button
                        onClick={resetToDefaults}
                        className="btn"
                        style={{ marginLeft: 'auto', borderColor: '#ef4444', color: '#ef4444' }}
                    >
                        RESET
                    </button>
                </div>
            </div>

            {/* View Content */}
            {role === 'client' && <ClientView />}
            {role === 'worker-alice' && <WorkerView workerId="alice" />}
            {role === 'worker-bob' && <WorkerView workerId="bob" />}

            {/* Floating Monitor for Unlock Claims */}
            <ContractMonitor />
        </div>
    )
}

function App() {
    const [view, setView] = useState<'landing' | 'app'>('landing')

    return (
        <WalletProvider>
            <ReputationProvider>
                <EscrowProvider>
                    {view === 'landing' ? (
                        <LandingPage onEnterApp={() => setView('app')} />
                    ) : (
                        <HUDLayout>
                            <Dashboard />
                        </HUDLayout>
                    )}
                </EscrowProvider>
            </ReputationProvider>
        </WalletProvider>
    )
}

export default App
