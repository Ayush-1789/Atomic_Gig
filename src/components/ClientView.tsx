import { useState } from 'react'
import { useReputation, getUnlockBreakdown } from '../context/ReputationContext'
import { useEscrow } from '../context/EscrowContext'

export function ClientView() {
    const { workers } = useReputation()
    const { createGig, contracts } = useEscrow()
    const [selectedWorker, setSelectedWorker] = useState('alice')
    const [amount, setAmount] = useState(100)

    const selectedProfile = workers.find(w => w.id === selectedWorker)
    const breakdown = selectedProfile ? getUnlockBreakdown(selectedProfile) : null

    // Preview with added pending
    const previewPending = selectedProfile ? selectedProfile.r6_pendingAmount + amount : 0
    const previewBreakdown = selectedProfile ? getUnlockBreakdown({ ...selectedProfile, r6_pendingAmount: previewPending }) : null

    const handleCreate = () => {
        createGig(selectedWorker, amount)
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Client Dashboard</h2>
                <p style={{ color: '#666', fontSize: '0.8125rem' }}>Hire workers and track contracts</p>
            </div>

            <div className="card" style={{ borderWidth: '2px', marginBottom: '2rem' }}>
                <div className="label" style={{ marginBottom: '1rem' }}>CREATE NEW GIG</div>

                {/* Worker Selection */}
                <div style={{ marginBottom: '1rem' }}>
                    <div className="label">Select Worker</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {workers.map(worker => {
                            const wb = getUnlockBreakdown(worker)
                            return (
                                <button
                                    key={worker.id}
                                    onClick={() => setSelectedWorker(worker.id)}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        background: selectedWorker === worker.id ? '#1a1a1a' : 'transparent',
                                        borderColor: selectedWorker === worker.id ? (worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b') : '#333',
                                        color: selectedWorker === worker.id ? (worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b') : '#666',
                                        padding: '0.75rem',
                                    }}
                                >
                                    <div>{worker.name.split('(')[0].trim()}</div>
                                    <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                                        {worker.r4_jobsCompleted} jobs • {wb.finalTime}s • {worker.r6_pendingAmount} pending
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Preview */}
                {selectedProfile && breakdown && previewBreakdown && (
                    <div style={{ padding: '0.75rem', background: '#0a0a0a', marginBottom: '1rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong>{selectedProfile.name}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span>
                                <span style={{ color: '#666' }}>Current:</span>{' '}
                                <span style={{ color: '#10b981' }}>{breakdown.finalTime}s</span>
                            </span>
                            <span>
                                <span style={{ color: '#666' }}>After +{amount} pending:</span>{' '}
                                <span style={{ color: previewBreakdown.finalTime > breakdown.finalTime ? '#f59e0b' : '#10b981' }}>
                                    {previewBreakdown.finalTime}s
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Amount + Action */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ width: '150px' }}>
                        <div className="label">Payment (DJED)</div>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input" min={1} />
                    </div>
                    <button onClick={handleCreate} className="btn btn-green" style={{ flex: 1 }}>
                        LOCK PAYMENT
                    </button>
                </div>
            </div>

            {/* Contracts */}
            <div className="label" style={{ marginBottom: '1rem' }}>YOUR CONTRACTS ({contracts.length})</div>
            {contracts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#555' }}>No contracts yet</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {contracts.map(contract => (
                        <div key={contract.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem' }}>{contract.workerProfile.name}</div>
                                    <div style={{ fontSize: '0.6875rem', color: '#555' }}>{contract.amount} DJED • {contract.unlockDuration / 1000}s unlock</div>
                                </div>
                                <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', border: '1px solid', borderColor: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#444', color: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#666' }}>
                                    {contract.status === 'LOCKED' && 'AWAITING'}
                                    {contract.status === 'PENDING_RELEASE' && 'RELEASING'}
                                    {contract.status === 'RELEASED' && '✓ PAID'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
