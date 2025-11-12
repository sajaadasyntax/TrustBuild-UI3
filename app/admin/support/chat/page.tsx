'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminApi } from '@/lib/adminApi';

import { 
  Loader2, 
  Search, 
  MessageSquare,
  User,
  Building2,
  Send,
  Mail,
  Phone,
  Plus,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

// Helper function to check admin permissions
function hasAnyPermission(userPermissions: string[] | null | undefined, required: string[]): boolean {
  if (!userPermissions) return false
  return required.some(perm => userPermissions.includes(perm))
}

interface Conversation {
  id: string;
  participant1: any;
  participant2: any;
  otherUser: any;
  lastMessage: any;
  messageCount: number;
  unreadCount: number;
  lastMessageAt: string;
}

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

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  customer?: {
    id: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  contractor?: {
    id: string;
    businessName?: string;
    businessAddress?: string;
  };
}

export default function AdminChatPage() {
  const router = useRouter();
  const { admin, loading: authLoading } = useAdminAuth();
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';
  const permissions = admin?.permissions || [];
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [messageContent, setMessageContent] = useState('');
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [usersForChat, setUsersForChat] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Route guard - check if admin has access to support
  useEffect(() => {
    if (!authLoading && admin) {
      const canAccessSupport = isSuperAdmin || hasAnyPermission(permissions, ['support:read', 'support:write'])
      if (!canAccessSupport) {
        router.push('/admin')
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the Support Chat page.",
          variant: "destructive",
        })
      }
    }
  }, [admin, authLoading, isSuperAdmin, permissions, router, toast])
  
  // Don't render if no access
  if (!authLoading && admin) {
    const canAccessSupport = isSuperAdmin || hasAnyPermission(permissions, ['support:read', 'support:write'])
    if (!canAccessSupport) {
      return null
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 100,
      };
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await adminApi.getConversations(params);
      setConversations(response.data?.conversations || []);
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
  }, [searchTerm, roleFilter, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchConversations();
    }
  }, [authLoading, fetchConversations]);

  const fetchConversation = useCallback(async (userId: string) => {
    try {
      setMessagesLoading(true);
      const response = await adminApi.getConversationWithUser(userId);
      setMessages(response.data?.messages || []);
      setUserDetails(response.data?.user || null);
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
  }, [toast]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    const otherUserId = conversation.otherUser.id;
    fetchConversation(otherUserId);
  };

  const fetchUsersForChat = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        limit: 100,
      };
      if (userRoleFilter !== 'all') {
        params.role = userRoleFilter;
      }
      if (userSearchTerm) {
        params.search = userSearchTerm;
      }
      const response = await adminApi.getUsersForChat(params);
      setUsersForChat(response.data?.users || []);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setUsersLoading(false);
    }
  }, [userSearchTerm, userRoleFilter, toast]);

  useEffect(() => {
    if (showNewConversationDialog) {
      const timeoutId = setTimeout(() => {
        fetchUsersForChat();
      }, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [showNewConversationDialog, userSearchTerm, userRoleFilter, fetchUsersForChat]);

  const handleStartNewConversation = async (userId: string) => {
    try {
      // Close dialog
      setShowNewConversationDialog(false);
      
      // Create a new conversation object
      const user = usersForChat.find(u => u.id === userId);
      if (!user) return;

      const newConversation: Conversation = {
        id: `${admin?.id}-${userId}`,
        participant1: admin,
        participant2: user,
        otherUser: user,
        lastMessage: null,
        messageCount: 0,
        unreadCount: 0,
        lastMessageAt: new Date().toISOString(),
      };

      setSelectedConversation(newConversation);
      setUserDetails(user);
      setMessages([]);
      
      // Fetch conversation (will be empty if new)
      await fetchConversation(userId);
      
      toast({
        title: 'Success',
        description: 'New conversation started',
      });
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await adminApi.sendMessage(
        selectedConversation.otherUser.id,
        messageContent.trim(),
        `Message from Admin`
      );
      setMessageContent('');
      // Refresh conversation
      await fetchConversation(selectedConversation.otherUser.id);
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

  const getRoleBadge = (role: string) => {
    if (role === 'CUSTOMER') {
      return <Badge variant="default">Customer</Badge>;
    } else if (role === 'CONTRACTOR') {
      return <Badge variant="secondary">Contractor</Badge>;
    } else {
      return <Badge variant="outline">Admin</Badge>;
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (roleFilter !== 'all' && conv.otherUser.role !== roleFilter) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        conv.otherUser.name?.toLowerCase().includes(searchLower) ||
        conv.otherUser.email?.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (authLoading) {
    return (
      <div className="container py-32">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Customer & Contractor Chat</h1>
          <p className="text-muted-foreground mt-2">
            View and manage conversations with customers and contractors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription>
                    {conversations.length} total conversations
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowNewConversationDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="CONTRACTOR">Contractors</option>
                </select>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {conversation.otherUser.role === 'CONTRACTOR' ? (
                              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {conversation.otherUser.contractor?.businessName || conversation.otherUser.name}
                            </span>
                            {getRoleBadge(conversation.otherUser.role)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content || 'No messages'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(conversation.lastMessageAt), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="flex-shrink-0">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedConversation.otherUser.role === 'CONTRACTOR' ? (
                          <Building2 className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                        {userDetails?.contractor?.businessName || userDetails?.name || 'User'}
                        {getRoleBadge(selectedConversation.otherUser.role)}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {userDetails?.email}
                          </span>
                          {userDetails?.customer?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {userDetails.customer.phone}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isAdmin = message.sender.role === 'ADMIN' || message.sender.role === 'SUPER_ADMIN';
                        const isFromAdmin = message.senderId === admin?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isFromAdmin
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="text-sm font-medium mb-1">
                                {isFromAdmin ? 'You' : message.sender.name}
                              </div>
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                              <div className={`text-xs mt-1 ${
                                isFromAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {format(new Date(message.createdAt), 'HH:mm')}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sending}
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
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm mt-2">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Select a customer or contractor to start a new conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="CUSTOMER">Customers</option>
                <option value="CONTRACTOR">Contractors</option>
              </select>
            </div>

            {/* Users List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : usersForChat.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                usersForChat.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartNewConversation(user.id)}
                    className="p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {user.role === 'CONTRACTOR' ? (
                        <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.contractor?.businessName || user.name}
                          </span>
                          {getRoleBadge(user.role)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

