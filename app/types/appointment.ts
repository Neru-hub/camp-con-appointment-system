export interface Feedback {
  id: string
  appointmentId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment: string
  submittedAt: string
  userEmail: string
  userName?: string
}

export interface Appointment {
  id: string
  type: "guidance" | "hr"
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  reason?: string
  userEmail?: string
  userName?: string
  consultationMode: "in-person" | "online"
  contactNumber?: string
  agreedToTerms: boolean
  feedback?: Feedback | null
}
