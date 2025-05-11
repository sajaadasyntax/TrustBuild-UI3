import { ContractorJobDetails } from "./contractor-job-details"

// Mock data - in a real app would come from API/database
const mockJobs = [
  {
    id: "job1",
    title: "Living Room Redesign",
    status: "IN_PROGRESS" as const,
    description: "Complete living room redesign including new furniture, paint, and flooring. The space is approximately 300 square feet.",
    budget: "£4,500",
    location: "London, UK",
    startedAt: "2024-03-15",
    customer: {
      name: "John Smith",
      rating: 4.8,
      completedJobs: 3,
      joinedAt: "2023",
    },
    progress: 65,
    timeline: "3-4 weeks",
    milestones: [
      {
        id: "milestone1",
        title: "Initial Consultation",
        status: "COMPLETED" as const,
        completedAt: "2024-03-15",
      },
      {
        id: "milestone2",
        title: "Design Approval",
        status: "COMPLETED" as const,
        completedAt: "2024-03-18",
      },
      {
        id: "milestone3",
        title: "Furniture Delivery",
        status: "IN_PROGRESS" as const,
        dueDate: "2024-03-25",
      },
      {
        id: "milestone4",
        title: "Installation",
        status: "PENDING" as const,
        dueDate: "2024-03-28",
      },
    ],
  },
  {
    id: "job2",
    title: "Kitchen Renovation",
    status: "IN_PROGRESS" as const,
    description: "Complete kitchen renovation including new cabinets, countertops, appliances, and flooring. The space is approximately 200 square feet.",
    budget: "£5,000",
    location: "London, UK",
    startedAt: "2024-03-10",
    customer: {
      name: "Sarah Johnson",
      rating: 4.9,
      completedJobs: 5,
      joinedAt: "2022",
    },
    progress: 45,
    timeline: "4-6 weeks",
    milestones: [
      {
        id: "milestone1",
        title: "Initial Consultation",
        status: "COMPLETED" as const,
        completedAt: "2024-03-10",
      },
      {
        id: "milestone2",
        title: "Design Approval",
        status: "COMPLETED" as const,
        completedAt: "2024-03-13",
      },
      {
        id: "milestone3",
        title: "Demolition",
        status: "COMPLETED" as const,
        completedAt: "2024-03-15",
      },
      {
        id: "milestone4",
        title: "Cabinetry Installation",
        status: "IN_PROGRESS" as const,
        dueDate: "2024-03-25",
      },
    ],
  },
]

export function generateStaticParams() {
  return mockJobs.map((job) => ({
    id: job.id,
  }))
}

export default function Page({ params }: { params: { id: string } }) {
  const job = mockJobs.find((j) => j.id === params.id)

  if (!job) {
    return null
  }

  return <ContractorJobDetails job={job} />
} 