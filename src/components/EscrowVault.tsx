import { useEffect, useState, useCallback } from 'react'
import { Contract, useEscrow } from '../context/EscrowContext'

interface EscrowVaultProps {
    contract: Contract
}

export function EscrowVault({ contract }: EscrowVaultProps) {
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

    const formatTime = useCallback((ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }, [])

    const isExpert = contract.workerProfile.r4_jobsCompleted > 10

    return (
        <div className="card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="text-gray" style={{ fontSize: '0.75rem' }}>
                    {contract.id.slice(0, 20)}...
                </span>
                <span className={`tag ${contract.status === 'RELEASED' ? 'tag-green' : 'tag-gray'}`}>
                    {contract.status.replace('_', ' ')}
                </span>
            </div>

            {/* Amount */}
            <div className="row">
                <span className="row-label">Amount</span>
                <span className="row-value">{contract.amount} DJED</span>
            </div>
            <div className="row">
                <span className="row-label">Worker</span>
                <span className="row-value">{contract.workerProfile.name}</span>
            </div>

            {/* Timer / Actions */}
            <div className="mt-2">
                {contract.status === 'LOCKED' && (
                    <button onClick={() => deliverWork(contract.id)} className="btn" style={{ width: '100%' }}>
                        Deliver Work
                    </button>
                )}

                {contract.status === 'PENDING_RELEASE' && (
                    <div className="text-center">
                        <div className="label">Time Remaining</div>
                        <div className={`timer ${isExpert ? 'timer-fast' : 'timer-slow'}`}>
                            {formatTime(timeRemaining)}
                        </div>
                    </div>
                )}

                {contract.status === 'RELEASED' && (
                    <div className="text-center timer-done" style={{ padding: '1rem 0' }}>
                        ✓ Payment Released
                    </div>
                )}
            </div>
        </div>
    )
}
