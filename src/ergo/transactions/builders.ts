// Transaction Builders for Atomic-Gig (NAUTILUS MODE)
import {
    TransactionBuilder,
    OutputBuilder,
    RECOMMENDED_MIN_FEE_VALUE
} from '@fleet-sdk/core'
import { compileContract } from '../contracts/compiler'
import { ERGO_CONFIG } from '../config'

// Fetch UTXOs from explorer API for multiple addresses
async function fetchUtxos(addresses: string | string[]) {
    const addrList = Array.isArray(addresses) ? addresses : [addresses];
    let allBoxes: any[] = [];

    for (const addr of addrList) {
        try {
            const response = await fetch(
                `${ERGO_CONFIG.explorerApiUrl}/boxes/unspent/byAddress/${addr}`
            );
            if (response.ok) {
                const data = await response.json();
                const boxes = data.items || data || [];
                allBoxes = allBoxes.concat(boxes);
            }
        } catch (e) {
            console.warn(`Failed to fetch UTXOs for ${addr}`);
        }
    }

    console.log(`[Builders] Found ${allBoxes.length} UTXOs from ${addrList.length} addresses`);
    return allBoxes;
}

// Fetch Current Height
async function fetchHeight() {
    const res = await fetch(`${ERGO_CONFIG.explorerApiUrl}/blocks?limit=1`);
    const json = await res.json();
    return json.items[0].height;
}

export function calculateUnlockTime(
    jobsCompleted: number,
    pendingAmount: number,
    disputesLost: number
): number {
    const BASE_TIME = 30_000
    const MIN_TIME = 5_000
    const MAX_TIME = 120_000

    const jobsReduction = Math.min(jobsCompleted, 25) * 1000
    const pendingPenalty = Math.min(Math.floor(pendingAmount / 100), 30) * 1000
    const disputePenalty = disputesLost * 10_000

    return Math.min(MAX_TIME, Math.max(MIN_TIME, BASE_TIME - jobsReduction + pendingPenalty + disputePenalty))
}

// BUILD UNSIGNED LOCK TRANSACTION
export async function buildCreateGigTransaction(
    clientAddresses: string | string[],
    changeAddress: string,
    _workerAddress: string,
    amount: number, // Amount in DJED units (we treat as ERG for demo)
    _currentHeight: number,
    workerReputation: { jobs: number; pending: number; disputes: number }
) {
    const utxos = await fetchUtxos(clientAddresses);

    if (utxos.length === 0) {
        throw new Error('No UTXOs found. Make sure your wallet has funds.');
    }

    const height = await fetchHeight();
    const contractAddress = compileContract('mainnet');

    const unlockDuration = calculateUnlockTime(
        workerReputation.jobs,
        workerReputation.pending,
        workerReputation.disputes
    );
    const unlockTimestamp = Date.now() + unlockDuration;

    // Convert amount to nanoErgs
    // For demo: 100 DJED = 0.001 ERG (just for reasonable demo values)
    // Minimum box value is 0.001 ERG = 1,000,000 nanoErgs
    const MIN_BOX_VALUE = 1000000n;
    const scaledAmount = BigInt(Math.floor((amount / 100) * 1_000_000)); // 100 DJED = 0.001 ERG
    const nanoErgs = scaledAmount > MIN_BOX_VALUE ? scaledAmount : MIN_BOX_VALUE;

    console.log(`[Lock] Amount: ${amount} DJED = ${Number(nanoErgs) / 1e9} ERG`);

    const unsignedTx = new TransactionBuilder(height)
        .from(utxos)
        .to(new OutputBuilder(nanoErgs, contractAddress))
        .sendChangeTo(changeAddress)
        .payFee(RECOMMENDED_MIN_FEE_VALUE)
        .build();

    return {
        transaction: unsignedTx,
        unlockDuration,
        unlockTimestamp
    }
}

// BUILD UNSIGNED RELEASE TRANSACTION
export async function buildReleasePaymentTransaction(
    workerAddress: string,
    clientAddresses: string | string[],
    changeAddress: string
) {
    // Find the locked box from the escrow contract
    const contractAddress = compileContract('mainnet');
    const lockedBoxes = await fetchUtxos(contractAddress);

    if (lockedBoxes.length === 0) {
        throw new Error('No locked funds found in escrow contract');
    }

    // Use the first locked box
    const lockedBox = lockedBoxes[0];
    console.log('[Release] Found locked box:', lockedBox.boxId, 'Value:', lockedBox.value);

    // Get additional UTXOs for fee payment
    const feeUtxos = await fetchUtxos(clientAddresses);
    const height = await fetchHeight();

    // Output receives the full locked amount
    // Fee is paid from the additional UTXOs (feeUtxos), not from the locked box
    const unsignedTx = new TransactionBuilder(height)
        .from([lockedBox, ...feeUtxos])
        .to(new OutputBuilder(BigInt(lockedBox.value), workerAddress))
        .sendChangeTo(changeAddress)
        .payFee(RECOMMENDED_MIN_FEE_VALUE)
        .build();

    return unsignedTx;
}
