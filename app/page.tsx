"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Heart, Shield, Users, MessageCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CampCon</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="#services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Services
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <Shield className="h-4 w-4" />
              <span>Safe, Confidential, Supportive</span>
            </div>
            <h1 className="mb-6 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your wellbeing matters.{" "}
              <span className="text-primary">We are here to help.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              CampCon makes it easy to schedule confidential consultations with our Guidance Office and HR department. 
              Take the first step towards support - we are here for you, whenever you are ready.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Book a Consultation
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-semibold text-primary">100%</div>
              <div className="mt-1 text-sm text-muted-foreground">Confidential</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-primary">24/7</div>
              <div className="mt-1 text-sm text-muted-foreground">Online Booking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-primary">Quick</div>
              <div className="mt-1 text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-primary">Free</div>
              <div className="mt-1 text-sm text-muted-foreground">For All Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground">Our Services</h2>
            <p className="text-pretty text-muted-foreground">
              We offer supportive services for both students and faculty members. 
              Whatever you are going through, our team is here to listen and help.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Guidance Office</h3>
                <p className="mb-4 text-pretty leading-relaxed text-muted-foreground">
                  For students seeking academic guidance, personal counseling, career advice, or anyone who just needs someone to talk to. 
                  Our counselors are trained to help you navigate challenges with care and understanding.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Academic concerns & study support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Personal & emotional support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Career guidance & planning
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
                  <MessageCircle className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">HR Office</h3>
                <p className="mb-4 text-pretty leading-relaxed text-muted-foreground">
                  For faculty and staff members who need support with workplace matters, professional development, or personal concerns. 
                  We provide a safe space for open dialogue and problem-solving.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Workplace support & guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Professional development
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Confidential consultations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground">How It Works</h2>
            <p className="text-pretty text-muted-foreground">
              Booking an appointment is simple, quick, and completely private. 
              We have designed every step to be stress-free.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Create an Account</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  Sign up with your school email. Your information is kept secure and confidential.
                </p>
              </div>
              <div className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Choose Your Service</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  Select Guidance Office (for students) or HR Office (for faculty) based on your needs.
                </p>
              </div>
              <div className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Pick a Time</h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  Choose a date and time that works for you. You will receive a confirmation email right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance Section */}
      <section id="about" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-6 text-balance text-3xl font-semibold text-foreground">
              Taking the first step takes courage
            </h2>
            <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
              We understand that reaching out for help can feel difficult. 
              That is why we have made this process as simple and private as possible. 
              Whether you are dealing with stress, personal challenges, or just need someone to talk to - 
              you do not have to face it alone. Our doors are always open, and we are here to support you without judgment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                100% Confidential
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Flexible Scheduling
              </div>
              <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Easy Rescheduling
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-balance text-2xl font-semibold text-primary-foreground md:text-3xl">
              Ready to take the first step?
            </h2>
            <p className="mb-8 text-pretty text-primary-foreground/80">
              We are here for you. Book your consultation today - it only takes a minute.
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Book Your Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CampCon</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Integrated Consultation Appointment System for Guidance and HR Office
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Academic Year 2025-2026
              </p>
              <span className="text-border">|</span>
              <Link 
                href="/admin/login" 
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
