"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  { icon: ShieldCheck, title: "Trusted professionals", text: "Connect with contractors who are reviewed and verified by TrustBuild." },
  { icon: Clock3, title: "Save time", text: "Tell us what you need once and get relevant responses in your area." },
  { icon: CheckCircle2, title: "Free to post", text: "There is no obligation to hire and no charge to submit your project." },
]

export default function HomeownersPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.28),_transparent_42%),linear-gradient(120deg,_hsl(var(--primary)),_hsl(var(--secondary)))]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Home improvement, made simpler</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Find the right contractor for your next project.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/85 md:text-xl">Describe the work you need and let TrustBuild connect you with trusted professionals who can help bring it to life.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/register?role=customer&redirect=/post-job">Post your job <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/75">Free to post. No obligation to hire.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-background py-16 text-foreground md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">A straightforward start</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Your project starts with a few details.</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">Share what needs doing, where you are, and your preferred timeline. TrustBuild takes care of getting your request in front of the right people.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t-4 border-accent pt-5">
                <Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 border-t border-slate-200 pt-8">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/register?role=customer&redirect=/post-job">Tell us about your project <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}