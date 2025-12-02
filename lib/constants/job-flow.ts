/**
 * Shared Job Flow Constants
 * 
 * This file defines the canonical job workflow that both customer and contractor
 * dashboards reference to ensure consistency in messaging and progress tracking.
 * 
 * SIMPLIFIED FLOW (as of Dec 2024):
 * 1. Contractor buys job access
 * 2. Contractor sees customer details immediately
 * 3. Contractor calls customer directly (no application/quote required)
 * 4. Contractor clicks "I Won" after they agree
 * 5. Customer confirms
 * 6. Job moves to "In Progress"
 */

export type JobFlowStepId = 
  | 'browse'
  | 'purchase-access'
  | 'contact-negotiate'
  | 'claim-win'
  | 'confirm-winner'
  | 'work-in-progress'
  | 'submit-final-price'
  | 'confirm-price'
  | 'leave-review'

export type Actor = 'contractor' | 'customer' | 'both'

export interface JobFlowStep {
  id: JobFlowStepId
  stepNumber: number
  title: string
  description: string
  shortDescription: string
  actor: Actor
  contractorAction?: string
  customerAction?: string
}

/**
 * The complete job flow from start to finish.
 * Both contractor and customer dashboards should use this as the source of truth.
 */
export const JOB_FLOW_STEPS: JobFlowStep[] = [
  {
    id: 'browse',
    stepNumber: 1,
    title: 'Browse Jobs',
    description: 'Contractor browses available jobs in their area and category',
    shortDescription: 'Find jobs',
    actor: 'contractor',
    contractorAction: 'Search for jobs matching your skills and location',
  },
  {
    id: 'purchase-access',
    stepNumber: 2,
    title: 'Buy Job Access',
    description: 'Contractor purchases access to instantly see customer contact details',
    shortDescription: 'Get customer details',
    actor: 'contractor',
    contractorAction: 'Pay to unlock customer name, phone, and job details',
    customerAction: 'You receive a notification that a contractor is interested',
  },
  {
    id: 'contact-negotiate',
    stepNumber: 3,
    title: 'Call Customer & Agree',
    description: 'Contractor calls the customer directly to discuss the job, negotiate terms, and agree on price',
    shortDescription: 'Call & agree on terms',
    actor: 'both',
    contractorAction: 'Call the customer directly using the phone number shown - discuss job details, timeline, and price',
    customerAction: 'Answer contractor calls, discuss your job requirements, and choose who to hire',
  },
  {
    id: 'claim-win',
    stepNumber: 4,
    title: 'Claim "I Won"',
    description: 'Once the customer verbally agrees to hire the contractor, the contractor claims the win',
    shortDescription: 'Contractor claims job',
    actor: 'contractor',
    contractorAction: 'Click "I Won the Job" after the customer agrees to hire you',
    customerAction: 'Wait for your chosen contractor to confirm in the system',
  },
  {
    id: 'confirm-winner',
    stepNumber: 5,
    title: 'Confirm Winner',
    description: 'Customer confirms the contractor as the winner, and the job moves to "In Progress"',
    shortDescription: 'Customer confirms',
    actor: 'customer',
    contractorAction: 'Wait for customer to confirm your win',
    customerAction: 'Confirm the contractor you agreed to hire - job will then be "In Progress"',
  },
  {
    id: 'work-in-progress',
    stepNumber: 6,
    title: 'Complete Work',
    description: 'Contractor completes the agreed work',
    shortDescription: 'Do the work',
    actor: 'contractor',
    contractorAction: 'Complete the work as agreed with the customer',
    customerAction: 'Monitor progress and communicate with contractor',
  },
  {
    id: 'submit-final-price',
    stepNumber: 7,
    title: 'Submit Final Price',
    description: 'Contractor enters the final agreed amount after completing work',
    shortDescription: 'Enter final price',
    actor: 'contractor',
    contractorAction: 'Enter the final amount you charged for the job',
    customerAction: 'Wait for contractor to submit the final price',
  },
  {
    id: 'confirm-price',
    stepNumber: 8,
    title: 'Confirm & Complete',
    description: 'Customer confirms the final price and the job is marked complete',
    shortDescription: 'Customer confirms price',
    actor: 'customer',
    contractorAction: 'Wait for customer to confirm the price',
    customerAction: 'Review and confirm the final amount',
  },
  {
    id: 'leave-review',
    stepNumber: 9,
    title: 'Leave Review',
    description: 'Customer leaves a review for the contractor',
    shortDescription: 'Write review',
    actor: 'customer',
    contractorAction: 'Request a review from the customer',
    customerAction: 'Leave a review to help other customers',
  },
]

/**
 * Get a flow step by ID
 */
export function getFlowStepById(id: JobFlowStepId): JobFlowStep | undefined {
  return JOB_FLOW_STEPS.find(step => step.id === id)
}

/**
 * Get the current step number based on job status and user role
 */
export function getCurrentStepNumber(
  jobStatus: string,
  isContractor: boolean,
  options: {
    hasAccess?: boolean
    isWinner?: boolean
    hasFinalPrice?: boolean
    isConfirmed?: boolean
  } = {}
): number {
  const { hasAccess, isWinner, hasFinalPrice, isConfirmed } = options

  // Completed job
  if (jobStatus === 'COMPLETED' && isConfirmed) return 9
  if (jobStatus === 'COMPLETED') return 8
  
  // Awaiting price confirmation
  if (jobStatus === 'AWAITING_FINAL_PRICE_CONFIRMATION') return 8
  
  // In progress
  if (jobStatus === 'IN_PROGRESS') {
    if (hasFinalPrice) return 7
    return 6
  }
  
  // Posted job - varies by progress
  if (jobStatus === 'POSTED') {
    if (isWinner) return 5 // Waiting for customer confirmation
    if (isContractor) {
      if (hasAccess) return 3 // Contact & negotiate (no application step needed)
      return 2 // Purchase access
    } else {
      // Customer perspective
      return 3 // Waiting for contractors to contact / negotiating
    }
  }
  
  return 1
}

/**
 * Job status display mapping
 */
export const JOB_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  POSTED: { label: 'Open', color: 'blue' },
  IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  AWAITING_FINAL_PRICE_CONFIRMATION: { label: 'Awaiting Confirmation', color: 'orange' },
  COMPLETED: { label: 'Completed', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'red' },
  DISPUTED: { label: 'Disputed', color: 'red' },
}
