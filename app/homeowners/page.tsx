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
    <main className="bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.22),_transparent_42%),linear-gradient(120deg,_#0f172a,_#123b55_55%,_#0f766e)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Home improvement, made simpler</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Find the right contractor for your next project.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">Describe the work you need and let TrustBuild connect you with trusted professionals who can help bring it to life.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                <Link href="/register?role=customer&redirect=/post-job">Post your job <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-300">Free to post. No obligation to hire.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16 text-slate-900 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">A straightforward start</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Your project starts with a few details.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Share what needs doing, where you are, and your preferred timeline. TrustBuild takes care of getting your request in front of the right people.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border-t-4 border-amber-400 pt-5">
                <Icon className="h-7 w-7 text-teal-700" />
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 border-t border-slate-200 pt-8">
            <Button asChild className="bg-teal-700 text-white hover:bg-teal-800">
              <Link href="/register?role=customer&redirect=/post-job">Tell us about your project <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}