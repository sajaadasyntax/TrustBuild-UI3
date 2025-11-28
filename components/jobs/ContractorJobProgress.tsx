"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Circle, 
  Phone, 
  Trophy, 
  Hammer, 
  PoundSterling, 
  Clock,
  ArrowRight,
  MessageSquare,
  AlertCircle
} from "lucide-react"
import { Job, JobApplication } from "@/lib/api"

interface ContractorJobProgressProps {
  job: Job
  hasAccess: boolean
  myApplication: JobApplication | null
  isJobWinner: boolean
  onClaimWon?: () => void
  onProposeFinalPrice?: () => void
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'completed' | 'current' | 'upcoming' | 'waiting'
  action?: {
    label: string
    onClick?: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  tips?: string[]
}

export function ContractorJobProgress({
  job,
  hasAccess,
  myApplication,
  isJobWinner,
  onClaimWon,
  onProposeFinalPrice,
}: ContractorJobProgressProps) {
  
  // Determine current step based on job state
  const getWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = []
    
    // Step 1: Purchase Access
    steps.push({
      id: 'access',
      title: 'Purchase Job Access',
      description: hasAccess 
        ? 'You have access to this job' 
        : 'Purchase access to view customer details and apply',
      icon: <CheckCircle2 className="h-5 w-5" />,
      status: hasAccess ? 'completed' : 'current',
    })
    
    // Step 2: Apply to Job
    steps.push({
      id: 'apply',
      title: 'Submit Application',
      description: myApplication 
        ? `Applied on ${new Date(myApplication.appliedAt).toLocaleDateString()} for £${myApplication.proposedRate}`
        : 'Submit your proposal and quote to the customer',
      icon: <CheckCircle2 className="h-5 w-5" />,
      status: myApplication ? 'completed' : (hasAccess ? 'current' : 'upcoming'),
    })
    
    // Step 3: Contact Customer (THE KEY MISSING STEP IN UX)
    const hasAppliedAndPosted = myApplication && job.status === 'POSTED' && !isJobWinner
    steps.push({
      id: 'contact',
      title: 'Contact Customer & Win the Job',
      description: isJobWinner 
        ? 'You have been confirmed as the winner!'
        : 'Reach out to the customer directly to discuss the job and win their business',
      icon: <Phone className="h-5 w-5" />,
      status: isJobWinner 
        ? 'completed' 
        : (hasAppliedAndPosted ? 'current' : 'upcoming'),
      tips: hasAppliedAndPosted ? [
        '📞 Call or email the customer using the contact details above',
        '💬 Discuss the job requirements in detail',
        '🤝 Negotiate the final price and timeline',
        '✅ Once they agree to hire you, come back and click "I Won the Job"'
      ] : undefined,
      action: hasAppliedAndPosted ? {
        label: 'I Won the Job',
        onClick: onClaimWon,
        variant: 'default'
      } : undefined,
    })
    
    // Step 4: Customer Confirms (Waiting step)
    if (job.status === 'POSTED' && job.wonByContractorId && isJobWinner) {
      steps.push({
        id: 'confirm-wait',
        title: 'Awaiting Customer Confirmation',
        description: 'The customer has been notified. Waiting for them to confirm you won.',
        icon: <Clock className="h-5 w-5" />,
        status: 'waiting',
      })
    }
    
    // Step 5: Complete the Work
    const isInProgress = job.status === 'IN_PROGRESS' && isJobWinner
    const isAwaitingConfirmation = job.status === 'AWAITING_FINAL_PRICE_CONFIRMATION'
    const isCompleted = job.status === 'COMPLETED'
    
    steps.push({
      id: 'work',
      title: 'Complete the Work',
      description: isInProgress 
        ? 'Job is in progress - complete the work as agreed with the customer'
        : (isAwaitingConfirmation || isCompleted) 
          ? 'Work completed' 
          : 'Complete the agreed work for the customer',
      icon: <Hammer className="h-5 w-5" />,
      status: isInProgress 
        ? 'current' 
        : (isAwaitingConfirmation || isCompleted) 
          ? 'completed' 
          : 'upcoming',
    })
    
    // Step 6: Submit Final Price
    steps.push({
      id: 'final-price',
      title: 'Submit Final Price',
      description: isAwaitingConfirmation 
        ? `Submitted £${job.contractorProposedAmount?.toFixed(2)} - awaiting customer confirmation`
        : isCompleted
          ? `Final amount: £${job.finalAmount?.toFixed(2) || job.contractorProposedAmount?.toFixed(2)}`
          : 'Enter the final agreed amount and request payment',
      icon: <PoundSterling className="h-5 w-5" />,
      status: isAwaitingConfirmation 
        ? 'waiting' 
        : isCompleted 
          ? 'completed' 
          : (isInProgress ? 'current' : 'upcoming'),
      action: isInProgress ? {
        label: 'Enter Final Price',
        onClick: onProposeFinalPrice,
        variant: 'default'
      } : undefined,
    })
    
    // Step 7: Get Paid
    steps.push({
      id: 'paid',
      title: 'Job Complete & Payment',
      description: isCompleted && job.customerConfirmed
        ? 'Job completed! Commission has been applied.'
        : 'Customer confirms and commission is processed',
      icon: <Trophy className="h-5 w-5" />,
      status: (isCompleted && job.customerConfirmed) ? 'completed' : 'upcoming',
    })
    
    return steps
  }

  const steps = getWorkflowSteps()
  const currentStepIndex = steps.findIndex(s => s.status === 'current' || s.status === 'waiting')
  
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Your Next Steps
          </CardTitle>
          <Badge variant="outline" className="bg-white">
            Step {currentStepIndex + 1} of {steps.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div 
                  className={`absolute left-[19px] top-10 w-0.5 h-full -mb-1 ${
                    step.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
              
              <div className={`flex gap-4 p-3 rounded-lg transition-all ${
                step.status === 'current' 
                  ? 'bg-blue-100 border-2 border-blue-300' 
                  : step.status === 'waiting'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : ''
              }`}>
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : step.status === 'current'
                      ? 'bg-blue-500 text-white animate-pulse'
                      : step.status === 'waiting'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : step.status === 'waiting' ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${
                      step.status === 'completed' 
                        ? 'text-green-700' 
                        : step.status === 'current'
                          ? 'text-blue-900'
                          : step.status === 'waiting'
                            ? 'text-yellow-800'
                            : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    {step.status === 'current' && (
                      <Badge className="bg-blue-600 text-xs">Current Step</Badge>
                    )}
                    {step.status === 'waiting' && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                        Waiting
                      </Badge>
                    )}
                  </div>
                  
                  <p className={`text-sm ${
                    step.status === 'completed' || step.status === 'current' || step.status === 'waiting'
                      ? 'text-gray-700' 
                      : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Tips for current step */}
                  {step.tips && step.status === 'current' && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        How to proceed:
                      </h5>
                      <ul className="space-y-1">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action button */}
                  {step.action && step.status === 'current' && (
                    <Button 
                      onClick={step.action.onClick}
                      variant={step.action.variant || 'default'}
                      className="mt-3"
                      size="sm"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      {step.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Important Note */}
        {myApplication && job.status === 'POSTED' && !isJobWinner && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">
                  Important: Contact the Customer!
                </h4>
                <p className="text-sm text-amber-800">
                  After applying, you need to <strong>reach out to the customer directly</strong> using 
                  the contact details provided above. Discuss the job, agree on terms, and when they 
                  choose you, come back here and click &quot;I Won the Job&quot;.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ContractorJobProgress

