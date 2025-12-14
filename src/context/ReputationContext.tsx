import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// ============================================================================
// TRINITY REPUTATION MODEL
// Score = (R4 * 15) - (R5 * 100) + (R6 / 10)
// ============================================================================

export type DisputeRecord = {
    date: number  // timestamp
    amount: number
}

export type TrustTier = 'Tier 1' | 'Tier 2' | 'Probation'
export type TrustColor = 'green' | 'yellow' | 'red'

export type PortfolioItem = {
    title: string
    client: string
    amount: number
}

export type WorkerProfile = {
    id: string
    name: string
    tagline: string
    bio: string
    skills: string[]
    location: string
    memberSince: string
    portfolio: PortfolioItem[]
    // On-chain registers (R4, R5, R6)
    r4_jobsCompleted: number
    r5_disputesLost: number
    r6_stakedNanoErg: number
    // Dispute history for time-weighted penalties
    disputeHistory: DisputeRecord[]
}


// ============================================================================
// SCORE CALCULATION
// ============================================================================

// Time-weighted dispute penalty
export function getDisputePenalty(disputeTimestamp: number): number {
    const now = Date.now()
    const daysSince = (now - disputeTimestamp) / (1000 * 60 * 60 * 24)

    if (daysSince < 30) return 100        // Recent: Full penalty
    if (daysSince < 90) return 50         // Medium: Half penalty
    if (daysSince < 365) return 20        // Old: Small penalty
    return 0                               // Ancient: Expunged
}

export function calculateTotalDisputePenalty(history: DisputeRecord[]): number {
    return history.reduce((sum, d) => sum + getDisputePenalty(d.date), 0)
}

// Main score calculation: (R4 * 15) - (Time-weighted disputes) + (R6 / 10)
export function calculateScore(worker: WorkerProfile): number {
    const jobsBonus = worker.r4_jobsCompleted * 15
    const disputePenalty = calculateTotalDisputePenalty(worker.disputeHistory)
    const stakedBonus = Math.floor(worker.r6_stakedNanoErg / 10)  // Each 10 nanoErg = 1 point

    return jobsBonus - disputePenalty + stakedBonus
}

// ============================================================================
// TRUST TIERS & COLORS
// ============================================================================

export function getTrustTier(score: number): TrustTier {
    if (score > 500) return 'Tier 1'
    if (score > 100) return 'Tier 2'
    return 'Probation'
}

export function getTrustColor(score: number): TrustColor {
    if (score >= 700) return 'green'
    if (score >= 200) return 'yellow'
    return 'red'
}

export function getTrustLabel(score: number): string {
    if (score >= 700) return 'HIGH'
    if (score >= 200) return 'MEDIUM'
    return 'LOW'
}

// Unlock times based on trust tier (in milliseconds)
export function getUnlockTimeMs(score: number): number {
    const tier = getTrustTier(score)
    switch (tier) {
        case 'Tier 1': return 60 * 60 * 1000          // 1 hour
        case 'Tier 2': return 24 * 60 * 60 * 1000     // 24 hours
        case 'Probation': return 14 * 24 * 60 * 60 * 1000  // 14 days
    }
}

// For demo: Shortened unlock times
export function getUnlockTimeMsDemo(score: number): number {
    const tier = getTrustTier(score)
    switch (tier) {
        case 'Tier 1': return 5 * 1000      // 5 seconds
        case 'Tier 2': return 30 * 1000     // 30 seconds
        case 'Probation': return 120 * 1000 // 2 minutes
    }
}

// Full breakdown for UI display
export function getReputationBreakdown(worker: WorkerProfile) {
    const score = calculateScore(worker)
    return {
        score,
        jobsBonus: worker.r4_jobsCompleted * 15,
        disputePenalty: calculateTotalDisputePenalty(worker.disputeHistory),
        stakedBonus: Math.floor(worker.r6_stakedNanoErg / 10),
        tier: getTrustTier(score),
        color: getTrustColor(score),
        trustLabel: getTrustLabel(score),
        unlockTimeMs: getUnlockTimeMsDemo(score)  // Using demo times
    }
}

// ============================================================================
// DEFAULT WORKERS
// ============================================================================

