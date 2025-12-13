// Transaction Builders for Atomic-Gig
// Uses Fleet SDK to build Ergo transactions

import {
    TransactionBuilder,
    OutputBuilder,
    SAFE_MIN_BOX_VALUE,
} from '@fleet-sdk/core'
import { ERGO_CONFIG } from '../config'

// Fetch UTXOs from explorer API
async function fetchUtxos(address: string) {
    const response = await fetch(
        `${ERGO_CONFIG.explorerApiUrl}/boxes/unspent/byAddress/${address}`
    )
    if (!response.ok) throw new Error('Failed to fetch UTXOs')
    return response.json()
}

// Calculate unlock time based on reputation
export function calculateUnlockTime(
    jobsCompleted: number,
    pendingAmount: number,
    disputesLost: number
): number {
    const BASE_TIME = 30_000 // 30 seconds
    const MIN_TIME = 5_000   // 5 seconds
    const MAX_TIME = 120_000 // 120 seconds

    // Trust factor: jobs reduce time
    const jobsReduction = Math.min(jobsCompleted, 25) * 1000

    // Risk factors: pending and disputes increase time
    const pendingPenalty = Math.min(Math.floor(pendingAmount / 100), 30) * 1000
    const disputePenalty = disputesLost * 10_000

    return Math.min(MAX_TIME, Math.max(MIN_TIME, BASE_TIME - jobsReduction + pendingPenalty + disputePenalty))
}

// Build a transaction to create an escrow gig
export async function buildCreateGigTransaction(
    clientAddress: string,
    workerAddress: string,
    amount: number, // in DJED-TEST tokens
    workerReputation: { jobs: number; pending: number; disputes: number }
) {
    // Fetch client's UTXOs
    const utxos = await fetchUtxos(clientAddress)

    // Calculate unlock duration based on worker's reputation
    const unlockDuration = calculateUnlockTime(
        workerReputation.jobs,
        workerReputation.pending,
        workerReputation.disputes
    )
    const unlockTimestamp = Date.now() + unlockDuration

    // Build the transaction
    const tx = new TransactionBuilder(ERGO_CONFIG.networkType)
        .from(utxos)
        .to(
            new OutputBuilder(SAFE_MIN_BOX_VALUE, workerAddress)
                .setAdditionalRegisters({
                    R4: clientAddress,      // Client PK
                    R5: workerAddress,      // Worker PK
                    R6: unlockTimestamp.toString(), // Unlock time
                    R7: amount.toString(),  // Gig amount
                    R8: 'false',            // Work not submitted yet
                })
        )
        .sendChangeTo(clientAddress)
        .build()

    return {
        transaction: tx,
        unlockDuration,
        unlockTimestamp,
    }
}

// Build a transaction to submit work (worker action)
export async function buildSubmitWorkTransaction(
    workerAddress: string,
    escrowBoxId: string
) {
    // Fetch the escrow box
    const response = await fetch(
        `${ERGO_CONFIG.explorerApiUrl}/boxes/${escrowBoxId}`
    )
    if (!response.ok) throw new Error('Escrow box not found')
    const escrowBox = await response.json()

    // Recalculate unlock time (could fetch fresh reputation here)
    const newUnlockTime = Date.now() + 30_000 // Simplified for demo

    const tx = new TransactionBuilder(ERGO_CONFIG.networkType)
        .from([escrowBox])
        .to(
            new OutputBuilder(escrowBox.value, escrowBox.ergoTree)
                .setAdditionalRegisters({
                    ...escrowBox.additionalRegisters,
                    R6: newUnlockTime.toString(), // New unlock time
                    R8: 'true', // Work submitted
                })
        )
        .sendChangeTo(workerAddress)
        .build()

    return tx
}

// Build a transaction to release payment (after unlock time)
export async function buildReleasePaymentTransaction(
    workerAddress: string,
    escrowBoxId: string
) {
    // Fetch the escrow box
    const response = await fetch(
        `${ERGO_CONFIG.explorerApiUrl}/boxes/${escrowBoxId}`
    )
    if (!response.ok) throw new Error('Escrow box not found')
    const escrowBox = await response.json()

    // Send funds to worker
    const tx = new TransactionBuilder(ERGO_CONFIG.networkType)
        .from([escrowBox])
        .to(
            new OutputBuilder(escrowBox.value, workerAddress)
        )
        .sendChangeTo(workerAddress)
        .build()

    return tx
}
