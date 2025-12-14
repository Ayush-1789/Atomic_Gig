/**
 * Reputation Box Contract (ErgoScript)
 * 
 * This contract holds a worker's reputation data in registers.
 * The worker can update their own reputation box.
 * 
 * Registers:
 * - R4: Worker's public key (SigmaProp)
 * - R5: Jobs completed (Long)
 * - R6: Pending amount in escrow (Long)
 * - R7: Disputes lost (Long)
 */

export const REPUTATION_BOX_SCRIPT = `
{
  // Only the worker can spend/update this box
  val workerPk = SELF.R4[SigmaProp].get
  
  // Ensure the output preserves worker identity
  val validOutput = OUTPUTS(0).R4[SigmaProp].get == workerPk
  
  sigmaProp(workerPk && validOutput)
}
`

/**
 * Escrow Lock Contract (ErgoScript) - SIMPLIFIED FOR DEMO
 * 
 * This is a simplified contract that allows anyone to unlock.
 * For production, you would add proper register checks.
 * 
 * The demo shows the escrow flow concept - funds go in, timer counts,
 * funds come out. Real implementation would verify signatures.
 */

export const ESCROW_LOCK_SCRIPT = `
{
  // DEMO: Always allow spending to show the full escrow cycle
  // In production, this would check:
  // - Worker signature + work submitted + time passed, OR
  // - Client signature to cancel
  sigmaProp(true)
}
`

/**
 * Work Submission Contract (ErgoScript)
 * 
 * When worker submits work, this transitions the escrow:
 * - Sets R8 = true (work submitted)
 * - Recalculates unlock time based on current reputation
 */

export const WORK_SUBMISSION_SCRIPT = `
{
  val workerPk = SELF.R5[SigmaProp].get
  
  // Worker signs to submit work
  // Output must have R8 = true
  val outputHasWorkFlag = OUTPUTS(0).R8[Boolean].getOrElse(false) == true
  
  sigmaProp(workerPk && outputHasWorkFlag)
}
`
