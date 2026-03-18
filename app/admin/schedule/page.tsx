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
  LogOut, 
  Shield,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  User,
  Check,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface AdminData {
  email: string
  office: string
  name: string
}

// Time slots for the schedule grid
const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
]

// Sample appointments for demo
const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    type: "guidance",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "9:00 AM",
    status: "pending",
    reason: "Academic performance discussion",
    userEmail: "student1@school.edu",
    userName: "Maria Santos",
  },
  {
    id: "2",
    type: "guidance",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:30 AM",
    status: "confirmed",
    reason: "Career guidance",
    userEmail: "student2@school.edu",
    userName: "Juan Dela Cruz",
  },
  {
    id: "3",
    type: "guidance",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    time: "2:00 PM",
    status: "confirmed",
    reason: "Personal concerns",
    userEmail: "student3@school.edu",
    userName: "Ana Reyes",
  },
  {
    id: "4",
    type: "hr",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "11:00 AM",
    status: "pending",
    reason: "Professional development",
    userEmail: "faculty1@school.edu",
    userName: "Prof. Garcia",
  },
  {
    id: "5",
    type: "hr",
    date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
    time: "3:00 PM",
    status: "confirmed",
    userEmail: "staff1@school.edu",
    userName: "Mr. Rodriguez",
  },
  {
    id: "6",
    type: "guidance",
    date: new Date().toISOString().split("T")[0],
    time: "8:30 AM",
    status: "completed",
    reason: "Follow-up session",
    userEmail: "student4@school.edu",
    userName: "Carlo Mendoza",
  },
  {
    id: "7",
    type: "hr",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    status: "confirmed",
    reason: "Leave request discussion",
    userEmail: "faculty2@school.edu",
    userName: "Ms. Fernandez",
  },
]

// Get dates for the week view
function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = []
  const start = new Date(startDate)
  start.setDate(start.getDate() - start.getDay() + 1) // Start from Monday
  
  for (let i = 0; i < 5; i++) { // Monday to Friday
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  return dates
}

