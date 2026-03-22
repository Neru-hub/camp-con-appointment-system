"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Heart,
  ArrowLeft,
  Star,
  CheckCircle2,
  ChevronRight,
} from "lucide-react"

interface Appointment {
  id: string
  type: "guidance" | "hr"
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  reason?: string
  userEmail?: string
  userName?: string
  consultationMode?: "in-person" | "online"
  contactNumber?: string
  feedback?: {
    rating: number
    comments: string
    recommendation: boolean
    submittedAt: string
  } | null
}

interface UserData {
  email: string
  type: string
  name: string
}

export default function FeedbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")

  const [user, setUser] = useState<UserData | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [comments, setComments] = useState("")
  const [recommendation, setRecommendation] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("campcon_user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load appointment
    if (appointmentId) {
      const storedAppointments = localStorage.getItem("campcon_appointments")
      if (storedAppointments) {
        const allAppointments = JSON.parse(storedAppointments)
        const apt = allAppointments.find(
          (a: Appointment) => a.id === appointmentId && a.userEmail === parsedUser.email
        )
        if (apt) {
          setAppointment(apt)
          // Pre-populate if feedback already exists
          if (apt.feedback) {
            setRating(apt.feedback.rating)
            setComments(apt.feedback.comments)
            setRecommendation(apt.feedback.recommendation)
            setSubmitted(true)
          }
        } else {
          router.push("/dashboard")
        }
      }
    } else {
      router.push("/dashboard")
    }
  }, [router, appointmentId])

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    if (recommendation === null) {
      alert("Please answer if you would recommend this service")
      return
    }

    setIsLoading(true)

    // Update appointment with feedback
    const storedAppointments = localStorage.getItem("campcon_appointments")
    if (storedAppointments && appointment) {
      const allAppointments = JSON.parse(storedAppointments)
      const updatedAppointments = allAppointments.map((apt: Appointment) => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            feedback: {
              rating,
              comments,
              recommendation,
              submittedAt: new Date().toISOString(),
            },
          }
        }
        return apt
      })
      localStorage.setItem("campcon_appointments", JSON.stringify(updatedAppointments))
    }

    setTimeout(() => {
      setSubmitted(true)
      setIsLoading(false)
    }, 1000)
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Appointment not found...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CampCon</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {!submitted ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                  How was your consultation?
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Your feedback helps us improve our services and support you better
                </p>
              </div>

              {/* Appointment Summary */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Consultation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Office</span>
                    <span className="font-medium text-foreground">
                      {appointment.type === "guidance" ? "Guidance Office" : "HR Office"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium text-foreground">
                      {new Date(appointment.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })} at {appointment.time}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Rating */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent" />
                    Rate Your Experience
                  </CardTitle>
                  <CardDescription>
                    How satisfied are you with the consultation?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= (hoveredRating || rating)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    {rating > 0 && (
                      <p>
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Very Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Your Comments (Optional)</CardTitle>
                  <CardDescription>
                    Share any additional thoughts or suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Your feedback helps us improve..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Recommendation */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Recommendation</CardTitle>
                  <CardDescription>
                    Would you recommend this service to others?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRecommendation(true)}
                      className={`rounded-lg border-2 p-4 text-center transition-all ${
                        recommendation === true
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="text-lg font-semibold text-foreground">Yes</div>
                      <div className="text-xs text-muted-foreground">I would recommend</div>
                    </button>
                    <button
                      onClick={() => setRecommendation(false)}
                      className={`rounded-lg border-2 p-4 text-center transition-all ${
                        recommendation === false
                          ? "border-destructive bg-destructive/10"
                          : "border-border hover:border-destructive/50"
                      }`}
                    >
                      <div className="text-lg font-semibold text-foreground">No</div>
                      <div className="text-xs text-muted-foreground">Not likely</div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Skip
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isLoading || rating === 0 || recommendation === null}
                >
                  {isLoading ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Thank You!
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Your feedback has been submitted successfully
                </p>
              </div>

              <Card className="border-border/50">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Your Rating</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Recommendation</span>
                    <span className="font-medium text-foreground">
                      {recommendation ? "Yes" : "No"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  We appreciate your feedback and will use it to continue improving our services.
                </p>
              </div>

              <Link href="/dashboard">
                <Button className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
