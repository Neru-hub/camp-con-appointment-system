"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  LogOut, 
  Shield, 
  Download, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  FileText
} from "lucide-react"
import { generateExcelCSV, downloadCSV, getFormattedDate, type AppointmentRecord, type ReportData } from "@/lib/export-utils"

interface AdminUser {
  email: string
  office: string
  name: string
}

interface Appointment {
  id: string
  type: "guidance" | "hr"
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  reason?: string
  userEmail?: string
  userName?: string
  studentId?: string
  program?: string
  consultationMode?: "in-person" | "online"
  contactNumber?: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "all" as string,
    department: "all" as string,
  })

  useEffect(() => {
    const adminData = localStorage.getItem("campcon_admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }
    const parsedAdmin = JSON.parse(adminData)
    setAdmin(parsedAdmin)

    // Load appointments from localStorage
    const storedAppointments = localStorage.getItem("campcon_appointments")
    if (storedAppointments) {
      const allAppointments = JSON.parse(storedAppointments)
      
      // Filter by office if not super admin
      let officeAppointments = allAppointments
      if (parsedAdmin.office !== "super") {
        officeAppointments = allAppointments.filter(
          (apt: Appointment) => apt.type === (parsedAdmin.office === "guidance" ? "guidance" : "hr")
        )
      }
      
      setAppointments(officeAppointments)
      setFilteredAppointments(officeAppointments)
    }
  }, [router])

  useEffect(() => {
    // Apply filters
    let filtered = appointments

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter((apt) => apt.date >= filters.startDate)
    }
    if (filters.endDate) {
      filtered = filtered.filter((apt) => apt.date <= filters.endDate)
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((apt) => apt.status === filters.status)
    }

    // Filter by department
    if (filters.department !== "all") {
      filtered = filtered.filter((apt) => apt.type === filters.department)
    }

    setFilteredAppointments(filtered)
  }, [filters, appointments])

  const getStats = () => {
    return {
      total: filteredAppointments.length,
      confirmed: filteredAppointments.filter((apt) => apt.status === "confirmed").length,
      pending: filteredAppointments.filter((apt) => apt.status === "pending").length,
      completed: filteredAppointments.filter((apt) => apt.status === "completed").length,
      cancelled: filteredAppointments.filter((apt) => apt.status === "cancelled").length,
    }
  }

  const convertToRecords = (): AppointmentRecord[] => {
    return filteredAppointments.map((apt) => ({
      id: apt.id,
      name: apt.userName || "Unknown",
      email: apt.userEmail || "Unknown",
      studentId: apt.studentId || "N/A",
      program: apt.program || "N/A",
      type: apt.type,
      consultationMode: apt.consultationMode || "in-person",
      contactNumber: apt.contactNumber,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      reason: apt.reason,
    }))
  }

  const generateReport = () => {
    const stats = getStats()
    const reportData: ReportData = {
      appointments: convertToRecords(),
      generatedDate: new Date().toLocaleString(),
      department: admin?.office === "super" ? "All Departments" : 
                  admin?.office === "guidance" ? "Guidance Office" : "HR Office",
      totalAppointments: stats.total,
      confirmedCount: stats.confirmed,
      pendingCount: stats.pending,
      completedCount: stats.completed,
      cancelledCount: stats.cancelled,
    }

    const csvContent = generateExcelCSV(reportData)
    const filename = `CampCon-Report-${admin?.office}-${getFormattedDate()}.csv`
    downloadCSV(csvContent, filename)
  }

  const handleLogout = () => {
    localStorage.removeItem("campcon_admin")
    router.push("/admin/login")
  }

  const stats = getStats()

  if (!admin) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">CampCon Reports</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{admin.name}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {admin.office === "super" ? "Super Admin" : 
                 admin.office === "guidance" ? "Guidance" : "HR"}
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
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Consultation Reports</h1>
            <p className="mt-2 text-muted-foreground">
              Generate and download consultation records for your records
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-primary/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="mt-2 text-2xl font-bold text-accent">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-accent/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{stats.completed}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled</p>
                    <p className="mt-2 text-2xl font-bold text-destructive">{stats.cancelled}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Download */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Filters & Export
              </CardTitle>
              <CardDescription>
                Filter the data and generate your consultation report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {admin.office === "super" && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Departments</option>
                      <option value="guidance">Guidance Office</option>
                      <option value="hr">HR Office</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Export Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={generateReport} className="gap-2 sm:flex-1">
                  <Download className="h-4 w-4" />
                  Download Report (CSV)
                </Button>
                <Button variant="outline" onClick={() => {
                  setFilters({ startDate: "", endDate: "", status: "all", department: "all" })
                }} className="gap-2">
                  Clear Filters
                </Button>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>
                  <strong>Total Records:</strong> {filteredAppointments.length} appointments
                </p>
                <p className="mt-2">
                  Your report will include all filtered consultation records with student/employee information, 
                  consultation details, and status. Compatible with Excel and other spreadsheet applications.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Records Preview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Records Preview</CardTitle>
              <CardDescription>
                Showing the first 10 filtered records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/40">
                    <tr className="text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.slice(0, 10).map((apt) => (
                      <tr key={apt.id} className="border-b border-border/20 hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-foreground">{apt.userName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{apt.studentId || "N/A"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {apt.type === "guidance" ? "Guidance" : "HR"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(apt.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              apt.status === "confirmed" ? "bg-primary/10 text-primary" :
                              apt.status === "pending" ? "bg-accent/10 text-accent" :
                              apt.status === "completed" ? "bg-primary/10 text-primary" :
                              "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAppointments.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    <p>No appointments match your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
