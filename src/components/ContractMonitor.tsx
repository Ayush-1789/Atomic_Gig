import { useState, useEffect } from 'react'
import { useEscrow } from '../context/EscrowContext'

interface ContractMonitorProps {
    currentRole: string
}

export function ContractMonitor({ currentRole }: ContractMonitorProps) {
    const { contracts, releasePayment, raiseDispute, resolveDispute, getTimeRemaining } = useEscrow()
    const [, setNow] = useState(Date.now())

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100)
        return () => clearInterval(timer)
    }, [])

    // Determine current context
    const isClient = currentRole === 'client'
    const currentWorkerId = currentRole.startsWith('worker-') ? currentRole.replace('worker-', '') : null

    // Show contracts that need attention: PENDING_RELEASE or DISPUTED
    const activeContracts = contracts.filter(c =>
        c.status === 'PENDING_RELEASE' || c.status === 'DISPUTED'
    )

    // Filter to only show relevant contracts based on role
    const relevantContracts = activeContracts.filter(c => {
        if (isClient) return true // Client sees all their contracts
        return c.workerId === currentWorkerId // Worker only sees their own
    })

    if (relevantContracts.length === 0) return null

    const handleRaiseDispute = (contractId: string) => {
        const reason = prompt('Enter dispute reason:')
        if (reason) {
            raiseDispute(contractId, reason)
        }
    }

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '320px', zIndex: 100 }}>
            {relevantContracts.map(contract => {
                const timeLeft = getTimeRemaining(contract)
                const canRelease = timeLeft <= 0
                const isDisputed = contract.status === 'DISPUTED'
                const isMyContract = contract.workerId === currentWorkerId

                return (
                    <div
                        key={contract.id}
                        className="card"
                        style={{
                            background: '#111',
                            borderColor: isDisputed ? '#ef4444' : '#333',
                            borderWidth: isDisputed ? '2px' : '1px',
                            marginBottom: '0.5rem'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="label" style={{ color: isDisputed ? '#ef4444' : undefined }}>
                                {isDisputed ? 'DISPUTED' : 'UNLOCKING'}
                            </span>
                            {!isDisputed && (
                                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                    {(timeLeft / 1000).toFixed(1)}s
                                </span>
                            )}
                        </div>

                        {/* Contract Info */}
                        <div style={{ fontSize: '0.6875rem', color: '#888', marginBottom: '0.5rem' }}>
                            Worker: {contract.workerProfile?.name || contract.workerId}
                        </div>

                        {/* DISPUTED state - Protocol Halt */}
                        {isDisputed && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div
                                    style={{
                                        padding: '0.5rem',
                                        background: 'rgba(239,68,68,0.1)',
                                        border: '1px solid #ef4444',
                                        textAlign: 'center',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                        PROTOCOL HALT: DISPUTE ACTIVE
                                    </div>
                                </div>
                                {contract.disputeReason && (
                                    <div style={{ fontSize: '0.6875rem', color: '#888', fontStyle: 'italic' }}>
                                        Reason: {contract.disputeReason}
                                    </div>
                                )}

                                {/* Admin Resolution Buttons - visible to all for demo */}
                                <div style={{ marginTop: '0.75rem', fontSize: '0.6875rem', color: '#666', marginBottom: '0.5rem' }}>
                                    ADMIN RESOLUTION:
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => resolveDispute(contract.id, 'WORKER')}
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            fontSize: '0.6875rem',
                                            padding: '0.5rem',
                                            borderColor: '#10b981',
                                            color: '#10b981'
                                        }}
                                    >
                                        FORCE RELEASE
                                    </button>
                                    <button
                                        onClick={() => resolveDispute(contract.id, 'CLIENT')}
                                        className="btn"
                                        style={{
                                            flex: 1,
                                            fontSize: '0.6875rem',
                                            padding: '0.5rem',
                                            borderColor: '#ef4444',
                                            color: '#ef4444'
                                        }}
                                    >
                                        FORCE REFUND
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PENDING_RELEASE state */}
                        {!isDisputed && (
                            <>
                                {/* Claim Payment - only for the worker whose gig it is */}
                                {canRelease && isMyContract && (
                                    <button
                                        onClick={() => releasePayment(contract.id)}
                                        className="btn btn-green"
                                        style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', marginBottom: '0.5rem' }}
                                    >
                                        CLAIM PAYMENT
                                    </button>
                                )}

                                {/* Report Issue - only for client */}
                                {isClient && (
                                    <button
                                        onClick={() => handleRaiseDispute(contract.id)}
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            fontSize: '0.6875rem',
                                            padding: '0.4rem',
                                            borderColor: '#f59e0b',
                                            color: '#f59e0b'
                                        }}
                                    >
                                        REPORT ISSUE
                                    </button>
                                )}

                                {/* Worker waiting message if not their gig */}
                                {!isClient && !isMyContract && (
                                    <div style={{ fontSize: '0.6875rem', color: '#666', textAlign: 'center' }}>
                                        (Not your gig)
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
