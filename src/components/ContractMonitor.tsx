import { useState, useEffect } from 'react'
import { useEscrow } from '../context/EscrowContext'

export function ContractMonitor() {
    const { contracts, releasePayment, getTimeRemaining } = useEscrow()
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100)
        return () => clearInterval(timer)
    }, [])

    const pendingContracts = contracts.filter(c => c.status === 'PENDING_RELEASE')

    if (pendingContracts.length === 0) return null

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '300px' }}>
            {pendingContracts.map(contract => {
                const timeLeft = getTimeRemaining(contract)
                const canRelease = timeLeft <= 0

                return (
                    <div key={contract.id} className="card" style={{ background: '#111', borderColor: '#333', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="label">UNLOCKING</span>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                {(timeLeft / 1000).toFixed(1)}s
                            </span>
                        </div>
                        {canRelease && (
                            <button
                                onClick={() => releasePayment(contract.id)}
                                className="btn btn-green"
                                style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}
                            >
                                CLAIM PAYMENT
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
