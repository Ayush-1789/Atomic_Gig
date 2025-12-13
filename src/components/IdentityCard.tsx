import { WorkerProfile } from '../context/ReputationContext'

interface IdentityCardProps {
    worker: WorkerProfile
}

export function IdentityCard({ worker }: IdentityCardProps) {
    const isExpert = worker.badge === 'EXPERT'

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong>{worker.name}</strong>
                <span className={`tag ${isExpert ? 'tag-green' : 'tag-orange'}`}>
                    {worker.badge}
                </span>
            </div>

            <div className="row">
                <span className="row-label">R4: Jobs Completed</span>
                <span className={`row-value ${isExpert ? 'text-green' : 'text-orange'}`}>
                    {worker.r4_jobsCompleted}
                </span>
            </div>
            <div className="row">
                <span className="row-label">R5: Disputes Lost</span>
                <span className="row-value">{worker.r5_disputesLost}</span>
            </div>
            <div className="row">
                <span className="row-label">R6: Pending Amount</span>
                <span className="row-value">{worker.r6_pendingAmount}</span>
            </div>
            <div className="row">
                <span className="row-label">Unlock Speed</span>
                <span className={`row-value ${isExpert ? 'text-green' : 'text-orange'}`}>
                    {isExpert ? '10 seconds' : '60 seconds'}
                </span>
            </div>
        </div>
    )
}
