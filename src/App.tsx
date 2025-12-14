import { useState } from 'react'
import { HUDLayout } from './components/HUDLayout'
import { LandingPage } from './components/LandingPage'
import { ClientView } from './components/ClientView'
import { WorkerView } from './components/WorkerView'
import { ContractMonitor } from './components/ContractMonitor'
import { ReputationProvider, useReputation, getReputationBreakdown } from './context/ReputationContext'
import { EscrowProvider } from './context/EscrowContext'
import { WalletProvider } from './context/WalletContext'

type ViewMode = 'client' | 'worker'

function Dashboard() {
    const [viewMode, setViewMode] = useState<ViewMode>('client')
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>('alice')
    const { workers, resetToDefaults } = useReputation()

    const currentRole = viewMode === 'client' ? 'client' : `worker-${selectedWorkerId}`

    return (
        <div>
            {/* Mode Switcher - Clean Tab Style */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #222'
            }}>
                {/* View Mode Tabs */}
                <div style={{ display: 'flex', background: '#111', borderRadius: '6px', padding: '3px' }}>
                    <button
                        onClick={() => setViewMode('client')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            border: 'none',
                            borderRadius: '4px',
                            background: viewMode === 'client' ? '#fff' : 'transparent',
                            color: viewMode === 'client' ? '#000' : '#666',
                            fontWeight: viewMode === 'client' ? 600 : 400,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Client
                    </button>
                    <button
                        onClick={() => setViewMode('worker')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            border: 'none',
                            borderRadius: '4px',
                            background: viewMode === 'worker' ? '#10b981' : 'transparent',
                            color: viewMode === 'worker' ? '#000' : '#666',
                            fontWeight: viewMode === 'worker' ? 600 : 400,
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Freelancer
                    </button>
                </div>

                {/* Worker Selector (only when in worker mode) */}
                {viewMode === 'worker' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>as</span>
                        <select
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                background: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '0.8125rem',
                                cursor: 'pointer'
                            }}
                        >
                            {workers.map(worker => {
                                const rep = getReputationBreakdown(worker)
                                return (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.name} ({rep.score} pts)
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Reset Button */}
                <button
                    onClick={resetToDefaults}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#666',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ef4444'
                        e.currentTarget.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#333'
                        e.currentTarget.style.color = '#666'
                    }}
                >
                    Reset Demo
                </button>
            </div>

            {/* Current View Indicator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.6875rem',
                color: '#555'
            }}>
                <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: viewMode === 'client' ? '#fff' : '#10b981'
                }} />
                Viewing as {viewMode === 'client' ? 'Client (Employer)' : `${workers.find(w => w.id === selectedWorkerId)?.name || 'Worker'} (Freelancer)`}
            </div>

            {/* Main Content */}
            {viewMode === 'client' && <ClientView />}
            {viewMode === 'worker' && <WorkerView workerId={selectedWorkerId} />}

            {/* Floating Monitor */}
            <ContractMonitor currentRole={currentRole} />
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
