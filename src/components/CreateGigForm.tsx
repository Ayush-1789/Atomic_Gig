import { useState } from 'react'
import { useReputation } from '../context/ReputationContext'
import { useEscrow } from '../context/EscrowContext'

export function CreateGigForm() {
    const { getAllWorkers } = useReputation()
    const { createGig } = useEscrow()
    const [selectedWorker, setSelectedWorker] = useState('alice')
    const [amount, setAmount] = useState(100)

    const workers = getAllWorkers()

    const handleCreate = () => {
        createGig(selectedWorker, amount)
    }

    const selectedProfile = workers.find(w => w.id === selectedWorker)

    return (
        <div className="card" style={{ borderWidth: '2px' }}>
            <div className="label" style={{ marginBottom: '1rem' }}>
                CONTROL PANEL — INITIALIZE ESCROW
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Worker Selector */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div className="label">Select Worker</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {workers.map(worker => (
                            <button
                                key={worker.id}
                                onClick={() => setSelectedWorker(worker.id)}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: selectedWorker === worker.id ? '#222' : 'transparent',
                                    borderColor: selectedWorker === worker.id
                                        ? (worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b')
                                        : '#333',
                                    color: selectedWorker === worker.id
                                        ? (worker.badge === 'EXPERT' ? '#10b981' : '#f59e0b')
                                        : '#888',
                                }}
                            >
                                {worker.name.split(' ')[0]} ({worker.badge})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Amount Input */}
                <div style={{ width: '120px' }}>
                    <div className="label">Amount (DJED)</div>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="input"
                        min={1}
                    />
                </div>
            </div>

            {/* Selected Worker Info */}
            {selectedProfile && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#0a0a0a', fontSize: '0.75rem' }}>
                    <span className="text-gray">Selected: </span>
                    <span style={{ color: selectedProfile.badge === 'EXPERT' ? '#10b981' : '#f59e0b' }}>
                        {selectedProfile.name}
                    </span>
                    <span className="text-gray"> • {selectedProfile.r4_jobsCompleted} jobs • </span>
                    <span style={{ color: selectedProfile.badge === 'EXPERT' ? '#10b981' : '#f59e0b' }}>
                        {selectedProfile.badge === 'EXPERT' ? '10s unlock' : '60s unlock'}
                    </span>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={handleCreate}
                className="btn btn-green"
                style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                }}
            >
                [ INITIALIZE SMART LOCK ]
            </button>
        </div>
    )
}
