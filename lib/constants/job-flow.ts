/**
 * Shared Job Flow Constants
 * 
 * This file defines the canonical job workflow that both customer and contractor
 * dashboards reference to ensure consistency in messaging and progress tracking.
 */

export type JobFlowStepId = 
  | 'browse'
  | 'purchase-access'
  | 'apply'
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
    title: 'Purchase Access',
    description: 'Contractor purchases access to view customer contact details',
    shortDescription: 'Get job access',
    actor: 'contractor',
    contractorAction: 'Pay to unlock customer contact details',
    customerAction: 'Your contact info becomes visible to this contractor',
  },
  {
    id: 'apply',
    stepNumber: 3,
    title: 'Submit Application',
    description: 'Contractor submits quote, cover letter, and timeline',
    shortDescription: 'Apply for job',
    actor: 'contractor',
    contractorAction: 'Submit your proposal with pricing and timeline',
    customerAction: 'Review incoming applications',
  },
  {
    id: 'contact-negotiate',
    stepNumber: 4,
    title: 'Contact & Negotiate',
    description: 'Contractor contacts customer directly to discuss job details and win the business',
    shortDescription: 'Discuss & negotiate',
    actor: 'both',
    contractorAction: 'Call/email the customer, discuss requirements, negotiate terms',
    customerAction: 'Respond to contractor inquiries, compare quotes, choose your preferred contractor',
  },
  {
    id: 'claim-win',
    stepNumber: 5,
    title: 'Claim Win',
    description: 'Once the customer verbally agrees to hire the contractor, the contractor claims the win',
    shortDescription: 'Contractor claims job',
    actor: 'contractor',
    contractorAction: 'Click "I Won the Job" after customer agrees to hire you',
    customerAction: 'Wait for chosen contractor to claim the win',
  },
  {
    id: 'confirm-winner',
    stepNumber: 6,
    title: 'Confirm Winner',
    description: 'Customer confirms the contractor as the winner, closing applications',
    shortDescription: 'Customer confirms',
    actor: 'customer',
    contractorAction: 'Wait for customer to confirm your win',
    customerAction: 'Confirm the contractor you agreed to hire',
  },
  {
    id: 'work-in-progress',
    stepNumber: 7,
    title: 'Complete Work',
    description: 'Contractor completes the agreed work',
    shortDescription: 'Do the work',
    actor: 'contractor',
    contractorAction: 'Complete the work as agreed with the customer',
    customerAction: 'Monitor progress and communicate with contractor',
  },
  {
    id: 'submit-final-price',
    stepNumber: 8,
    title: 'Submit Final Price',
    description: 'Contractor enters the final agreed amount after completing work',
    shortDescription: 'Enter final price',
    actor: 'contractor',
    contractorAction: 'Enter the final amount you charged',
    customerAction: 'Wait for contractor to submit the final price',
  },
  {
    id: 'confirm-price',
    stepNumber: 9,
    title: 'Confirm & Pay',
    description: 'Customer confirms the final price and payment is processed',
    shortDescription: 'Customer confirms price',
    actor: 'customer',
    contractorAction: 'Wait for customer to confirm the price',
    customerAction: 'Review and confirm the final amount, process payment',
  },
  {
    id: 'leave-review',
    stepNumber: 10,
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
    hasApplied?: boolean
    isWinner?: boolean
    hasFinalPrice?: boolean
    isConfirmed?: boolean
  } = {}
): number {
  const { hasAccess, hasApplied, isWinner, hasFinalPrice, isConfirmed } = options

  // Completed job
  if (jobStatus === 'COMPLETED' && isConfirmed) return 10
  if (jobStatus === 'COMPLETED') return 9
  
  // Awaiting price confirmation
  if (jobStatus === 'AWAITING_FINAL_PRICE_CONFIRMATION') return 9
  
  // In progress
  if (jobStatus === 'IN_PROGRESS') {
    if (hasFinalPrice) return 8
    return 7
  }
  
  // Posted job - varies by progress
  if (jobStatus === 'POSTED') {
    if (isWinner) return 6
    if (isContractor) {
      if (hasApplied) return 4 // Contact & negotiate
      if (hasAccess) return 3 // Apply
      return 2 // Purchase access
    } else {
      // Customer perspective
      return 4 // Waiting for applications / negotiating
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

