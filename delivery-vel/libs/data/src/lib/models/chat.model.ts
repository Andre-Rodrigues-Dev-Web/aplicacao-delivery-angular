import { User } from './user.model';

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin' | 'support';
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  isRead: boolean;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    systemMessageType?: 'order_created' | 'payment_completed' | 'chat_started' | 'chat_ended';
  };
}

export interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  status: 'active' | 'closed' | 'waiting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  assignedAdminId?: string;
  assignedAdminName?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  tags?: string[];
  metadata?: {
    orderValue?: number;
    customerType?: 'new' | 'returning' | 'vip';
    source?: 'order' | 'support' | 'manual';
  };
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userRole: 'customer' | 'admin' | 'support';
  isOnline: boolean;
  lastSeen: Date;
  joinedAt: Date;
}

export interface CreateChatRoomRequest {
  customerId: string;
  orderId?: string;
  subject: string;
  initialMessage?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  source?: 'order' | 'support' | 'manual';
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
  };
}

export interface ChatRoomFilter {
  status?: 'active' | 'closed' | 'waiting';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedAdminId?: string;
  customerId?: string;
  orderId?: string;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasUnreadMessages?: boolean;
}

export interface ChatRoomSort {
  field: 'updatedAt' | 'createdAt' | 'priority' | 'unreadCount';
  direction: 'asc' | 'desc';
}

export interface ChatRoomListResponse {
  chatRooms: ChatRoom[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ChatNotification {
  id: string;
  chatRoomId: string;
  messageId: string;
  recipientId: string;
  type: 'new_message' | 'chat_assigned' | 'chat_closed' | 'mention';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatStats {
  totalActiveChats: number;
  totalWaitingChats: number;
  totalClosedChats: number;
  averageResponseTime: number;
  totalUnreadMessages: number;
  chatsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  chatsByStatus: {
    active: number;
    closed: number;
    waiting: number;
  };
}

export interface TypingIndicator {
  chatRoomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}