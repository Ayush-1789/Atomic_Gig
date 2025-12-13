import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useReputation, WorkerProfile, calculateUnlockTime } from './ReputationContext'

export type ContractStatus = 'LOCKED' | 'PENDING_RELEASE' | 'RELEASED'

export type Contract = {
    id: string
    workerId: string
    workerProfile: WorkerProfile
    amount: number
    status: ContractStatus
    createdAt: number
    unlockTime: number
    unlockDuration: number
}

interface EscrowContextType {
    contracts: Contract[]
    createGig: (workerId: string, amount: number) => Contract | null
    deliverWork: (contractId: string) => void
    releasePayment: (contractId: string) => void
    getTimeRemaining: (contract: Contract) => number
}

const EscrowContext = createContext<EscrowContextType | null>(null)

export function EscrowProvider({ children }: { children: ReactNode }) {
    const [contracts, setContracts] = useState<Contract[]>([])
    const { getWorker, incrementJobs, addPending, removePending } = useReputation()

    const createGig = useCallback((workerId: string, amount: number): Contract | null => {
        const worker = getWorker(workerId)
        if (!worker) return null

        // Add to worker's pending amount (increases their risk exposure)
        addPending(workerId, amount)

        // Get updated worker with new pending
        const updatedWorker = { ...worker, r6_pendingAmount: worker.r6_pendingAmount + amount }
        const unlockDuration = calculateUnlockTime(updatedWorker)

        const contract: Contract = {
            id: `gig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            workerId,
            workerProfile: updatedWorker,
            amount,
            status: 'LOCKED',
            createdAt: Date.now(),
            unlockTime: Date.now() + unlockDuration,
            unlockDuration,
        }

        console.log(`[Escrow] Created gig: ${amount} DJED for ${worker.name}`)
        console.log(`  → New pending: ${updatedWorker.r6_pendingAmount}, Unlock: ${unlockDuration / 1000}s`)

        setContracts(prev => [...prev, contract])
        return contract
    }, [getWorker, addPending])

    const deliverWork = useCallback((contractId: string) => {
        setContracts(prev => prev.map(contract => {
            if (contract.id !== contractId || contract.status !== 'LOCKED') return contract

            const currentWorker = getWorker(contract.workerId)
            const unlockDuration = currentWorker ? calculateUnlockTime(currentWorker) : contract.unlockDuration

            return {
                ...contract,
                status: 'PENDING_RELEASE' as const,
                unlockTime: Date.now() + unlockDuration,
                unlockDuration,
                workerProfile: currentWorker || contract.workerProfile,
            }
        }))
    }, [getWorker])

    const releasePayment = useCallback((contractId: string) => {
        setContracts(prev => prev.map(contract => {
            if (contract.id !== contractId || contract.status !== 'PENDING_RELEASE') return contract

            // Remove from pending and increment jobs
            removePending(contract.workerId, contract.amount)
            incrementJobs(contract.workerId)

            console.log(`[Escrow] Released: ${contract.amount} DJED to ${contract.workerProfile.name}`)

            return { ...contract, status: 'RELEASED' as const }
        }))
    }, [removePending, incrementJobs])

    const getTimeRemaining = useCallback((contract: Contract): number => {
        if (contract.status === 'LOCKED') return contract.unlockDuration
        return Math.max(0, contract.unlockTime - Date.now())
    }, [])

    return (
        <EscrowContext.Provider value={{ contracts, createGig, deliverWork, releasePayment, getTimeRemaining }}>
            {children}
        </EscrowContext.Provider>
    )
}

export function useEscrow() {
    const context = useContext(EscrowContext)
    if (!context) throw new Error('useEscrow must be used within EscrowProvider')
    return context
}
