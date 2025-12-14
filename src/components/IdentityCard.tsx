import { WorkerProfile, getReputationBreakdown } from '../context/ReputationContext'

interface IdentityCardProps {
    worker: WorkerProfile
}

// Color class mapping
const colorClasses: Record<string, string> = {
    green: 'text-green',
    yellow: 'text-yellow',
    red: 'text-red'
}

const colorBorders: Record<string, string> = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444'
}

export function IdentityCard({ worker }: IdentityCardProps) {
    const rep = getReputationBreakdown(worker)

    return (
        <div className="card" style={{ borderColor: colorBorders[rep.color] }}>
            {/* Header: Name + Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <strong style={{ fontSize: '1rem' }}>{worker.name}</strong>
                    <div style={{ fontSize: '0.6875rem', color: '#666', marginTop: '0.25rem' }}>
                        {rep.tier} • {rep.unlockTimeMs / 1000}s unlock
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className={colorClasses[rep.color]} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {rep.score}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#666' }}>SCORE</div>
                </div>
            </div>

            {/* Trust Level Badge */}
            <div style={{
                padding: '0.5rem',
                marginBottom: '1rem',
                background: rep.color === 'green' ? 'rgba(16,185,129,0.1)' : rep.color === 'yellow' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${colorBorders[rep.color]}`,
                textAlign: 'center'
            }}>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    ALGORITHMIC TRUST: <strong className={colorClasses[rep.color]}>{rep.trustLabel}</strong>
                </span>
            </div>

            {/* Register Breakdown */}
            <div style={{ fontSize: '0.75rem' }}>
                <div className="row">
                    <span className="row-label">R4: Jobs Completed</span>
                    <span className="row-value text-green">
                        {worker.r4_jobsCompleted} <span style={{ color: '#666' }}>(+{rep.jobsBonus} pts)</span>
                    </span>
                </div>
                <div className="row">
                    <span className="row-label">R5: Disputes Lost</span>
                    <span className="row-value text-red">
                        {worker.r5_disputesLost} <span style={{ color: '#666' }}>(-{rep.disputePenalty} pts)</span>
                    </span>
                </div>
                <div className="row">
                    <span className="row-label">R6: Staked (nanoErg)</span>
                    <span className="row-value">
                        {worker.r6_stakedNanoErg.toLocaleString()} <span style={{ color: '#666' }}>(+{rep.stakedBonus} pts)</span>
                    </span>
                </div>
            </div>

            {/* Score Formula */}
            <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                background: '#111',
                fontSize: '0.625rem',
                color: '#666',
                fontFamily: 'monospace'
            }}>
                Score = (R4×15) - (Disputes) + (R6÷10)
            </div>
        </div>
    )
}
