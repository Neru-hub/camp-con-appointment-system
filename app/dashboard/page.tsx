"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  LogOut, 
  User,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ChevronRight
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
}

interface UserData {
  email: string
  type: string
  name: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("campcon_user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Load appointments from localStorage and filter by current user's email
    const storedAppointments = localStorage.getItem("campcon_appointments")
    if (storedAppointments) {
      const allAppointments = JSON.parse(storedAppointments)
      // Filter to only show appointments belonging to this user
      const userAppointments = allAppointments.filter(
        (apt: Appointment) => apt.userEmail === parsedUser.email
      )
      setAppointments(userAppointments)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("campcon_user")
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">Pending</Badge>
      case "confirmed":
        return <Badge variant="outline" className="border-primary bg-primary/10 text-primary">Confirmed</Badge>
      case "completed":
        return <Badge variant="outline" className="border-muted-foreground bg-muted text-muted-foreground">Completed</Badge>
      case "cancelled":
        return <Badge variant="outline" className="border-destructive bg-destructive/10 text-destructive">Cancelled</Badge>
      default:
        return null
    }
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  )
  const pastAppointments = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  )

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.name}</span>
              <Badge variant="secondary" className="text-xs">
                {user.type === "student" ? "Student" : "Faculty"}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your consultation appointments here
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {upcomingAppointments.length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <CalendarCheck className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CalendarX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {appointments.filter((a) => a.status === "cancelled").length}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book New Appointment CTA */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div>
              <h3 className="font-semibold text-foreground">Need to talk to someone?</h3>
              <p className="text-sm text-muted-foreground">
                Book a confidential consultation with our support team
              </p>
            </div>
            <Link href="/book">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
          </div>
          {upcomingAppointments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">No upcoming appointments</h3>
                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                  You do not have any scheduled consultations yet. 
                  Book one whenever you are ready - we are here for you.
                </p>
                <Link href="/book">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-border/50 transition-all hover:border-primary/30 hover:shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        appointment.type === "guidance" ? "bg-primary/10" : "bg-accent/20"
                      }`}>
                        <Calendar className={`h-6 w-6 ${
                          appointment.type === "guidance" ? "text-primary" : "text-accent-foreground"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">
                            {appointment.type === "guidance" ? "Guidance Office" : "HR Office"}
                          </h4>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Past Appointments</h2>
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-border/50 bg-muted/20">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-muted-foreground">
                            {appointment.type === "guidance" ? "Guidance Office" : "HR Office"}
                          </h4>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Support Message */}
        <Card className="mt-8 border-border/50 bg-muted/30">
          <CardContent className="p-6 text-center">
            <Heart className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold text-foreground">We are here for you</h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Remember, seeking help is a sign of strength. Whether you need academic guidance, 
              personal support, or just someone to talk to - our doors are always open.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
