import { WorkerProfile, getReputationBreakdown, useReputation } from '../context/ReputationContext'

interface IdentityCardProps {
    worker: WorkerProfile
    expanded?: boolean
}

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

export function IdentityCard({ worker, expanded = false }: IdentityCardProps) {
    const rep = getReputationBreakdown(worker)
    const { addStake } = useReputation()

    return (
        <div className="card" style={{ borderColor: colorBorders[rep.color] }}>
            {/* Header: Name + Score */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1rem' }}>{worker.name}</strong>
                    <div style={{ fontSize: '0.6875rem', color: '#888', marginTop: '0.25rem' }}>
                        {worker.tagline}
                    </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className={colorClasses[rep.color]} style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {rep.score}
                    </div>
                    <div style={{ fontSize: '0.5625rem', color: '#666' }}>SCORE</div>
                </div>
            </div>

            {/* Trust + Tier */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{
                    padding: '0.25rem 0.5rem',
                    background: rep.color === 'green' ? 'rgba(16,185,129,0.1)' : rep.color === 'yellow' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${colorBorders[rep.color]}`,
                    fontSize: '0.625rem'
                }}>
                    <span className={colorClasses[rep.color]}>{rep.trustLabel}</span>
                </div>
                <div style={{ padding: '0.25rem 0.5rem', border: '1px solid #333', fontSize: '0.625rem', color: '#888' }}>
                    {rep.tier} • {rep.unlockTimeMs / 1000}s
                </div>
            </div>

            {/* Location + Member Since */}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.6875rem', color: '#666', marginBottom: '0.75rem' }}>
                <span>{worker.location}</span>
                <span>Member since {worker.memberSince}</span>
            </div>

            {/* Skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {worker.skills.slice(0, expanded ? worker.skills.length : 4).map((skill, i) => (
                    <span
                        key={i}
                        style={{
                            padding: '0.125rem 0.375rem',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            fontSize: '0.625rem',
                            color: '#aaa'
                        }}
                    >
                        {skill}
                    </span>
                ))}
                {!expanded && worker.skills.length > 4 && (
                    <span style={{ fontSize: '0.625rem', color: '#555' }}>+{worker.skills.length - 4}</span>
                )}
            </div>

            {/* Bio (collapsed/expanded) */}
            <div style={{ fontSize: '0.6875rem', color: '#888', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                {expanded ? worker.bio : worker.bio.slice(0, 100) + (worker.bio.length > 100 ? '...' : '')}
            </div>

            {/* Portfolio (only if expanded or small) */}
            {(expanded || worker.portfolio.length <= 2) && worker.portfolio.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.625rem', color: '#555', marginBottom: '0.25rem' }}>PORTFOLIO</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {worker.portfolio.slice(0, expanded ? 5 : 2).map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: '#888' }}>
                                <span>{item.title}</span>
                                {item.amount > 0 && <span style={{ color: '#10b981' }}>${item.amount}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Staking Panel */}
            <div style={{ marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px border #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.625rem', color: '#666' }}>STAKED (DJED)</div>
                        <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#eab308' }}>
                            {worker.r6_stakedNanoErg.toLocaleString()}
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            addStake(worker.id, 500)
                        }}
                        style={{
                            background: '#1a1a1a',
                            border: '1px solid #eab308',
                            color: '#eab308',
                            fontSize: '0.625rem',
                            fontWeight: 'bold',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            borderRadius: '2px'
                        }}
                    >
                        + STAKE 500
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #222', fontSize: '0.625rem' }}>
                <div>
                    <span style={{ color: '#666' }}>Jobs: </span>
                    <span className="text-green">{worker.r4_jobsCompleted}</span>
                </div>
                <div>
                    <span style={{ color: '#666' }}>Disputes: </span>
                    <span className={worker.r5_disputesLost > 0 ? 'text-red' : ''}>{worker.r5_disputesLost}</span>
                </div>
                <div>
                    <span style={{ color: '#666' }}>Earnings: </span>
                    <span>${worker.portfolio.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
