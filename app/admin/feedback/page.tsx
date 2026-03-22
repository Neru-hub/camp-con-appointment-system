"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  ArrowLeft,
  LogOut,
  BarChart3,
  Star,
  MessageSquare,
  ThumbsUp,
  Users,
  Shield,
} from "lucide-react"

interface AdminData {
  email: string
  office: "guidance" | "hr" | "super"
  name: string
}

interface Appointment {
  id: string
  type: "guidance" | "hr"
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  userEmail?: string
  userName?: string
  feedback?: {
    rating: number
    comments: string
    recommendation: boolean
    submittedAt: string
  } | null
}

interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  recommendations: number
  guidanceFeedback: number
  hrFeedback: number
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [feedbackList, setFeedbackList] = useState<Array<Appointment & { feedback: NonNullable<Appointment["feedback"]> }>>([])
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    averageRating: 0,
    recommendations: 0,
    guidanceFeedback: 0,
    hrFeedback: 0,
  })
  const [filterType, setFilterType] = useState<"all" | "guidance" | "hr">("all")
  const [filterRating, setFilterRating] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all")

  useEffect(() => {
    const adminData = localStorage.getItem("campcon_admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }

    const parsedAdmin = JSON.parse(adminData)
    setAdmin(parsedAdmin)

    // Load and process feedback
    const storedAppointments = localStorage.getItem("campcon_appointments")
    if (storedAppointments) {
      const allAppointments = JSON.parse(storedAppointments)
      
      // Filter for completed appointments with feedback
      const completedWithFeedback = allAppointments.filter(
        (apt: Appointment) =>
          apt.status === "completed" && apt.feedback && apt.feedback.rating > 0
      )

      setFeedbackList(completedWithFeedback)

      // Calculate stats
      if (completedWithFeedback.length > 0) {
        const totalRating = completedWithFeedback.reduce(
          (sum: number, apt: Appointment & { feedback: NonNullable<Appointment["feedback"]> }) =>
            sum + apt.feedback.rating,
          0
        )
        const recommendations = completedWithFeedback.filter(
          (apt: Appointment & { feedback: NonNullable<Appointment["feedback"]> }) =>
            apt.feedback.recommendation === true
        ).length

        const guidanceFeedback = completedWithFeedback.filter(
          (apt: Appointment) => apt.type === "guidance"
        ).length

        const hrFeedback = completedWithFeedback.filter(
          (apt: Appointment) => apt.type === "hr"
        ).length

        setStats({
          totalFeedback: completedWithFeedback.length,
          averageRating: totalRating / completedWithFeedback.length,
          recommendations,
          guidanceFeedback,
          hrFeedback,
        })
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("campcon_admin")
    router.push("/admin/login")
  }

  // Filter feedback based on selected filters
  const filteredFeedback = feedbackList.filter((apt) => {
    if (filterType !== "all" && apt.type !== filterType) return false
    if (filterRating !== "all" && apt.feedback.rating !== parseInt(filterRating)) return false
    return true
  })

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Check if user has permission to view feedback
  if (admin.office === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CampCon</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{admin.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {admin.office} Admin
              </Badge>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Feedback Analytics
            </h1>
            <p className="text-muted-foreground">
              Review and analyze consultation feedback from users
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalFeedback}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed consultations</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-primary/5 border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {stats.averageRating.toFixed(1)}/5
                </div>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= Math.round(stats.averageRating)
                          ? "fill-accent text-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stats.recommendations}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalFeedback > 0
                    ? `${((stats.recommendations / stats.totalFeedback) * 100).toFixed(0)}% approval`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Guidance Office
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.guidanceFeedback}</div>
                <p className="text-xs text-muted-foreground mt-1">Feedback received</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  HR Office
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.hrFeedback}</div>
                <p className="text-xs text-muted-foreground mt-1">Feedback received</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Office Type</label>
                  <div className="flex gap-2">
                    {["all", "guidance", "hr"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type as "all" | "guidance" | "hr")}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          filterType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {type === "all" ? "All" : type === "guidance" ? "Guidance" : "HR"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rating</label>
                  <div className="flex gap-2">
                    {["all", "5", "4", "3", "2", "1"].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilterRating(rating as any)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          filterRating === rating
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {rating === "all" ? "All" : rating + "★"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Feedback ({filteredFeedback.length})
            </h2>

            {filteredFeedback.length > 0 ? (
              <div className="space-y-3">
                {filteredFeedback.map((apt) => (
                  <Card key={apt.id} className="border-border/50 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{apt.userName}</h3>
                            <p className="text-sm text-muted-foreground">{apt.userEmail}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {apt.type} Office
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between py-2 border-y border-border/40">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= apt.feedback.rating
                                    ? "fill-accent text-accent"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                            <span className="text-sm font-medium text-foreground">
                              {apt.feedback.rating}/5
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <ThumbsUp className={`h-4 w-4 ${
                              apt.feedback.recommendation
                                ? "text-primary"
                                : "text-muted-foreground/50"
                            }`} />
                            <span className="text-muted-foreground">
                              {apt.feedback.recommendation ? "Recommends" : "Does not recommend"}
                            </span>
                          </div>
                        </div>

                        {apt.feedback.comments && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Comments:</p>
                            <p className="text-sm text-foreground rounded-lg bg-muted/50 p-3">
                              {apt.feedback.comments}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Consultation: {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </span>
                          <span>
                            Feedback submitted: {new Date(apt.feedback.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-12">
                  <div className="text-center space-y-2">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-muted-foreground">No feedback yet</p>
                    <p className="text-sm text-muted-foreground/70">
                      Feedback will appear here once consultations are completed and rated
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
