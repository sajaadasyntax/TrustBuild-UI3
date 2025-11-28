"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowRight, 
  Search, 
  FileText, 
  Phone, 
  Trophy, 
  CheckCircle, 
  Hammer, 
  PoundSterling, 
  Star 
} from "lucide-react"

interface FlowStep {
  icon: React.ReactNode
  title: string
  description: string
  actor: 'contractor' | 'customer' | 'both'
}

const FLOW_STEPS: FlowStep[] = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "1. Browse Jobs",
    description: "Contractor browses available jobs in their area and category",
    actor: 'contractor'
  },
  {
    icon: <PoundSterling className="h-5 w-5" />,
    title: "2. Purchase Access",
    description: "Contractor purchases access to view customer contact details",
    actor: 'contractor'
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "3. Submit Application",
    description: "Contractor submits quote and cover letter",
    actor: 'contractor'
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: "4. Contact & Negotiate",
    description: "Contractor contacts customer directly to discuss job and win business",
    actor: 'both'
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: "5. Claim Win",
    description: "Once agreed, contractor clicks 'I Won the Job' to notify customer",
    actor: 'contractor'
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "6. Confirm Winner",
    description: "Customer confirms the contractor as the winner",
    actor: 'customer'
  },
  {
    icon: <Hammer className="h-5 w-5" />,
    title: "7. Complete Work",
    description: "Contractor completes the agreed work",
    actor: 'contractor'
  },
  {
    icon: <PoundSterling className="h-5 w-5" />,
    title: "8. Submit Final Price",
    description: "Contractor enters the final agreed amount",
    actor: 'contractor'
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "9. Confirm & Pay",
    description: "Customer confirms job completion and payment is processed",
    actor: 'customer'
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "10. Leave Review",
    description: "Customer leaves a review for the contractor",
    actor: 'customer'
  }
]

interface JobFlowGuideProps {
  currentStep?: number
  showAll?: boolean
  variant?: 'compact' | 'detailed'
}

export function JobFlowGuide({ currentStep, showAll = false, variant = 'detailed' }: JobFlowGuideProps) {
  const getActorColor = (actor: string) => {
    switch (actor) {
      case 'contractor': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'customer': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-purple-100 text-purple-800 border-purple-200'
    }
  }

  const getActorLabel = (actor: string) => {
    switch (actor) {
      case 'contractor': return 'Contractor'
      case 'customer': return 'Customer'
      default: return 'Both'
    }
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {FLOW_STEPS.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === index + 1 
                ? 'bg-blue-500 text-white' 
                : currentStep && index + 1 < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {index + 1}
            </div>
            {index < FLOW_STEPS.length - 1 && (
              <ArrowRight className={`h-4 w-4 mx-1 ${
                currentStep && index + 1 < currentStep ? 'text-green-500' : 'text-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-blue-600" />
          How the Job Flow Works
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {FLOW_STEPS.filter((_, index) => showAll || !currentStep || index <= currentStep).map((step, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-4 p-3 rounded-lg transition-all ${
                currentStep === index + 1 
                  ? 'bg-blue-50 border-2 border-blue-300' 
                  : currentStep && index + 1 < currentStep
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                currentStep === index + 1 
                  ? 'bg-blue-500 text-white' 
                  : currentStep && index + 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep && index + 1 < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{step.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getActorColor(step.actor)}`}>
                    {getActorLabel(step.actor)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
              <span>Contractor action</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
              <span>Customer action</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-200"></div>
              <span>Both involved</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default JobFlowGuide

