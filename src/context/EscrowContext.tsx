
// Escrow Context for Nautilus Wallet Mode
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useReputation, WorkerProfile } from './ReputationContext'
import { wallet } from '../ergo/wallet'
import { useWallet } from './WalletContext'
import { buildCreateGigTransaction, buildReleasePaymentTransaction } from '../ergo/transactions/builders'
import { compileContract } from '../ergo/contracts/compiler'
import { ERGO_CONFIG } from '../ergo/config'

export type ContractStatus = 'LOCKED' | 'PENDING_RELEASE' | 'RELEASED'
export type Contract = {
    id: string
    txId?: string
    workerId: string
    workerProfile: WorkerProfile
    amount: number
    status: ContractStatus
    createdAt: number
    unlockTime: number
    unlockDuration: number
    boxId?: string // Track the box ID for on-chain reference
}

interface EscrowContextType {
    contracts: Contract[]
    createGig: (workerId: string, amount: number) => Promise<Contract | null>
    deliverWork: (contractId: string) => Promise<void>
    releasePayment: (contractId: string) => Promise<void>
    getTimeRemaining: (contract: Contract) => number
    isProcessing: boolean
    contractAddress: string
    syncFromBlockchain: () => Promise<void>
    resetContracts: () => void
}

const EscrowContext = createContext<EscrowContextType | null>(null)

const STORAGE_KEY = 'atomic_gig_contracts'