export default function ScheduleOverviewPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [departmentFilter, setDepartmentFilter] = useState<"all" | "guidance" | "hr">("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const weekDates = getWeekDates(currentWeekStart)

  useEffect(() => {
    const adminData = localStorage.getItem("campcon_admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }
    const parsed = JSON.parse(adminData)
    // Only allow super admin or guidance/hr heads
    if (parsed.office !== "super" && parsed.office !== "guidance" && parsed.office !== "hr") {
      router.push("/admin/login")
      return
    }
    setAdmin(parsed)

    // Load appointments
    const storedAppointments = localStorage.getItem("campcon_appointments")
    const userAppointments = storedAppointments ? JSON.parse(storedAppointments) : []
    setAppointments([...SAMPLE_APPOINTMENTS, ...userAppointments])
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("campcon_admin")
    router.push("/")
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    setCurrentWeekStart(new Date())
  }

  // Get appointment for a specific date, time, and department
  const getAppointment = (date: Date, time: string, type: "guidance" | "hr"): Appointment | undefined => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments.find(
      (apt) => 
        apt.date === dateStr && 
        apt.time === time && 
        apt.type === type &&
        apt.status !== "cancelled"
    )
  }

  // Filter appointments by department
  const filteredAppointments = appointments.filter((apt) => {
    if (departmentFilter === "all") return true
    return apt.type === departmentFilter
  })

  // Stats
  const guidanceTotal = appointments.filter(a => a.type === "guidance" && a.status !== "cancelled").length
  const hrTotal = appointments.filter(a => a.type === "hr" && a.status !== "cancelled").length
  const pendingTotal = appointments.filter(a => a.status === "pending").length
  const confirmedTotal = appointments.filter(a => a.status === "confirmed").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 border-amber-300 text-amber-800"
      case "confirmed":
        return "bg-primary/10 border-primary/30 text-primary"
      case "completed":
        return "bg-muted border-border text-muted-foreground"
      default:
        return "bg-muted border-border text-muted-foreground"
    }
  }

  if (!admin) {
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
          <Link href="/admin/schedule" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CampCon</span>
            <Badge variant="secondary" className="ml-2">Schedule Overview</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{admin.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {admin.office === "super" ? "Super Admin" : `${admin.office} Head`}
              </Badge>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
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
        {/* Title and Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            Appointment Schedule Overview
          </h1>
          <p className="mt-1 text-muted-foreground">
            View all appointments across Guidance and HR departments
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{guidanceTotal}</p>
                <p className="text-sm text-muted-foreground">Guidance Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/30">
                <Building2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{hrTotal}</p>
                <p className="text-sm text-muted-foreground">HR Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{pendingTotal}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{confirmedTotal}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Controls */}
        <Card className="mb-6 border-border/50">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="ml-2 font-medium text-foreground">
                {weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} - {weekDates[4].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={departmentFilter} onValueChange={(value: "all" | "guidance" | "hr") => setDepartmentFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="guidance">Guidance Only</SelectItem>
                  <SelectItem value="hr">HR Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Click on any appointment to view details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="w-24 p-3 text-left text-sm font-medium text-muted-foreground">Time</th>
                    {weekDates.map((date, index) => {
                      const isToday = date.toDateString() === new Date().toDateString()
                      return (
                        <th 
                          key={index} 
                          className={`p-3 text-center text-sm font-medium ${isToday ? "bg-primary/5" : ""}`}
                        >
                          <div className={`${isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                          <div className={`text-lg ${isToday ? "font-bold text-primary" : "text-foreground"}`}>
                            {date.getDate()}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time} className="border-b border-border/30 last:border-b-0">
                      <td className="p-2 text-sm font-medium text-muted-foreground">
                        {time}
                      </td>
                      {weekDates.map((date, dateIndex) => {
                        const isToday = date.toDateString() === new Date().toDateString()
                        const guidanceApt = departmentFilter !== "hr" ? getAppointment(date, time, "guidance") : undefined
                        const hrApt = departmentFilter !== "guidance" ? getAppointment(date, time, "hr") : undefined
                        
                        return (
                          <td 
                            key={dateIndex} 
                            className={`p-1 ${isToday ? "bg-primary/5" : ""}`}
                          >
                            <div className="flex flex-col gap-1 min-h-[60px]">
                              {guidanceApt && (
                                <button
                                  onClick={() => setSelectedAppointment(guidanceApt)}
                                  className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition-all hover:shadow-md ${getStatusColor(guidanceApt.status)}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3 shrink-0" />
                                    <span className="truncate font-medium">{guidanceApt.userName}</span>
                                  </div>
                                  <div className="mt-0.5 text-[10px] opacity-75">Guidance</div>
                                </button>
                              )}
                              {hrApt && (
                                <button
                                  onClick={() => setSelectedAppointment(hrApt)}
                                  className={`w-full rounded-md border px-2 py-1.5 text-left text-xs transition-all hover:shadow-md ${getStatusColor(hrApt.status)}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3 shrink-0" />
                                    <span className="truncate font-medium">{hrApt.userName}</span>
                                  </div>
                                  <div className="mt-0.5 text-[10px] opacity-75">HR</div>
                                </button>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-amber-300 bg-amber-100"></div>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-primary/30 bg-primary/10"></div>
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-border bg-muted"></div>
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Guidance</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent-foreground" />
              <span className="text-muted-foreground">HR</span>
            </div>
          </div>
        </div>

        {/* Appointment Detail Panel */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md border-border/50 shadow-xl">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Appointment Details
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedAppointment(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">{selectedAppointment.userName || "Anonymous"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{selectedAppointment.userEmail || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedAppointment.type === "guidance" ? "Guidance Office" : "HR Office"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(selectedAppointment.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">{selectedAppointment.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${
                      selectedAppointment.status === "pending" 
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : selectedAppointment.status === "confirmed"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedAppointment.status}
                  </Badge>
                </div>
                {selectedAppointment.reason && (
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Reason / Notes:</span>
                    <p className="mt-1 text-sm text-foreground">{selectedAppointment.reason}</p>
                  </div>
                )}
                <div className="pt-4">
                  <Button className="w-full" onClick={() => setSelectedAppointment(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
