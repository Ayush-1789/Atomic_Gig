import { useState } from 'react'
import { useReputation, getReputationBreakdown } from '../context/ReputationContext'
import { useEscrow } from '../context/EscrowContext'
import { useWallet } from '../context/WalletContext'
import { IdentityCard } from './IdentityCard'

const colorBorders: Record<string, string> = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444'
}

export function ClientView() {
    const { workers } = useReputation()
    const { createGig, contracts, isProcessing, releasePayment, resetContracts } = useEscrow()
    const { state: walletState } = useWallet()

    const [selectedWorker, setSelectedWorker] = useState('alice')
    const [amount, setAmount] = useState(100)

    const handleCreate = async () => {
        await createGig(selectedWorker, amount)
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Client Dashboard</h2>
                <p style={{ color: '#666', fontSize: '0.8125rem' }}>Hire workers with algorithmic trust</p>
            </div>

            {/* Worker Trust Showcase */}
            <div style={{ marginBottom: '2rem' }}>
                <div className="label" style={{ marginBottom: '1rem' }}>AVAILABLE WORKERS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {workers.map(worker => (
                        <IdentityCard key={worker.id} worker={worker} />
                    ))}
                </div>
            </div>

            <div className="card" style={{ borderWidth: '2px', marginBottom: '2rem' }}>
                <div className="label" style={{ marginBottom: '1rem' }}>CREATE NEW GIG</div>

                {/* Worker Selection */}
                <div style={{ marginBottom: '1rem' }}>
                    <div className="label">Select Worker</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {workers.map(worker => {
                            const rep = getReputationBreakdown(worker)
                            return (
                                <button
                                    key={worker.id}
                                    onClick={() => setSelectedWorker(worker.id)}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        background: selectedWorker === worker.id ? '#1a1a1a' : 'transparent',
                                        borderColor: selectedWorker === worker.id ? colorBorders[rep.color] : '#333',
                                        color: selectedWorker === worker.id ? colorBorders[rep.color] : '#666',
                                        padding: '0.75rem',
                                    }}
                                >
                                    <div>{worker.name}</div>
                                    <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                                        {rep.score} pts • {rep.tier} • {rep.unlockTimeMs / 1000}s
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Amount + Action */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ width: '150px' }}>
                        <div className="label">Payment (DJED)</div>
                        <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input" min={1} />
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={isProcessing}
                        className="btn btn-green"
                        style={{ flex: 1, opacity: isProcessing ? 0.7 : 1 }}
                    >
                        {isProcessing ? 'SIGNING TRANSACTION...' : walletState.connected ? 'LOCK PAYMENT' : 'CONNECT WALLET FIRST'}
                    </button>
                </div>
            </div>

            {/* Contracts */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="label">YOUR CONTRACTS ({contracts.length})</div>
                {contracts.length > 0 && (
                    <button
                        onClick={resetContracts}
                        className="btn"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', borderColor: '#f44' }}
                    >
                        RESET
                    </button>
                )}
            </div>
            {contracts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#555' }}>No contracts yet</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {contracts.map(contract => (
                        <div key={contract.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        {contract.workerProfile?.name || 'Worker'}
                                        <span style={{ color: '#555', marginLeft: '0.5rem' }}>
                                            ({(contract.amount || 0.001).toFixed(4)} ERG)
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.6875rem', color: '#555', fontFamily: 'monospace' }}>
                                        TX: {contract.txId?.slice(0, 16)}...
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        padding: '0.25rem 0.5rem',
                                        fontSize: '0.6875rem',
                                        border: '1px solid',
                                        borderColor: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#444',
                                        color: contract.status === 'RELEASED' ? '#10b981' : contract.status === 'PENDING_RELEASE' ? '#f59e0b' : '#666'
                                    }}>
                                        {contract.status === 'LOCKED' && 'LOCKED'}
                                        {contract.status === 'PENDING_RELEASE' && 'RELEASING'}
                                        {contract.status === 'RELEASED' && '✓ PAID'}
                                    </div>
                                </div>
                            </div>
                            {/* Release Button for non-released contracts */}
                            {contract.status !== 'RELEASED' && (
                                <button
                                    onClick={() => releasePayment(contract.id)}
                                    disabled={isProcessing}
                                    className="btn btn-green"
                                    style={{
                                        marginTop: '0.75rem',
                                        width: '100%',
                                        fontSize: '0.75rem',
                                        opacity: isProcessing ? 0.7 : 1
                                    }}
                                >
                                    {isProcessing ? 'RELEASING...' : 'RELEASE PAYMENT'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
