import { useState } from 'react'
import { useReputation } from '../context/ReputationContext'
import { useEscrow } from '../context/EscrowContext'
import { IdentityCard } from './IdentityCard'
import { EscrowVault } from './EscrowVault'

export function DemoDashboard() {
    const { getWorker } = useReputation()
    const { createGig, contracts } = useEscrow()
    const [amount, setAmount] = useState(100)

    const alice = getWorker('alice')!
    const bob = getWorker('bob')!

    const aliceContracts = contracts.filter(c => c.workerId === 'alice')
    const bobContracts = contracts.filter(c => c.workerId === 'bob')

    const handleCreateGigs = () => {
        createGig('alice', amount)
        createGig('bob', amount)
    }

    return (
        <div>
            {/* Title */}
            <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Reputation Demo</h1>
            <p className="text-gray mb-2">See how reputation affects unlock times</p>

            {/* Controls */}
            <div className="card mb-2">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                        <div className="label">Amount (DJED)</div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="input"
                        />
                    </div>
                    <button onClick={handleCreateGigs} className="btn btn-green">
                        Create Gigs for Both
                    </button>
                </div>
                <div className="mt-2 text-gray" style={{ fontSize: '0.75rem' }}>
                    <span className="text-green">Expert (&gt;10 jobs): 10s</span> • <span className="text-orange">Novice (≤10 jobs): 60s</span>
                </div>
            </div>

            {/* Side by side comparison */}
            <div className="grid-2">
                {/* Alice - Expert */}
                <div>
                    <h2 className="text-green mb-1" style={{ fontSize: '0.875rem' }}>
                        {alice.name} — {alice.badge}
                    </h2>
                    <IdentityCard worker={alice} />

                    {aliceContracts.length === 0 ? (
                        <div className="card text-center text-gray">No contracts yet</div>
                    ) : (
                        aliceContracts.map(c => <EscrowVault key={c.id} contract={c} />)
                    )}
                </div>

                {/* Bob - Novice */}
                <div>
                    <h2 className="text-orange mb-1" style={{ fontSize: '0.875rem' }}>
                        {bob.name} — {bob.badge}
                    </h2>
                    <IdentityCard worker={bob} />

                    {bobContracts.length === 0 ? (
                        <div className="card text-center text-gray">No contracts yet</div>
                    ) : (
                        bobContracts.map(c => <EscrowVault key={c.id} contract={c} />)
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="card mt-2" style={{ borderColor: '#333' }}>
                <div className="label">How to use</div>
                <ol style={{ paddingLeft: '1.25rem', color: '#888', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                    <li>Click "Create Gigs for Both"</li>
                    <li>Click "Deliver Work" on each card</li>
                    <li>Watch: Expert (Alice) unlocks in 10s, Novice (Bob) waits 60s</li>
                </ol>
            </div>
        </div>
    )
}
