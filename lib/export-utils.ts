export interface AppointmentRecord {
  id: string
  name: string
  email: string
  studentId: string
  program: string
  type: "guidance" | "hr"
  consultationMode: "in-person" | "online"
  contactNumber?: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  reason?: string
}

export interface ReportData {
  appointments: AppointmentRecord[]
  generatedDate: string
  department: string
  totalAppointments: number
  confirmedCount: number
  pendingCount: number
  completedCount: number
  cancelledCount: number
}

// Convert appointments to CSV format
export const generateCSV = (reportData: ReportData): string => {
  const headers = [
    "Student/Employee Name",
    "ID",
    "Email",
    "Program/Department",
    "Service Type",
    "Consultation Mode",
    "Contact Number",
    "Date",
    "Time",
    "Status",
    "Reason/Notes",
  ]

  const rows = reportData.appointments.map((apt) => [
    apt.name,
    apt.studentId,
    apt.email,
    apt.program,
    apt.type === "guidance" ? "Guidance Office" : "HR Office",
    apt.consultationMode === "in-person" ? "In-Person" : "Online",
    apt.contactNumber || "N/A",
    new Date(apt.date).toLocaleDateString("en-US"),
    apt.time,
    apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
    apt.reason || "N/A",
  ])

  // Escape fields with commas or quotes
  const escapeField = (field: string) => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeField).join(",")),
  ].join("\n")

  return csvContent
}

// Generate Excel-compatible CSV with summary statistics
export const generateExcelCSV = (reportData: ReportData): string => {
  const summarySection = [
    "CampCon - Consultation Records Report",
    `Generated: ${reportData.generatedDate}`,
    `Department: ${reportData.department}`,
    "",
    "Summary Statistics",
    `Total Appointments: ${reportData.totalAppointments}`,
    `Confirmed: ${reportData.confirmedCount}`,
    `Pending: ${reportData.pendingCount}`,
    `Completed: ${reportData.completedCount}`,
    `Cancelled: ${reportData.cancelledCount}`,
    "",
    "",
  ]

  const headers = [
    "Student/Employee Name",
    "ID",
    "Email",
    "Program/Department",
    "Service Type",
    "Consultation Mode",
    "Contact Number",
    "Date",
    "Time",
    "Status",
    "Reason/Notes",
  ]

  const rows = reportData.appointments.map((apt) => [
    apt.name,
    apt.studentId,
    apt.email,
    apt.program,
    apt.type === "guidance" ? "Guidance Office" : "HR Office",
    apt.consultationMode === "in-person" ? "In-Person" : "Online",
    apt.contactNumber || "N/A",
    new Date(apt.date).toLocaleDateString("en-US"),
    apt.time,
    apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
    apt.reason || "N/A",
  ])

  const escapeField = (field: string) => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  const content = [
    ...summarySection,
    headers.join(","),
    ...rows.map((row) => row.map(escapeField).join(",")),
  ].join("\n")

  return content
}

// Download CSV file
export const downloadCSV = (content: string, filename: string) => {
  const element = document.createElement("a")
  const file = new Blob([content], { type: "text/csv;charset=utf-8" })
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  URL.revokeObjectURL(element.href)
}

// Format date for filename
export const getFormattedDate = (): string => {
  const now = new Date()
  return now.toISOString().split("T")[0] // YYYY-MM-DD
}
