import { useState, useEffect } from 'react'
import { useReputation, getReputationBreakdown } from '../context/ReputationContext'
import { useEscrow } from '../context/EscrowContext'

const colorClasses: Record<string, string> = {
    green: 'text-green',
    yellow: 'text-yellow',
    red: 'text-red'
}

export function WorkerView({ workerId }: { workerId: string }) {
    const { workers } = useReputation()
    const { contracts, deliverWork, getTimeRemaining, isProcessing } = useEscrow()

    const worker = workers.find(w => w.id === workerId)
    if (!worker) return null

    const rep = getReputationBreakdown(worker)
    const myContracts = contracts.filter(c => c.workerId === workerId)

    // Timer sync
    const [, setNow] = useState(Date.now())
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100)
        return () => clearInterval(timer)
    }, [])

    return (
        <div>
            {/* Profile Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{worker.name}</h2>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: '#666' }}>
                        <span>Score: <span className={colorClasses[rep.color]}>{rep.score}</span></span>
                        <span>{rep.tier}</span>
                        <span>Unlock: <span className={colorClasses[rep.color]}>{rep.unlockTimeMs / 1000}s</span></span>
                    </div>
                </div>
                <div style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid',
                    borderColor: rep.color === 'green' ? '#10b981' : rep.color === 'yellow' ? '#f59e0b' : '#ef4444',
                    fontSize: '0.75rem'
                }}>
                    <span className={colorClasses[rep.color]}>TRUST: {rep.trustLabel}</span>
                </div>
            </div>

            {/* Contract List */}
            <div className="label" style={{ marginBottom: '1rem' }}>ACTIVE GIGS</div>
            {myContracts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#555' }}>No active gigs</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {myContracts.map(contract => {
                        const timeLeft = getTimeRemaining(contract)

                        return (
                            <div key={contract.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div className="label">GIG #{contract.id.slice(-4)}</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#888' }}>
                                        {contract.amount} DJED
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                                        Contract: {contract.txId?.slice(0, 20)}...
                                    </div>
                                </div>

                                {contract.status === 'LOCKED' && (
                                    <button
                                        onClick={() => deliverWork(contract.id)}
                                        disabled={isProcessing}
                                        className="btn btn-green"
                                        style={{ width: '100%', opacity: isProcessing ? 0.7 : 1 }}
                                    >
                                        {isProcessing ? 'SUBMITTING...' : 'SUBMIT WORK (Start Unlock Timer)'}
                                    </button>
                                )}

                                {contract.status === 'PENDING_RELEASE' && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', color: timeLeft > 0 ? '#f59e0b' : '#10b981' }}>
                                            {(timeLeft / 1000).toFixed(1)}s
                                        </div>
                                        <div style={{ fontSize: '0.6875rem', color: '#666' }}>UNLOCKING FUNDS</div>
                                    </div>
                                )}

                                {contract.status === 'RELEASED' && (
                                    <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                                        ✓ FUNDS RELEASED
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