export function EscrowProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage
    const [contracts, setContracts] = useState<Contract[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch { return [] }
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const contractAddress = compileContract('mainnet')
    const { getWorker, addStake, incrementJobs, removeStake, getReputationBreakdown } = useReputation()
    const { state: walletState } = useWallet()

    // Persist to localStorage whenever contracts change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts))
    }, [contracts])

    // Reset all contracts (for demo/testing)
    const resetContracts = useCallback(() => {
        setContracts([])
        localStorage.removeItem(STORAGE_KEY)
        console.log('[Escrow] Contracts reset')
    }, [])


    // Scan blockchain for locked boxes
    const syncFromBlockchain = useCallback(async () => {
        try {
            console.log('[Escrow] Syncing from blockchain...')
            const response = await fetch(
                `${ERGO_CONFIG.explorerApiUrl}/boxes/unspent/byAddress/${contractAddress}`
            )
            if (!response.ok) return

            const data = await response.json()
            const boxes = data.items || []

            console.log(`[Escrow] Found ${boxes.length} locked boxes on-chain`)

            // Create contracts for any boxes not already tracked
            const newContracts: Contract[] = boxes.map((box: any) => ({
                id: `chain-${box.boxId}`,
                txId: box.transactionId,
                boxId: box.boxId,
                workerId: 'unknown',
                workerProfile: { id: 'unknown', name: 'From Chain', r4_jobsCompleted: 0, r5_disputesLost: 0, r6_pendingAmount: 0 },
                amount: Number(box.value) / 1e9,
                status: 'LOCKED' as ContractStatus,
                createdAt: box.creationHeight * 120000, // Rough timestamp
                unlockTime: Date.now() + 30000,
                unlockDuration: 30000
            }))

            // Merge with existing, avoiding duplicates
            setContracts(prev => {
                const existingIds = new Set(prev.map(c => c.boxId || c.id))
                const uniqueNew = newContracts.filter(c => c.boxId && !existingIds.has(c.boxId))
                return [...prev, ...uniqueNew]
            })
        } catch (e) {
            console.warn('[Escrow] Blockchain sync failed:', e)
        }
    }, [contractAddress])

    // Auto-sync from blockchain on page load
    useEffect(() => {
        syncFromBlockchain()
    }, [syncFromBlockchain])

    const createGig = useCallback(async (workerId: string, amount: number) => {
        setIsProcessing(true);
        try {
            const worker = getWorker(workerId);
            if (!worker) return null;

            if (!walletState.connected || !walletState.address) {
                throw new Error('Please connect your wallet first');
            }

            console.log('[Escrow] Building Transaction...');

            // Get ALL addresses from wallet (Nautilus has multiple internal addresses)
            const allAddresses = await wallet.getAllAddresses();
            console.log('[Escrow] Wallet addresses:', allAddresses);

            // Build UNSIGNED transaction using ALL addresses for UTXO lookup
            const { transaction, unlockDuration, unlockTimestamp } = await buildCreateGigTransaction(
                allAddresses, // Pass all addresses for UTXO fetching
                walletState.address, // Change address for return
                '9eptLGDz8Lz1H6Z9AzaXbcB33CPnPyJmuFqg3uQnv36tDZ9QcW6', // Worker address
                amount,
                0,
                { jobs: worker.r4_jobsCompleted, pending: worker.r6_stakedNanoErg, disputes: worker.r5_disputesLost }
            );

            console.log('[Escrow] Requesting Nautilus to sign...');
            // SIGN via Nautilus (popup will appear)
            const signedTx = await wallet.signTransaction(transaction);

            console.log('[Escrow] Submitting to Network...');
            // SUBMIT via Nautilus
            const txId = await wallet.submitTransaction(signedTx);
            console.log('[Escrow] Success! TxId:', txId);

            // Add to staked amount for reputation tracking
            addStake(workerId, amount * 10000); // Scale for nanoErg

            const contract: Contract = {
                id: `gig-${Date.now()}`,
                txId,
                workerId,
                workerProfile: { ...worker, r6_stakedNanoErg: worker.r6_stakedNanoErg + (amount * 10000) },
                amount,
                status: 'LOCKED',
                createdAt: Date.now(),
                unlockTime: unlockTimestamp,
                unlockDuration,
            };

            setContracts(prev => [...prev, contract]);
            return contract;
        } catch (e: any) {
            console.error(e);
            alert(`Failed: ${e.message}`);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [getWorker, addStake, walletState, getReputationBreakdown]);

    const deliverWork = async (contractId: string) => {
        setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'PENDING_RELEASE' } : c));
    };

    const releasePayment = async (contractId: string) => {
        const contract = contracts.find(c => c.id === contractId);
        if (!contract || !contract.txId) return;

        if (!walletState.connected || !walletState.address) {
            alert('Please connect your wallet first');
            return;
        }

        setIsProcessing(true);
        try {
            console.log('[Escrow] Building Release Transaction...');

            // Get all wallet addresses
            const allAddresses = await wallet.getAllAddresses();

            // Build release transaction (finds locked box automatically)
            const unsignedTx = await buildReleasePaymentTransaction(
                walletState.address, // Worker receives funds
                allAddresses,        // For fee UTXOs
                walletState.address  // Change address
            );

            console.log('[Escrow] Requesting Nautilus to sign release...');
            const signedTx = await wallet.signTransaction(unsignedTx);

            console.log('[Escrow] Submitting release to network...');
            const txId = await wallet.submitTransaction(signedTx);
            console.log('[Escrow] Release Success! TxId:', txId);

            // Update local state
            removeStake(contract.workerId, contract.amount * 10000); // Scaled for nanoErg
            incrementJobs(contract.workerId);
            setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'RELEASED' } : c));

            alert(`Payment released! TxId: ${txId}`);
        } catch (e: any) {
            console.error('[Escrow] Release failed:', e);
            const errorMsg = e?.message || e?.toString() || JSON.stringify(e);
            alert(`Release failed: ${errorMsg}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const getTimeRemaining = (contract: Contract) => Math.max(0, contract.unlockTime - Date.now());

    return (
        <EscrowContext.Provider value={{ contracts, createGig, deliverWork, releasePayment, getTimeRemaining, isProcessing, contractAddress, syncFromBlockchain, resetContracts }}>
            {children}
        </EscrowContext.Provider>
    )
}

export function useEscrow() {
    const context = useContext(EscrowContext);
    if (!context) throw new Error('useEscrow');
    return context;
}
