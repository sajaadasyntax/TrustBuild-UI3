'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { messagesApi } from '@/lib/api';
import { 
  Loader2, 
  Search, 
  MessageSquare,
  Send,
  Mail,
  Plus,
  ArrowLeft,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  subject?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Conversation {
  adminId: string;
  adminName: string;
  lastMessage?: Message;
  unreadCount: number;
  lastMessageAt: string;
}

export default function CustomerMessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all admins
  const fetchAdmins = useCallback(async () => {
    try {
      setAdminsLoading(true);
      const response = await messagesApi.getAdmins();
      setAdmins(response.data?.admins || []);
    } catch (error: any) {
      console.error('Failed to fetch admins:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load admins',
        variant: 'destructive',
      });
    } finally {
      setAdminsLoading(false);
    }
  }, [toast]);

  // Fetch conversations (grouped by admin)
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getAll('inbox', { limit: 100 });
      const inboxMessages = response.data?.messages || [];
      
      // Group messages by admin (sender or recipient)
      const conversationMap = new Map<string, Conversation>();
      
      inboxMessages.forEach((msg: Message) => {
        // Determine which admin this message is with
        const adminId = msg.sender.role === 'ADMIN' || msg.sender.role === 'SUPER_ADMIN' 
          ? msg.sender.id 
          : msg.recipient.role === 'ADMIN' || msg.recipient.role === 'SUPER_ADMIN'
          ? msg.recipient.id
          : null;
        
        if (!adminId) return;
        
        const adminName = msg.sender.role === 'ADMIN' || msg.sender.role === 'SUPER_ADMIN'
          ? msg.sender.name
          : msg.recipient.name;
        
        if (!conversationMap.has(adminId)) {
          conversationMap.set(adminId, {
            adminId,
            adminName,
            unreadCount: 0,
            lastMessageAt: msg.createdAt,
          });
        }
        
        const conv = conversationMap.get(adminId)!;
        if (!conv.lastMessage || new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
          conv.lastMessage = msg;
          conv.lastMessageAt = msg.createdAt;
        }
        if (!msg.isRead && msg.recipientId === user?.id) {
          conv.unreadCount++;
        }
      });
      
      // Also check sent messages
      const sentResponse = await messagesApi.getAll('sent', { limit: 100 });
      const sentMessages = sentResponse.data?.messages || [];
      
      sentMessages.forEach((msg: Message) => {
        const adminId = msg.recipient.role === 'ADMIN' || msg.recipient.role === 'SUPER_ADMIN'
          ? msg.recipient.id
          : null;
        
        if (!adminId) return;
        
        const adminName = msg.recipient.name;
        
        if (!conversationMap.has(adminId)) {
          conversationMap.set(adminId, {
            adminId,
            adminName,
            unreadCount: 0,
            lastMessageAt: msg.createdAt,
          });
        }
        
        const conv = conversationMap.get(adminId)!;
        if (!conv.lastMessage || new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
          conv.lastMessage = msg;
          conv.lastMessageAt = msg.createdAt;
        }
      });
      
      const conversationsList = Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      
      setConversations(conversationsList);
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchConversations();
      fetchAdmins();
    }
  }, [authLoading, user, fetchConversations, fetchAdmins]);

  const fetchConversation = useCallback(async (adminId: string) => {
    try {
      setMessagesLoading(true);
      const response = await messagesApi.getConversation(adminId);
      setMessages(response.data?.messages || []);
      
      // Find admin details
      const admin = admins.find(a => a.id === adminId);
      if (admin) {
        setSelectedAdmin(admin);
      }
    } catch (error: any) {
      console.error('Failed to fetch conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load conversation',
        variant: 'destructive',
      });
    } finally {
      setMessagesLoading(false);
    }
  }, [admins, toast]);

  const handleSelectConversation = (adminId: string) => {
    setSelectedAdminId(adminId);
    fetchConversation(adminId);
  };

  const handleStartNewConversation = (admin: Admin) => {
    setSelectedAdminId(admin.id);
    setSelectedAdmin(admin);
    setMessages([]);
    setShowNewMessageDialog(false);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedAdminId || sending) return;

    try {
      setSending(true);
      await messagesApi.send({
        recipientId: selectedAdminId,
        content: messageContent.trim(),
        subject: messageSubject.trim() || undefined,
      });
      setMessageContent('');
      setMessageSubject('');
      // Refresh conversation
      await fetchConversation(selectedAdminId);
      // Refresh conversations list
      await fetchConversations();
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        conv.adminName?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const filteredAdmins = admins.filter((admin) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        admin.name?.toLowerCase().includes(searchLower) ||
        admin.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading messages...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communicate with TrustBuild administrators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowNewMessageDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a new conversation with an admin</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.adminId}
                      onClick={() => handleSelectConversation(conv.adminId)}
                      className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                        selectedAdminId === conv.adminId ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{conv.adminName}</span>
                          <Badge variant="outline" className="text-xs">Admin</Badge>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                            {conv.lastMessage.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(conv.lastMessageAt), 'MMM d, yyyy')}
                          </p>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2">
          {selectedAdminId ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedAdmin?.name || 'Admin'}
                    </CardTitle>
                    <CardDescription>{selectedAdmin?.email}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAdminId(null);
                      setSelectedAdmin(null);
                      setMessages([]);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation below</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => {
                        const isSent = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isSent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.subject && (
                                <div className="font-semibold mb-1 text-sm">{msg.subject}</div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}
                              >
                                {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="space-y-2 border-t pt-4">
                  <Input
                    placeholder="Subject (optional)"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSendMessage();
                        }
                      }}
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sending}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to send
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list or start a new one</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Select an administrator to message
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {adminsLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <p>No admins found</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredAdmins.map((admin) => (
                  <button
                    key={admin.id}
                    onClick={() => handleStartNewConversation(admin)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{admin.name}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                      <Badge variant="outline">Admin</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