const DEFAULT_WORKERS: WorkerProfile[] = [
    // GREEN - High Trust (Score > 700)
    {
        id: 'alice',
        name: 'Alice Chen',
        tagline: 'Senior Full-Stack Developer & Blockchain Specialist',
        bio: 'Ex-Google engineer with 8+ years of experience building scalable web applications. Specialized in React, Node.js, and smart contract development. I deliver clean, well-documented code on time, every time.',
        skills: ['React', 'TypeScript', 'Solidity', 'Node.js', 'PostgreSQL', 'AWS'],
        location: 'San Francisco, USA',
        memberSince: 'Jan 2022',
        portfolio: [
            { title: 'DEX Trading Platform', client: 'DeFi Startup', amount: 5000 },
            { title: 'NFT Marketplace', client: 'Art Collective', amount: 3500 },
            { title: 'DAO Governance App', client: 'Crypto Fund', amount: 4200 },
        ],
        r4_jobsCompleted: 85,
        r5_disputesLost: 0,
        r6_stakedNanoErg: 0,
        disputeHistory: [],
    },
    // YELLOW - Medium Trust (Score 200-700)
    {
        id: 'bob',
        name: 'Bob Martinez',
        tagline: 'UI/UX Designer & Frontend Developer',
        bio: 'Creative designer with a passion for intuitive interfaces. 3 years of freelance experience. I focus on user-centered design and pixel-perfect implementations. Learning and growing every day!',
        skills: ['Figma', 'React', 'CSS', 'Tailwind', 'Framer Motion'],
        location: 'Austin, TX',
        memberSince: 'Aug 2023',
        portfolio: [
            { title: 'Landing Page Redesign', client: 'E-commerce Brand', amount: 800 },
            { title: 'Mobile App UI Kit', client: 'Fitness Startup', amount: 1200 },
        ],
        r4_jobsCompleted: 25,
        r5_disputesLost: 1,
        r6_stakedNanoErg: 0,
        disputeHistory: [{ date: Date.now() - (20 * 24 * 60 * 60 * 1000), amount: 50 }],
    },
    // RED - Low Trust (Score < 200)
    {
        id: 'charlie',
        name: 'Charlie Kim',
        tagline: 'Junior Web Developer',
        bio: 'Recent bootcamp graduate eager to build my portfolio. Quick learner with strong fundamentals in HTML, CSS, and JavaScript. Looking for opportunities to prove myself!',
        skills: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
        location: 'Seoul, Korea',
        memberSince: 'Nov 2024',
        portfolio: [
            { title: 'Personal Portfolio Site', client: 'Self', amount: 0 },
        ],
        r4_jobsCompleted: 5,
        r5_disputesLost: 0,
        r6_stakedNanoErg: 0,
        disputeHistory: [],
    },
    // GREEN - High Trust with staking bonus
    {
        id: 'diana',
        name: 'Diana Patel',
        tagline: 'Data Scientist & ML Engineer',
        bio: 'PhD in Machine Learning from MIT. 5+ years building predictive models and data pipelines for Fortune 500 companies. I turn complex data into actionable insights.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'AWS SageMaker'],
        location: 'London, UK',
        memberSince: 'Mar 2023',
        portfolio: [
            { title: 'Fraud Detection System', client: 'FinTech Company', amount: 8000 },
            { title: 'Recommendation Engine', client: 'E-commerce Giant', amount: 6500 },
            { title: 'NLP Chatbot', client: 'Healthcare Startup', amount: 4000 },
        ],
        r4_jobsCompleted: 42,
        r5_disputesLost: 0,
        r6_stakedNanoErg: 800,
        disputeHistory: [],
    },
]

const STORAGE_KEY = 'atomic-gig-workers-v4'

// ============================================================================
// CONTEXT
// ============================================================================

interface ReputationContextType {
    workers: WorkerProfile[]
    getWorker: (id: string) => WorkerProfile | undefined
    incrementJobs: (id: string) => void
    addDispute: (id: string, amount: number) => void
    addStake: (id: string, amountNanoErg: number) => void
    removeStake: (id: string, amountNanoErg: number) => void
    resetToDefaults: () => void
    getReputationBreakdown: (worker: WorkerProfile) => ReturnType<typeof getReputationBreakdown>
}

const ReputationContext = createContext<ReputationContextType | null>(null)

export function ReputationProvider({ children }: { children: ReactNode }) {
    const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                return JSON.parse(saved)
            }
        } catch (e) {
            console.error('[Reputation] Load error', e)
        }
        return DEFAULT_WORKERS
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workers))
    }, [workers])

    const getWorker = (id: string) => workers.find(w => w.id === id)

    const incrementJobs = useCallback((id: string) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            console.log(`[Reputation] ${w.name}: Jobs ${w.r4_jobsCompleted} → ${w.r4_jobsCompleted + 1}`)
            return { ...w, r4_jobsCompleted: w.r4_jobsCompleted + 1 }
        }))
    }, [])

    // Add a dispute (e.g., when refund is triggered)
    const addDispute = useCallback((id: string, amount: number) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            const newHistory = [...w.disputeHistory, { date: Date.now(), amount }]
            console.log(`[Reputation] ${w.name}: Dispute added, total: ${newHistory.length}`)
            return {
                ...w,
                r5_disputesLost: w.r5_disputesLost + 1,
                disputeHistory: newHistory
            }
        }))
    }, [])

    // Add stake when escrow is locked
    const addStake = useCallback((id: string, amountNanoErg: number) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            const newStake = w.r6_stakedNanoErg + amountNanoErg
            console.log(`[Reputation] ${w.name}: Stake ${w.r6_stakedNanoErg} → ${newStake}`)
            return { ...w, r6_stakedNanoErg: newStake }
        }))
    }, [])

    // Remove stake when escrow is released
    const removeStake = useCallback((id: string, amountNanoErg: number) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            const newStake = Math.max(0, w.r6_stakedNanoErg - amountNanoErg)
            console.log(`[Reputation] ${w.name}: Stake ${w.r6_stakedNanoErg} → ${newStake}`)
            return { ...w, r6_stakedNanoErg: newStake }
        }))
    }, [])

    const resetToDefaults = useCallback(() => {
        setWorkers(DEFAULT_WORKERS)
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    return (
        <ReputationContext.Provider value={{
            workers,
            getWorker,
            incrementJobs,
            addDispute,
            addStake,
            removeStake,
            resetToDefaults,
            getReputationBreakdown,
        }}>
            {children}
        </ReputationContext.Provider>
    )
}

export function useReputation() {
    const context = useContext(ReputationContext)
    if (!context) {
        throw new Error('useReputation must be used within ReputationProvider')
    }
    return context
}
