import { ClientJobDetails } from "./client-job-details"

// Mock data - in a real app would come from API/database
const mockJobs = [
  {
    id: "job1",
    title: "Kitchen Renovation",
    status: "OPEN" as const,
    description: "Complete kitchen renovation including new cabinets, countertops, appliances, and flooring. The space is approximately 200 square feet.",
    budget: "£5,000",
    location: "London, UK",
    postedAt: "2024-03-15",
    startedAt: "2024-03-20",
    contractor: {
      name: "Smith & Sons Builders",
      rating: 4.8,
      completedJobs: 45,
      joinedAt: "2023",
    },
    progress: 65,
    timeline: "4-6 weeks",
    applications: [
      {
        id: "app1",
        contractor: "Modern Interiors Ltd",
        rating: 4.5,
        completedJobs: 32,
        message: "We have extensive experience in kitchen renovations and can start next week.",
        submittedAt: "2024-03-16",
      },
      {
        id: "app2",
        contractor: "Elite Home Solutions",
        rating: 4.9,
        completedJobs: 78,
        message: "We specialize in high-end kitchen renovations and can provide references.",
        submittedAt: "2024-03-16",
      },
    ],
  },
  {
    id: "job2",
    title: "Bathroom Remodeling",
    status: "IN_PROGRESS" as const,
    description: "Complete bathroom renovation including new fixtures, tiles, and plumbing. The space is approximately 100 square feet.",
    budget: "£3,500",
    location: "London, UK",
    postedAt: "2024-03-10",
    startedAt: "2024-03-15",
    contractor: {
      name: "Modern Interiors Ltd",
      rating: 4.7,
      completedJobs: 32,
      joinedAt: "2022",
    },
    progress: 45,
    timeline: "2-3 weeks",
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

  return <ClientJobDetails job={job} />
} 