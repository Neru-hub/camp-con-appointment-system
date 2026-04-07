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
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle,
  XCircle,
  User,
  Mail,
  MapPin,
  Phone,
  BarChart3,
  FileText,
  MessageCircle
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Appointment {
  id: string
  type: "guidance" | "hr"
  consultationMode?: "in-person" | "online"
  contactNumber?: string
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

// Sample appointments for demo (using new 1-2 hour time slots)
const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: "sample-1",
    type: "guidance",
    consultationMode: "in-person",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "9:00 AM",
    status: "pending",
    reason: "I would like to discuss my academic performance",
    userEmail: "student1@school.edu",
    userName: "Maria Santos",
  },
  {
    id: "sample-2",
    type: "guidance",
    consultationMode: "online",
    contactNumber: "09123456789",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:00 AM",
    status: "pending",
    reason: "Need career guidance for college applications",
    userEmail: "student2@school.edu",
    userName: "Juan Dela Cruz",
  },
  {
    id: "sample-3",
    type: "guidance",
    consultationMode: "in-person",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    time: "2:00 PM",
    status: "confirmed",
    reason: "Personal concerns",
    userEmail: "student3@school.edu",
    userName: "Ana Reyes",
  },
  {
    id: "sample-4",
    type: "hr",
    consultationMode: "online",
    contactNumber: "09987654321",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "11:00 AM",
    status: "pending",
    reason: "Discussion about professional development opportunities",
    userEmail: "faculty1@school.edu",
    userName: "Prof. Garcia",
  },
  {
    id: "sample-5",
    type: "hr",
    consultationMode: "in-person",
    date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
    time: "3:00 PM",
    status: "confirmed",
    userEmail: "staff1@school.edu",
    userName: "Mr. Rodriguez",
  },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all")

  useEffect(() => {
    const adminData = localStorage.getItem("campcon_admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }
    setAdmin(JSON.parse(adminData))

    // Load appointments (combine localStorage with sample data for demo)
    const storedAppointments = localStorage.getItem("campcon_appointments")
    const userAppointments = storedAppointments ? JSON.parse(storedAppointments) : []
    setAppointments([...SAMPLE_APPOINTMENTS, ...userAppointments])
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("campcon_admin")
    router.push("/")
  }

  const handleStatusChange = (appointmentId: string, newStatus: "confirmed" | "cancelled" | "completed") => {
    // Update local state
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    )
    
    // Also update localStorage so the student/faculty dashboard can see the change
    const storedAppointments = localStorage.getItem("campcon_appointments")
    if (storedAppointments) {
      const userAppointments = JSON.parse(storedAppointments)
      const updatedAppointments = userAppointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
      localStorage.setItem("campcon_appointments", JSON.stringify(updatedAppointments))
    }
    
    setIsDialogOpen(false)
    setSelectedAppointment(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">Pending Review</Badge>
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

  // Filter appointments based on admin's office
  const filteredAppointments = appointments
    .filter((apt) => {
      if (admin?.office === "guidance") return apt.type === "guidance"
      if (admin?.office === "hr") return apt.type === "hr"
      return true
    })
    .filter((apt) => {
      if (filter === "all") return true
      return apt.status === filter
    })
    .sort((a, b) => {
      // Sort by date, then by pending status
      if (a.status === "pending" && b.status !== "pending") return -1
      if (b.status === "pending" && a.status !== "pending") return 1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  const stats = {
    pending: filteredAppointments.filter((a) => a.status === "pending").length,
    confirmed: filteredAppointments.filter((a) => a.status === "confirmed").length,
    completed: filteredAppointments.filter((a) => a.status === "completed").length,
    cancelled: filteredAppointments.filter((a) => a.status === "cancelled").length,
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
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CampCon</span>
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{admin.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {admin.office} Office
              </Badge>
            </div>
            <Link href="/admin/schedule">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Overview
              </Button>
            </Link>
            <Link href="/admin/feedback">
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Feedback
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button variant="outline" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Messages
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
            {admin.office === "guidance" ? "Guidance Office" : "HR Office"} Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage and review consultation appointments
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card 
            className={`cursor-pointer border-border/50 transition-all hover:border-amber-500/50 ${filter === "pending" ? "border-amber-500 bg-amber-50/50" : ""}`}
            onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <CalendarClock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer border-border/50 transition-all hover:border-primary/50 ${filter === "confirmed" ? "border-primary bg-primary/5" : ""}`}
            onClick={() => setFilter(filter === "confirmed" ? "all" : "confirmed")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.confirmed}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer border-border/50 transition-all hover:border-muted-foreground/50 ${filter === "completed" ? "border-muted-foreground bg-muted" : ""}`}
            onClick={() => setFilter(filter === "completed" ? "all" : "completed")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CheckCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer border-border/50 transition-all hover:border-destructive/50 ${filter === "cancelled" ? "border-destructive bg-destructive/5" : ""}`}
            onClick={() => setFilter(filter === "cancelled" ? "all" : "cancelled")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <CalendarX className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.cancelled}</p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter indicator */}
        {filter !== "all" && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Showing:</span>
            <Badge variant="secondary" className="capitalize">{filter}</Badge>
            <Button variant="ghost" size="sm" onClick={() => setFilter("all")} className="h-6 px-2 text-xs">
              Clear filter
            </Button>
          </div>
        )}

        {/* Appointments List */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Consultation Requests</CardTitle>
            <CardDescription>
              Review and manage appointment requests from {admin.office === "guidance" ? "students" : "faculty and staff"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">No appointments found</h3>
                <p className="text-sm text-muted-foreground">
                  {filter !== "all" 
                    ? `No ${filter} appointments at this time.`
                    : "No appointments have been scheduled yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        appointment.status === "pending" 
                          ? "bg-amber-100" 
                          : appointment.status === "confirmed"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}>
                        <User className={`h-6 w-6 ${
                          appointment.status === "pending"
                            ? "text-amber-600"
                            : appointment.status === "confirmed"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium text-foreground">
                            {appointment.userName || "Anonymous User"}
                          </h4>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                          {appointment.consultationMode && (
                            <span className="flex items-center gap-1">
                              {appointment.consultationMode === "in-person" ? (
                                <MapPin className="h-3.5 w-3.5" />
                              ) : (
                                <Phone className="h-3.5 w-3.5" />
                              )}
                              {appointment.consultationMode === "in-person" ? "In-Person" : "Online"}
                            </span>
                          )}
                          {appointment.userEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {appointment.userEmail}
                            </span>
                          )}
                        </div>
                        {appointment.reason && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Note:</span> {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2 sm:flex-col">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setIsDialogOpen(true)
                            }}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleStatusChange(appointment.id, "cancelled")}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(appointment.id, "completed")}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              You are about to confirm this consultation appointment. The user will be notified via email.
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User</span>
                <span className="font-medium text-foreground">{selectedAppointment.userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">
                  {selectedAppointment.type === "guidance" ? "Guidance Office" : "HR Office"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mode</span>
                <div className="flex items-center gap-2 font-medium text-foreground">
                  {selectedAppointment.consultationMode === "in-person" ? (
                    <>
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>In-Person</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 text-accent" />
                      <span>Online</span>
                    </>
                  )}
                </div>
              </div>
              {selectedAppointment.consultationMode === "online" && selectedAppointment.contactNumber && (
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="font-medium text-foreground">{selectedAppointment.contactNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">
                  {new Date(selectedAppointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{selectedAppointment.time}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAppointment && handleStatusChange(selectedAppointment.id, "confirmed")}>
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
