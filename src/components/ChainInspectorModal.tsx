import { useState } from 'react'
import { Contract } from '../context/EscrowContext'
import { getReputationBreakdown, WorkerProfile } from '../context/ReputationContext'

interface ChainInspectorModalProps {
    contract: Contract
    worker: WorkerProfile
    onClose: () => void
}

export function ChainInspectorModal({ contract, worker, onClose }: ChainInspectorModalProps) {
    const rep = getReputationBreakdown(worker)

    // Construct mock Ergo Box JSON
    const boxData = {
        boxId: contract.boxId || `${contract.txId?.slice(0, 32)}...`,
        transactionId: contract.txId || 'pending...',
        value: contract.amount * 1000000000, // Convert to nanoErg
        ergoTree: "0008cd02a7955281...", // Simplified
        creationHeight: 1234567,
        assets: [],
        additionalRegisters: {
            R4: {
                renderedValue: worker.r4_jobsCompleted,
                sigmaType: "SInt",
                description: "Jobs Completed"
            },
            R5: {
                renderedValue: worker.r5_disputesLost,
                sigmaType: "SInt",
                description: "Disputes Lost"
            },
            R6: {
                renderedValue: worker.r6_stakedNanoErg,
                sigmaType: "SLong",
                description: "Staked Amount (nanoErg)"
            },
            R7: {
                renderedValue: contract.unlockTime,
                sigmaType: "SLong",
                description: "Unlock Timestamp"
            },
            R8: {
                renderedValue: contract.status === 'PENDING_RELEASE' ? true : false,
                sigmaType: "SBoolean",
                description: "Work Submitted"
            }
        },
        reputation: {
            score: rep.score,
            tier: rep.tier,
            trustLevel: rep.trustLabel,
            unlockDuration: `${rep.unlockTimeMs / 1000}s`
        }
    }

    const jsonString = JSON.stringify(boxData, null, 2)

    // Syntax highlighting for JSON
    const highlightJSON = (json: string) => {
        return json
            .replace(/"([^"]+)":/g, '<span style="color: #10b981">"$1"</span>:') // keys
            .replace(/: "([^"]+)"/g, ': <span style="color: #f59e0b">"$1"</span>') // string values
            .replace(/: (\d+)/g, ': <span style="color: #60a5fa">$1</span>') // numbers
            .replace(/: (true|false)/g, ': <span style="color: #a78bfa">$1</span>') // booleans
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '90%',
                    maxWidth: '700px',
                    maxHeight: '85vh',
                    background: '#0a0f0a',
                    border: '1px solid #10b981',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    boxShadow: '0 0 40px rgba(16, 185, 129, 0.2), inset 0 0 60px rgba(16, 185, 129, 0.03)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Terminal Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#0d1a0d',
                    borderBottom: '1px solid #10b98133'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <span style={{ marginLeft: '1rem', fontFamily: 'monospace', fontSize: '0.8125rem', color: '#10b981' }}>
                            chain-inspector@ergo:~
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            padding: '0 0.5rem'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Terminal Content */}
                <div style={{ padding: '1rem', overflowY: 'auto', maxHeight: 'calc(85vh - 60px)' }}>
                    {/* Command Line */}
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#10b981' }}>$</span> ergo-cli box inspect --id {contract.id.slice(0, 8)}
                    </div>

                    {/* Status Line */}
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.6875rem',
                        color: '#10b981',
                        marginBottom: '1rem',
                        animation: 'pulse 2s infinite'
                    }}>
                        ▓▓▓▓▓▓▓▓▓▓ FETCHING ON-CHAIN DATA... [OK]
                    </div>

                    {/* Box Data */}
                    <pre
                        style={{
                            fontFamily: "'Fira Code', 'Consolas', monospace",
                            fontSize: '0.75rem',
                            lineHeight: 1.6,
                            color: '#d4d4d4',
                            background: '#0a0a0a',
                            padding: '1rem',
                            borderRadius: '4px',
                            border: '1px solid #1a1a1a',
                            overflow: 'auto',
                            margin: 0
                        }}
                        dangerouslySetInnerHTML={{ __html: highlightJSON(jsonString) }}
                    />

                    {/* Footer Info */}
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#0d1a0d',
                        border: '1px solid #10b98133',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.6875rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                            <span>Contract Status:</span>
                            <span style={{
                                color: contract.status === 'RELEASED' ? '#10b981' :
                                    contract.status === 'DISPUTED' ? '#ef4444' : '#f59e0b'
                            }}>
                                {contract.status}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginTop: '0.25rem' }}>
                            <span>Worker Trust:</span>
                            <span style={{ color: rep.color === 'green' ? '#10b981' : rep.color === 'yellow' ? '#f59e0b' : '#ef4444' }}>
                                {rep.trustLabel} ({rep.score} pts)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
