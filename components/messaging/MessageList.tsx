'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail, Send, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  subject?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  recipient: {
    id: string;
    name: string;
    role: string;
  };
}

export default function MessageList({ type = 'inbox' }: { type?: 'inbox' | 'sent' }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, [type]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages?type=${type}`);
      setMessages(response.data.data.messages);
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`);
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {type === 'inbox' ? 'Inbox' : 'Sent Messages'}
            </CardTitle>
            {type === 'inbox' && unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} Unread</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !message.isRead && type === 'inbox' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {!message.isRead && type === 'inbox' && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                          <span className="font-semibold">
                            {type === 'inbox' ? `From: ${message.sender.name}` : `To: ${message.recipient.name}`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {type === 'inbox' ? message.sender.role : message.recipient.role}
                          </Badge>
                        </div>
                        {message.subject && (
                          <h4 className="font-medium mb-1">{message.subject}</h4>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!message.isRead && type === 'inbox' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(message.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = `/messages/${message.id}`}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

