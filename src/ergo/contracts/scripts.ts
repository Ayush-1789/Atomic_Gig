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
 * Escrow Lock Contract (ErgoScript)
 * 
 * This contract locks payment for a gig. Release conditions:
 * 1. Worker can claim after unlock timestamp (time-based release)
 * 2. Client can refund if work not submitted (cancel)
 * 
 * Registers:
 * - R4: Client's public key (SigmaProp)
 * - R5: Worker's public key (SigmaProp)
 * - R6: Unlock timestamp (Long) - when worker can claim
 * - R7: Gig amount (Long)
 * - R8: Work submitted flag (Boolean)
 */

export const ESCROW_LOCK_SCRIPT = `
{
  val clientPk = SELF.R4[SigmaProp].get
  val workerPk = SELF.R5[SigmaProp].get
  val unlockTime = SELF.R6[Long].get
  val workSubmitted = SELF.R8[Boolean].getOrElse(false)
  
  // Current block timestamp
  val currentTime = CONTEXT.preHeader.timestamp
  
  // Worker can claim if:
  // 1. Work has been submitted (R8 = true)
  // 2. Current time >= unlock time
  val workerCanClaim = workerPk && workSubmitted && (currentTime >= unlockTime)
  
  // Client can cancel/refund if:
  // 1. Work has NOT been submitted
  val clientCanCancel = clientPk && !workSubmitted
  
  sigmaProp(workerCanClaim || clientCanCancel)
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
