"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Heart,
  MessageCircle,
  Send,
  LogOut,
  ArrowLeft,
  Loader,
  Clock,
  Users,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  conversationId: string
  senderEmail: string
  senderName: string
  senderType: "student" | "faculty" | "guidance" | "hr"
  recipientEmail: string
  recipientType: "guidance" | "hr"
  content: string
  timestamp: string
  read: boolean
  appointmentId?: string
}

interface Conversation {
  id: string
  userEmail: string
  userName: string
  userType: "student" | "faculty"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface AdminData {
  email: string
  office: string
  name: string
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminData | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const adminData = localStorage.getItem("campcon_admin")
    if (!adminData) {
      router.push("/admin/login")
      return
    }
    const parsedAdmin = JSON.parse(adminData)
    setAdmin(parsedAdmin)

    const timer = setInterval(() => {
      loadMessages(parsedAdmin)
    }, 2000)

    return () => clearInterval(timer)
  }, [router])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const loadMessages = (adminData: AdminData) => {
    const allMessages = localStorage.getItem("campcon_messages")
    const adminMessages = allMessages ? JSON.parse(allMessages) : []

    const adminConversations: { [key: string]: Conversation } = {}

    adminMessages.forEach((msg: Message) => {
      // Check if message is for this office or from this office
      const officeIdentifier = `${adminData.office}-office`
      const isForThisOffice = adminData.office === "super" || msg.recipientEmail === officeIdentifier
      const isFromThisOfficeToUser = adminData.office === "super" || (msg.senderType === adminData.office && msg.recipientEmail && !msg.recipientEmail.includes("-office"))

      if (isForThisOffice || isFromThisOfficeToUser) {
        const convId = msg.senderEmail === adminData.email ? msg.recipientEmail : msg.senderEmail

        if (!adminConversations[convId]) {
          const senderName = msg.senderEmail === adminData.email ? "You" : msg.senderName
          const senderType = msg.senderEmail === adminData.email ? msg.recipientType : msg.senderType
          
          adminConversations[convId] = {
            id: convId,
            userEmail: convId,
            userName: senderName,
            userType: senderType as "student" | "faculty",
            lastMessage: msg.content,
            lastMessageTime: msg.timestamp,
            unreadCount: 0,
          }
        }

        // Count unread messages sent to this office
        if (msg.recipientEmail === officeIdentifier && !msg.read) {
          adminConversations[convId].unreadCount += 1
        }

        if (new Date(msg.timestamp).getTime() > new Date(adminConversations[convId].lastMessageTime).getTime()) {
          adminConversations[convId].lastMessage = msg.content
          adminConversations[convId].lastMessageTime = msg.timestamp
        }
      }
    })

    console.log("[v0] Admin office:", adminData.office, "conversations found:", Object.keys(adminConversations).length)

    setConversations(Object.values(adminConversations).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    ))

    if (selectedConversation) {
      const officeIdentifier = `${adminData.office}-office`
      const convMessages = adminMessages.filter(
        (msg: Message) =>
          (msg.senderEmail === selectedConversation || msg.recipientEmail === selectedConversation) &&
          (msg.recipientEmail === officeIdentifier || msg.senderType === adminData.office || adminData.office === "super")
      )
      console.log("[v0] Conversation messages loaded:", convMessages.length)
      
      setMessages(convMessages.sort((a: Message, b: Message) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ))

      convMessages.forEach((msg: Message) => {
        if (msg.recipientEmail === officeIdentifier && !msg.read) {
          msg.read = true
        }
      })

      localStorage.setItem("campcon_messages", JSON.stringify(adminMessages))
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !admin || !selectedConversation) return

    setIsLoading(true)

    const userConv = conversations.find((c) => c.id === selectedConversation)
    if (!userConv) return

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderEmail: admin.email,
      senderName: admin.name,
      senderType: admin.office as "guidance" | "hr",
      recipientEmail: userConv.userEmail,
      recipientType: userConv.userType as "student" | "faculty",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    }

    const allMessages = localStorage.getItem("campcon_messages")
    const messages = allMessages ? JSON.parse(allMessages) : []
    messages.push(message)
    localStorage.setItem("campcon_messages", JSON.stringify(messages))

    setNewMessage("")
    setIsLoading(false)
    loadMessages(admin)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Messages</h1>
            </div>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Student & Faculty Messages</CardTitle>
                <CardDescription>
                  {admin?.office === "super" ? "All departments" : `${admin?.office} Office`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="space-y-2 p-4">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                          selectedConversation === conv.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground truncate">{conv.userName}</p>
                              <Badge variant="outline" className="text-xs">
                                {conv.userType === "student" ? "Student" : "Faculty"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge className="shrink-0">{conv.unreadCount}</Badge>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="border-border/50 h-[600px] flex flex-col">
                <CardHeader className="border-b border-border/40">
                  <div>
                    <CardTitle className="text-lg">
                      {conversations.find((c) => c.id === selectedConversation)?.userName}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <Mail className="h-3 w-3" />
                        {selectedConversation}
                      </div>
                    </CardDescription>
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center py-12">
                        <p className="text-muted-foreground">No messages in this conversation</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${msg.senderEmail === admin?.email ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`rounded-lg px-3 py-2 max-w-xs break-words ${
                              msg.senderEmail === admin?.email
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground border border-border/40"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                              <Clock className="h-3 w-3" />
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <div className="border-t border-border/40 p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="h-10"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !newMessage.trim()}
                      className="h-10 px-4"
                    >
                      {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-border/50 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Select a user to view or start a conversation</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
