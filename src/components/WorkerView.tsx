import { useEffect, useState } from 'react'
import { useReputation, getUnlockBreakdown } from '../context/ReputationContext'
import { useEscrow, Contract } from '../context/EscrowContext'

function WorkerContractCard({ contract }: { contract: Contract }) {
    const { deliverWork, releasePayment, getTimeRemaining } = useEscrow()
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(contract))

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

    const formatTime = (ms: number) => {
        const s = Math.floor(Math.max(0, ms / 1000))
        const cs = Math.floor((Math.max(0, ms / 1000) - s) * 100)
        return `${s.toString().padStart(2, '0')}:${cs.toString().padStart(2, '0')}`
    }

    return (
        <div className="card" style={{ borderColor: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.6875rem', color: '#555', fontFamily: 'monospace' }}>{contract.id}</div>
                    <div style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{contract.amount} DJED</div>
                </div>
                <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', border: '1px solid', borderColor: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#444', color: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#666' }}>
                    {contract.status.replace('_', ' ')}
                </div>
            </div>

            {contract.status === 'LOCKED' && (
                <button onClick={() => deliverWork(contract.id)} className="btn" style={{ width: '100%', borderColor: '#10b981', color: '#10b981' }}>
                    SUBMIT COMPLETED WORK
                </button>
            )}

            {contract.status === 'PENDING_RELEASE' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6875rem', color: '#666', marginBottom: '0.5rem' }}>UNLOCKING IN</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{formatTime(timeRemaining)}</div>
                </div>
            )}

            {contract.status === 'RELEASED' && (
                <div style={{ textAlign: 'center', color: '#10b981' }}>
                    <div style={{ fontSize: '1.5rem' }}>✓</div>
                    <div style={{ fontWeight: 'bold' }}>PAYMENT RECEIVED</div>
                </div>
            )}
        </div>
    )
}

export function WorkerView({ workerId }: { workerId: string }) {
    const { workers } = useReputation()
    const { contracts } = useEscrow()

    const worker = workers.find(w => w.id === workerId)
    if (!worker) return <div>Worker not found</div>

    const breakdown = getUnlockBreakdown(worker)
    const myContracts = contracts.filter(c => c.workerId === workerId)
    const completed = myContracts.filter(c => c.status === 'RELEASED')
    const totalEarned = completed.reduce((sum, c) => sum + c.amount, 0)

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Worker Dashboard</h2>
                <p style={{ color: '#666', fontSize: '0.8125rem' }}>Complete work and get paid</p>
            </div>

            {/* Profile */}
            <div className="card" style={{ marginBottom: '1rem', borderColor: worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{worker.name}</div>
                        <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.6875rem', border: '1px solid', borderColor: worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b', color: worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b' }}>
                            {worker.badge}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.6875rem', color: '#666' }}>CURRENT UNLOCK</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: breakdown.finalTime <= 15 ? '#10b981' : breakdown.finalTime <= 30 ? '#f59e0b' : '#ef4444' }}>
                            {breakdown.finalTime}s
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #222' }}>
                    <div>
                        <div style={{ fontSize: '0.6875rem', color: '#10b981' }}>R4: JOBS ↓</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{worker.r4_jobsCompleted}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6875rem', color: '#ef4444' }}>R5: DISPUTES ↑</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{worker.r5_disputesLost}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6875rem', color: '#f59e0b' }}>R6: PENDING ↑</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{worker.r6_pendingAmount}</div>
                    </div>
                </div>
            </div>

            {/* Formula */}
            <div className="card" style={{ marginBottom: '1rem', background: '#0a0a0a' }}>
                <div className="label" style={{ marginBottom: '0.75rem' }}>UNLOCK TIME FORMULA</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8125rem', lineHeight: 1.8 }}>
                    <div><span style={{ color: '#666' }}>Base time:</span> {breakdown.baseTime}s</div>
                    <div><span style={{ color: '#10b981' }}>- Jobs ({worker.r4_jobsCompleted}, max 25):</span> -{breakdown.jobsReduction}s <span style={{ color: '#555' }}>(trust)</span></div>
                    <div><span style={{ color: '#f59e0b' }}>+ Pending ({worker.r6_pendingAmount} ÷ 100):</span> +{breakdown.pendingPenalty}s <span style={{ color: '#555' }}>(risk)</span></div>
                    <div><span style={{ color: '#ef4444' }}>+ Disputes ({worker.r5_disputesLost} × 10):</span> +{breakdown.disputePenalty}s <span style={{ color: '#555' }}>(risk)</span></div>
                    <div style={{ borderTop: '1px solid #333', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>= {breakdown.finalTime}s</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{myContracts.length}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#666' }}>TOTAL GIGS</div>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{totalEarned}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#666' }}>DJED EARNED</div>
                </div>
            </div>

            {/* Gigs */}
            <div className="label" style={{ marginBottom: '1rem' }}>YOUR GIGS ({myContracts.length})</div>
            {myContracts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#555' }}>No gigs yet</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {myContracts.map(c => <WorkerContractCard key={c.id} contract={c} />)}
                </div>
            )}
        </div>
    )
}
