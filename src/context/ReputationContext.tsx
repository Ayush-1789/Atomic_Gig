import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type WorkerProfile = {
    id: string
    name: string
    r4_jobsCompleted: number    // More jobs = FASTER unlock
    r5_disputesLost: number     // More disputes = SLOWER unlock
    r6_pendingAmount: number    // Pending payments = SLOWER unlock (risk exposure)
    badge: 'NOVICE' | 'EXPERT'
}

// ============================================================================
// FORMULA
// Jobs reduce time (trust), Pending/Disputes increase time (risk)
// ============================================================================

export function calculateUnlockTime(worker: WorkerProfile): number {
    const BASE_TIME = 30  // Base 30 seconds
    const MIN_TIME = 5
    const MAX_TIME = 120

    // REDUCES time (trust factors)
    const jobsReduction = Math.min(worker.r4_jobsCompleted, 25)  // -1s per job, max -25s

    // INCREASES time (risk factors)
    const pendingPenalty = Math.min(Math.floor(worker.r6_pendingAmount / 100), 30)  // +1s per 100 DJED pending, max +30s
    const disputePenalty = worker.r5_disputesLost * 10  // +10s per dispute

    const unlockTime = Math.min(MAX_TIME, Math.max(MIN_TIME, BASE_TIME - jobsReduction + pendingPenalty + disputePenalty))

    return unlockTime * 1000
}

export function getUnlockBreakdown(worker: WorkerProfile) {
    const BASE_TIME = 30
    const jobsReduction = Math.min(worker.r4_jobsCompleted, 25)
    const pendingPenalty = Math.min(Math.floor(worker.r6_pendingAmount / 100), 30)
    const disputePenalty = worker.r5_disputesLost * 10
    const finalTime = Math.min(120, Math.max(5, BASE_TIME - jobsReduction + pendingPenalty + disputePenalty))

    return { baseTime: BASE_TIME, jobsReduction, pendingPenalty, disputePenalty, finalTime }
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_WORKERS: WorkerProfile[] = [
    {
        id: 'alice',
        name: 'Alice (The Pro)',
        r4_jobsCompleted: 58,
        r5_disputesLost: 0,
        r6_pendingAmount: 0,  // No pending = fast unlock
        badge: 'EXPERT',
    },
    {
        id: 'bob',
        name: 'Bob (The Newbie)',
        r4_jobsCompleted: 2,
        r5_disputesLost: 0,
        r6_pendingAmount: 0,
        badge: 'NOVICE',
    },
]

const STORAGE_KEY = 'atomic-gig-workers-v2'

// ============================================================================
// CONTEXT
// ============================================================================

interface ReputationContextType {
    workers: WorkerProfile[]
    getWorker: (id: string) => WorkerProfile | undefined
    getAllWorkers: () => WorkerProfile[]
    incrementJobs: (id: string) => void
    addPending: (id: string, amount: number) => void
    removePending: (id: string, amount: number) => void
    resetToDefaults: () => void
    calculateUnlockTime: (worker: WorkerProfile) => number
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
    const getAllWorkers = () => workers

    const incrementJobs = useCallback((id: string) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            const newJobs = w.r4_jobsCompleted + 1
            return { ...w, r4_jobsCompleted: newJobs, badge: newJobs > 10 ? 'EXPERT' : 'NOVICE' }
        }))
    }, [])

    // Add to pending when gig is created
    const addPending = useCallback((id: string, amount: number) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            const newPending = w.r6_pendingAmount + amount
            console.log(`[Reputation] ${w.name}: Pending ${w.r6_pendingAmount} → ${newPending}`)
            return { ...w, r6_pendingAmount: newPending }
        }))
    }, [])

    // Remove from pending when gig is released
    const removePending = useCallback((id: string, amount: number) => {
        setWorkers(prev => prev.map(w => {
            if (w.id !== id) return w
            const newPending = Math.max(0, w.r6_pendingAmount - amount)
            console.log(`[Reputation] ${w.name}: Pending ${w.r6_pendingAmount} → ${newPending}`)
            return { ...w, r6_pendingAmount: newPending }
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
            getAllWorkers,
            incrementJobs,
            addPending,
            removePending,
            resetToDefaults,
            calculateUnlockTime,
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
