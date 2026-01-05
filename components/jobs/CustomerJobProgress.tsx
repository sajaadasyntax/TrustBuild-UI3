"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  Users, 
  Trophy, 
  Hammer, 
  PoundSterling, 
  Clock,
  ArrowRight,
  MessageSquare,
  AlertCircle,
  Star,
  Phone
} from "lucide-react"
import { Job, JobApplication } from "@/lib/api"

interface CustomerJobProgressProps {
  job: Job
  applications: JobApplication[]
  hasSelectedContractor: boolean
  onConfirmWinner?: () => void
  onConfirmPrice?: () => void
  onWriteReview?: () => void
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

export function CustomerJobProgress({
  job,
  applications,
  hasSelectedContractor,
  onConfirmWinner,
  onConfirmPrice,
  onWriteReview,
}: CustomerJobProgressProps) {
  
  // Determine current step based on job state
  const getWorkflowSteps = (): WorkflowStep[] => {
    const steps: WorkflowStep[] = []
    
    // Step 1: Post Job - Always completed if we're viewing the job
    steps.push({
      id: 'post',
      title: 'Post Your Job',
      description: `Posted on ${new Date(job.createdAt).toLocaleDateString()}`,
      icon: <FileText className="h-5 w-5" />,
      status: 'completed',
    })
    
    // Step 2: Contractors Claim Job
    const hasApplications = applications.length > 0
    const accessCount = job.jobAccess?.length || 0
    steps.push({
      id: 'applications',
      title: 'Contractors Claim Job',
      description: hasApplications 
        ? `${applications.length} contractor(s) claimed they won, ${accessCount} contractor(s) viewed`
        : accessCount > 0 
          ? `${accessCount} contractor(s) viewed your job - waiting for claims`
          : 'Waiting for contractors to view and claim this job',
      icon: <Users className="h-5 w-5" />,
      status: hasApplications ? 'completed' : 'current',
    })
    
    // Step 3: Choose & Negotiate (The key step that happens outside the platform)
    const hasWinner = !!job.wonByContractorId
    const isPosted = job.status === 'POSTED'
    steps.push({
      id: 'negotiate',
      title: 'Review, Contact & Choose',
      description: hasWinner 
        ? 'You have selected a contractor!'
        : 'Review applications, contact contractors, and choose the best one',
      icon: <Phone className="h-5 w-5" />,
      status: hasWinner 
        ? 'completed' 
        : (hasApplications && isPosted ? 'current' : 'upcoming'),
      tips: (hasApplications && isPosted && !hasWinner) ? [
        '👀 Review all contractors who claimed they won above',
        '📞 Contact contractors directly to discuss details',
        '💬 Ask questions, negotiate terms and pricing',
        '✅ When a contractor clicks "I Won", you\'ll be asked to confirm'
      ] : undefined,
    })
    
    // Step 4: Confirm Winner (Waiting for contractor to claim OR customer to confirm)
    const awaitingConfirmation = job.wonByContractorId && job.status === 'POSTED'
    const isInProgress = job.status === 'IN_PROGRESS'
    const isAwaitingPrice = job.status === 'AWAITING_FINAL_PRICE_CONFIRMATION'
    const isCompleted = job.status === 'COMPLETED'
    
    if (awaitingConfirmation) {
      steps.push({
        id: 'confirm-winner',
        title: 'Confirm Your Choice',
        description: `${job.wonByContractor?.businessName || job.wonByContractor?.user?.name || 'A contractor'} claims they won - please confirm`,
        icon: <Trophy className="h-5 w-5" />,
        status: 'current',
        action: onConfirmWinner ? {
          label: 'Review & Confirm Winner',
          onClick: onConfirmWinner,
          variant: 'default'
        } : undefined,
        tips: [
          '🔍 Verify this is the contractor you agreed to hire',
          '✅ Once confirmed, the job moves to "In Progress"',
          '🚫 Other contractors will no longer be able to claim this job'
        ]
      })
    } else {
      steps.push({
        id: 'confirm-winner',
        title: 'Confirm Winner',
        description: isInProgress || isAwaitingPrice || isCompleted
          ? 'Contractor confirmed!'
          : 'Confirm when a contractor claims they won the job',
        icon: <Trophy className="h-5 w-5" />,
        status: (isInProgress || isAwaitingPrice || isCompleted) ? 'completed' : 'upcoming',
      })
    }
    
    // Step 5: Work in Progress
    steps.push({
      id: 'work',
      title: 'Work in Progress',
      description: isInProgress 
        ? 'Contractor is completing the work'
        : (isAwaitingPrice || isCompleted)
          ? 'Work completed'
          : 'Contractor will complete the agreed work',
      icon: <Hammer className="h-5 w-5" />,
      status: isInProgress 
        ? 'current' 
        : (isAwaitingPrice || isCompleted) 
          ? 'completed' 
          : 'upcoming',
    })
    
    // Step 6: Confirm Final Price
    if (isAwaitingPrice) {
      steps.push({
        id: 'confirm-price',
        title: 'Confirm Final Price',
        description: `Contractor submitted £${job.contractorProposedAmount ? Number(job.contractorProposedAmount).toFixed(2) : '0.00'} - please review and confirm`,
        icon: <PoundSterling className="h-5 w-5" />,
        status: 'current',
        action: onConfirmPrice ? {
          label: 'Review & Confirm Price',
          onClick: onConfirmPrice,
          variant: 'default'
        } : undefined,
        tips: [
          '💰 Review the final amount charged',
          '✅ Confirm if it matches what you agreed',
          '💬 You can suggest a different amount if needed',
          '⚠️ You can dispute if there\'s an issue'
        ]
      })
    } else {
      steps.push({
        id: 'confirm-price',
        title: 'Confirm Final Price',
        description: isCompleted 
          ? `Confirmed: £${job.finalAmount ? Number(job.finalAmount).toFixed(2) : job.contractorProposedAmount ? Number(job.contractorProposedAmount).toFixed(2) : '0.00'}`
          : 'Review and confirm the final price when work is done',
        icon: <PoundSterling className="h-5 w-5" />,
        status: isCompleted ? 'completed' : 'upcoming',
      })
    }
    
    // Step 7: Leave Review
    const hasReview = job.customerConfirmed && isCompleted
    steps.push({
      id: 'review',
      title: 'Leave a Review',
      description: hasReview 
        ? 'Thank you for completing the job!'
        : 'Help other customers by reviewing the contractor',
      icon: <Star className="h-5 w-5" />,
      status: hasReview ? 'completed' : (isCompleted && job.customerConfirmed ? 'current' : 'upcoming'),
      action: (isCompleted && job.customerConfirmed && onWriteReview) ? {
        label: 'Write Review',
        onClick: onWriteReview,
        variant: 'outline'
      } : undefined,
    })
    
    return steps
  }

  const steps = getWorkflowSteps()
  const currentStepIndex = steps.findIndex(s => s.status === 'current' || s.status === 'waiting')
  const effectiveCurrentStep = currentStepIndex === -1 ? steps.length : currentStepIndex + 1
  
  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-green-600" />
            Job Progress
          </CardTitle>
          <Badge variant="outline" className="bg-white">
            Step {effectiveCurrentStep} of {steps.length}
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
                  ? 'bg-green-100 border-2 border-green-300' 
                  : step.status === 'waiting'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : ''
              }`}>
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : step.status === 'current'
                      ? 'bg-green-500 text-white animate-pulse'
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
                          ? 'text-green-900'
                          : step.status === 'waiting'
                            ? 'text-yellow-800'
                            : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    {step.status === 'current' && (
                      <Badge className="bg-green-600 text-xs">Current Step</Badge>
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
                    <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                      <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        What to do:
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
                      {step.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* How it works note for new jobs */}
        {job.status === 'POSTED' && applications.length === 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  How does this work?
                </h4>
                <p className="text-sm text-blue-800">
                  Contractors will purchase access to view your job details and contact you. 
                  After discussing with you, if they win the job, they&apos;ll click &quot;I Won the Job&quot; 
                  and you&apos;ll confirm here. You can then contact them directly to negotiate and finalize details.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CustomerJobProgress

