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
  Check,
  CheckCheck,
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
  recipientType: "guidance" | "hr"
  recipientName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

interface UserData {
  email: string
  type: string
  name: string
  studentId?: string
  program?: string
}

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem("campcon_user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))

    const timer = setInterval(() => {
      loadMessages()
    }, 2000)

    return () => clearInterval(timer)
  }, [router])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const loadMessages = () => {
    if (!user) return

    const allMessages = localStorage.getItem("campcon_messages")
    const userMessages = allMessages ? JSON.parse(allMessages) : []

    const userConversations: { [key: string]: Conversation } = {}

    userMessages.forEach((msg: Message) => {
      if (msg.senderEmail === user.email || msg.recipientEmail === user.email) {
        // Determine which office this conversation is with
        let recipientType: "guidance" | "hr" = "guidance"
        
        if (msg.senderEmail === user.email) {
          // User sent this message, get the recipient type
          recipientType = msg.recipientType
        } else {
          // User received this message, get sender type (which is the office)
          recipientType = msg.senderType as "guidance" | "hr"
        }

        const convId = recipientType

        if (!userConversations[convId]) {
          userConversations[convId] = {
            id: convId,
            recipientType: recipientType,
            recipientName: `${recipientType.charAt(0).toUpperCase() + recipientType.slice(1)} Office`,
            lastMessage: msg.content,
            lastMessageTime: msg.timestamp,
            unreadCount: 0,
          }
        }

        if (msg.recipientEmail === user.email && !msg.read) {
          userConversations[convId].unreadCount += 1
        }

        if (new Date(msg.timestamp).getTime() > new Date(userConversations[convId].lastMessageTime).getTime()) {
          userConversations[convId].lastMessage = msg.content
          userConversations[convId].lastMessageTime = msg.timestamp
        }
      }
    })

    setConversations(Object.values(userConversations).sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    ))

    if (selectedConversation) {
      const convMessages = userMessages.filter(
        (msg: Message) =>
          (msg.senderEmail === user.email || msg.recipientEmail === user.email) &&
          ((msg.senderEmail === user.email && msg.conversationId === selectedConversation) ||
            (msg.recipientEmail === user.email && msg.conversationId === selectedConversation))
      )
      setMessages(convMessages.sort((a: Message, b: Message) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ))

      convMessages.forEach((msg: Message) => {
        if (msg.recipientEmail === user.email && !msg.read) {
          msg.read = true
        }
      })

      localStorage.setItem("campcon_messages", JSON.stringify(userMessages))
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return

    setIsLoading(true)

    const recipientType = selectedConversation as "guidance" | "hr"

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderEmail: user.email,
      senderName: user.name,
      senderType: user.type as "student" | "faculty",
      recipientEmail: `${recipientType}-office`,
      recipientType: recipientType,
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
    loadMessages()
  }

  const createNewConversation = (recipientType: "guidance" | "hr") => {
    const convId = `${recipientType}-office`
    setSelectedConversation(convId)

    if (!conversations.find((c) => c.id === convId)) {
      const newConv: Conversation = {
        id: convId,
        recipientType: recipientType,
        recipientName: `${recipientType.charAt(0).toUpperCase() + recipientType.slice(1)} Office`,
        lastMessage: "",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
      }
      setConversations([newConv, ...conversations])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
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
          <Link href="/dashboard">
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
                <CardTitle className="text-lg">Conversations</CardTitle>
                <CardDescription>Your active chats</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="space-y-2 p-4">
                  {conversations.length === 0 ? (
                    <div className="space-y-3 text-center py-8">
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => createNewConversation("guidance")}>
                          Message Guidance Office
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => createNewConversation("hr")}>
                          Message HR Office
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {conversations.map((conv) => (
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
                              <p className="font-medium text-foreground truncate">{conv.recipientName}</p>
                              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                              <Badge className="shrink-0">{conv.unreadCount}</Badge>
                            )}
                          </div>
                        </button>
                      ))}
                      <div className="border-t border-border/40 pt-3 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => createNewConversation("guidance")}
                        >
                          + Guidance Office
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs mt-2"
                          onClick={() => createNewConversation("hr")}
                        >
                          + HR Office
                        </Button>
                      </div>
                    </>
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
                  <CardTitle className="text-lg">
                    {conversations.find((c) => c.id === selectedConversation)?.recipientName}
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center py-12">
                        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${msg.senderEmail === user?.email ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`rounded-lg px-3 py-2 max-w-xs break-words ${
                              msg.senderEmail === user?.email
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
                      placeholder="Type your message..."
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
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
