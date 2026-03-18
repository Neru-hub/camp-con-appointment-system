"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Heart, 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Shield
} from "lucide-react"

interface UserData {
  email: string
  type: string
  name: string
}

interface BookedSlot {
  date: string
  time: string
  type: string
}

// Time slots with 1-2 hour intervals, excluding lunch break (11:30 AM - 1:00 PM)
const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  // Lunch break: 11:30 AM - 1:00 PM
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
]

// Generate available dates (next 14 days, excluding weekends)
const getAvailableDates = () => {
  const dates: Date[] = []
  const today = new Date()
  let daysAdded = 0
  let currentDay = new Date(today)
  
  while (daysAdded < 14) {
    currentDay.setDate(currentDay.getDate() + 1)
    const dayOfWeek = currentDay.getDay()
    // Exclude weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(new Date(currentDay))
      daysAdded++
    }
  }
  
  return dates
}

export default function BookingPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([])
  const [bookingData, setBookingData] = useState({
    type: "" as "guidance" | "hr" | "",
    date: "",
    time: "",
    reason: "",
  })
  
  const availableDates = getAvailableDates()

  // Load existing bookings to check for conflicts
  useEffect(() => {
    const loadBookedSlots = () => {
      const existingAppointments = localStorage.getItem("campcon_appointments")
      if (existingAppointments) {
        const appointments = JSON.parse(existingAppointments)
        // Filter for pending and confirmed appointments only (not cancelled)
        const activeBookings = appointments
          .filter((apt: { status: string }) => apt.status === "pending" || apt.status === "confirmed")
          .map((apt: { date: string; time: string; type: string }) => ({
            date: apt.date,
            time: apt.time,
            type: apt.type,
          }))
        setBookedSlots(activeBookings)
      }
    }
    loadBookedSlots()
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem("campcon_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])
  
  // Check if a time slot is already booked for the selected date and type
  const isSlotBooked = (time: string) => {
    return bookedSlots.some(
      (slot) => 
        slot.date === bookingData.date && 
        slot.time === time && 
        slot.type === bookingData.type
    )
  }

  const handleTypeSelect = (type: "guidance" | "hr") => {
    setBookingData({ ...bookingData, type })
    setStep(2)
  }

  const handleDateSelect = (date: string) => {
    setBookingData({ ...bookingData, date })
    setStep(3)
  }

  const handleTimeSelect = (time: string) => {
    setBookingData({ ...bookingData, time })
    setStep(4)
  }

  const handleSubmit = () => {
    setIsLoading(true)
    
    // Final validation: Check for conflicts one more time before booking
    const existingAppointments = localStorage.getItem("campcon_appointments")
    const currentAppointments = existingAppointments ? JSON.parse(existingAppointments) : []
    
    const hasConflict = currentAppointments.some(
      (apt: { date: string; time: string; type: string; status: string }) =>
        apt.date === bookingData.date &&
        apt.time === bookingData.time &&
        apt.type === bookingData.type &&
        (apt.status === "pending" || apt.status === "confirmed")
    )
    
    if (hasConflict) {
      // Slot was taken while user was booking - refresh and show error
      alert("Sorry, this time slot was just booked by someone else. Please select a different time.")
      setBookedSlots(
        currentAppointments
          .filter((apt: { status: string }) => apt.status === "pending" || apt.status === "confirmed")
          .map((apt: { date: string; time: string; type: string }) => ({
            date: apt.date,
            time: apt.time,
            type: apt.type,
          }))
      )
      setBookingData({ ...bookingData, time: "" })
      setStep(3)
      setIsLoading(false)
      return
    }
    
    // Create appointment
    const newAppointment = {
      id: Date.now().toString(),
      type: bookingData.type,
      date: bookingData.date,
      time: bookingData.time,
      reason: bookingData.reason,
      status: "pending" as const,
      userEmail: user?.email,
      userName: user?.name,
    }
    
    // Save to localStorage
    currentAppointments.push(newAppointment)
    localStorage.setItem("campcon_appointments", JSON.stringify(currentAppointments))
    
    // Update local state to reflect the new booking
    setBookedSlots([...bookedSlots, {
      date: bookingData.date,
      time: bookingData.time,
      type: bookingData.type,
    }])
    
    // Show success and redirect
    setTimeout(() => {
      setStep(5)
      setIsLoading(false)
    }, 1500)
  }

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
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Progress Steps */}
      {step < 5 && (
        <div className="border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {[
                { num: 1, label: "Service" },
                { num: 2, label: "Date" },
                { num: 3, label: "Time" },
                { num: 4, label: "Confirm" },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                      step >= s.num 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                    </div>
                    <span className={`hidden text-sm sm:inline ${
                      step >= s.num ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 3 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          
          {/* Step 1: Select Service Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">What type of consultation do you need?</h1>
                <p className="mt-2 text-muted-foreground">Choose the service that best fits your needs</p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => handleTypeSelect("guidance")}
                  className="group relative rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary/20">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">Guidance Office</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    For students seeking academic guidance, personal counseling, career advice, or emotional support.
                  </p>
                  <div className="mt-4 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Click to select
                  </div>
                </button>
                
                <button
                  onClick={() => handleTypeSelect("hr")}
                  className="group relative rounded-xl border-2 border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 transition-all group-hover:bg-accent/30">
                    <MessageCircle className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">HR Office</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    For faculty and staff seeking workplace support, professional development, or confidential discussions.
                  </p>
                  <div className="mt-4 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Click to select
                  </div>
                </button>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  All consultations are confidential. Feel free to discuss any concerns openly - 
                  your privacy is protected.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">Choose a date</h1>
                <p className="mt-2 text-muted-foreground">
                  Select a day that works best for you
                </p>
              </div>

              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Available Dates
                  </CardTitle>
                  <CardDescription>
                    Showing available slots for the next 2 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {availableDates.map((date) => {
                      const dateStr = date.toISOString().split("T")[0]
                      const isSelected = bookingData.date === dateStr
                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleDateSelect(dateStr)}
                          className={`rounded-lg border-2 p-3 text-center transition-all hover:border-primary ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-xs font-medium text-muted-foreground">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                          <div className="text-lg font-semibold text-foreground">
                            {date.getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {date.toLocaleDateString("en-US", { month: "short" })}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">Choose a time</h1>
                <p className="mt-2 text-muted-foreground">
                  {new Date(bookingData.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    Available Time Slots
                  </CardTitle>
                  <CardDescription>
                    Each session is approximately 1-2 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {TIME_SLOTS.map((time) => {
                      const isSelected = bookingData.time === time
                      const isBooked = isSlotBooked(time)
                      return (
                        <button
                          key={time}
                          onClick={() => !isBooked && handleTimeSelect(time)}
                          disabled={isBooked}
                          className={`relative rounded-lg border-2 px-3 py-3 text-sm font-medium transition-all ${
                            isBooked
                              ? "cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground line-through opacity-60"
                              : isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground hover:border-primary hover:bg-muted/50"
                          }`}
                        >
                          {time}
                          {isBooked && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                              X
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Legend for slot availability */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border-2 border-border bg-card"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border-2 border-border/50 bg-muted/30 opacity-60"></div>
                      <span>Already booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border-2 border-primary bg-primary/10"></div>
                      <span>Your selection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-foreground">Almost there!</h1>
                <p className="mt-2 text-muted-foreground">
                  Review your appointment details and add any notes (optional)
                </p>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      {bookingData.type === "guidance" ? (
                        <Users className="h-5 w-5 text-primary" />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-accent-foreground" />
                      )}
                      <span className="font-medium text-foreground">
                        {bookingData.type === "guidance" ? "Guidance Office" : "HR Office"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">
                        {new Date(bookingData.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{bookingData.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Additional Notes (Optional)</CardTitle>
                  <CardDescription>
                    Share anything you would like us to know beforehand. This is completely optional.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g., I would like to discuss academic concerns..."
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    All information shared is kept confidential.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Appointment Booked!</h1>
                <p className="mt-2 text-muted-foreground">
                  Your consultation has been successfully scheduled
                </p>
              </div>

              <Card className="border-border/50">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium text-foreground">
                      {bookingData.type === "guidance" ? "Guidance Office" : "HR Office"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {new Date(bookingData.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{bookingData.time}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  You will receive a confirmation email shortly. 
                  If you need to reschedule, you can manage your appointments from the dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/dashboard">
                  <Button className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/book">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
                    setStep(1)
                    setBookingData({ type: "", date: "", time: "", reason: "" })
                  }}>
                    Book Another Appointment
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-primary">
                Thank you for taking this step. We are here to support you.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
