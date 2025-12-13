import { useEffect, useState, useCallback } from 'react'
import { Contract, useEscrow } from '../context/EscrowContext'

// ============================================================================
// CONTRACT CARD
// ============================================================================

function ContractCard({ contract }: { contract: Contract }) {
    const { deliverWork, releasePayment, getTimeRemaining } = useEscrow()
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(contract))

    // High-precision countdown (100ms updates)
    useEffect(() => {
        if (contract.status !== 'PENDING_RELEASE') return

        const interval = setInterval(() => {
            const remaining = getTimeRemaining(contract)
            setTimeRemaining(remaining)

            if (remaining <= 0) {
                releasePayment(contract.id)
                clearInterval(interval)
            }
        }, 100)

        return () => clearInterval(interval)
    }, [contract, getTimeRemaining, releasePayment])

    const formatTime = useCallback((ms: number) => {
        const totalSeconds = Math.max(0, ms / 1000)
        const seconds = Math.floor(totalSeconds)
        const centiseconds = Math.floor((totalSeconds - seconds) * 100)
        return `${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`
    }, [])

    const isExpert = contract.workerProfile.r4_jobsCompleted > 10

    // Status badge styles
    const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
        LOCKED: { bg: 'transparent', color: '#666', border: '#444' },
        PENDING_RELEASE: { bg: '#f59e0b15', color: '#f59e0b', border: '#f59e0b' },
        RELEASED: { bg: '#10b98115', color: '#10b981', border: '#10b981' },
    }

    const style = statusStyles[contract.status]

    return (
        <div
            className="card"
            style={{
                borderColor: style.border,
                background: contract.status === 'PENDING_RELEASE' ? '#1a1a1a' : '#141414',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.6875rem', color: '#555', fontFamily: 'monospace' }}>
                        {contract.id}
                    </div>
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {contract.workerProfile.name}
                    </div>
                </div>
                <div
                    style={{
                        padding: '0.25rem 0.75rem',
                        border: `1px solid ${style.border}`,
                        background: style.bg,
                        color: style.color,
                        fontSize: '0.6875rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        animation: contract.status === 'PENDING_RELEASE' ? 'pulse 1s infinite' : 'none',
                    }}
                >
                    {contract.status.replace('_', ' ')}
                </div>
            </div>

            {/* Amount */}
            <div className="row">
                <span className="row-label">Locked Amount</span>
                <span className="row-value">{contract.amount} DJED</span>
            </div>

            {/* Timer / Action */}
            <div style={{ marginTop: '1rem' }}>
                {contract.status === 'LOCKED' && (
                    <button
                        onClick={() => deliverWork(contract.id)}
                        className="btn"
                        style={{
                            width: '100%',
                            borderColor: '#666',
                            color: '#ccc',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#10b981'
                            e.currentTarget.style.color = '#10b981'
                            e.currentTarget.style.background = '#10b98110'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#666'
                            e.currentTarget.style.color = '#ccc'
                            e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        [ TRANSMIT WORK HASH ]
                    </button>
                )}

                {contract.status === 'PENDING_RELEASE' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6875rem', color: '#666', marginBottom: '0.5rem' }}>
                            T-MINUS
                        </div>
                        <div
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: isExpert ? '#10b981' : '#f59e0b',
                                letterSpacing: '0.1em',
                            }}
                        >
                            {formatTime(timeRemaining)}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#555', marginTop: '0.5rem' }}>
                            {isExpert ? 'FAST TRACK (EXPERT)' : 'STANDARD LOCK (NOVICE)'}
                        </div>
                    </div>
                )}

                {contract.status === 'RELEASED' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                            ✓
                        </div>
                        <div style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 'bold' }}>
                            PAYMENT RELEASED
                        </div>
                        <div style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {contract.amount} DJED → {contract.workerProfile.name.split(' ')[0]}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// CONTRACT MONITOR
// ============================================================================

export function ContractMonitor() {
    const { contracts } = useEscrow()

    // Sort: pending first, then locked, then released
    const sortedContracts = [...contracts].sort((a, b) => {
        const order = { PENDING_RELEASE: 0, LOCKED: 1, RELEASED: 2 }
        return order[a.status] - order[b.status]
    })

    return (
        <div>
            <div className="label" style={{ marginBottom: '1rem' }}>
                ACTIVE CONTRACTS ({contracts.length})
            </div>

            {contracts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#555', padding: '2rem' }}>
                    No active contracts. Initialize a smart lock above.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {sortedContracts.map(contract => (
                        <ContractCard key={contract.id} contract={contract} />
                    ))}
                </div>
            )}
        </div>
    )
}
