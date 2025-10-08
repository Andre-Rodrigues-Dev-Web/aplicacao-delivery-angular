import { Injectable, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError, interval } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { 
  ChatRoom, 
  ChatMessage, 
  CreateChatRoomRequest, 
  SendMessageRequest,
  ChatRoomFilter,
  ChatRoomSort,
  ChatRoomListResponse,
  ChatMessagesResponse,
  ChatStats,
  TypingIndicator,
  ChatNotification
} from '../models/chat.model';
import { AuthService } from './auth.service';
import { UserRole } from '../enums/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private _currentChatRoom = signal<ChatRoom | null>(null);
  private _chatRooms = signal<ChatRoom[]>([]);
  private _messages = signal<ChatMessage[]>([]);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);
  private _unreadCount = signal(0);
  private _typingUsers = signal<TypingIndicator[]>([]);
  private _isConnected = signal(false);

  // Computed signals
  readonly currentChatRoom = this._currentChatRoom.asReadonly();
  readonly chatRooms = this._chatRooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly typingUsers = this._typingUsers.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();

  // Mock data for development
  private mockChatRooms: ChatRoom[] = [
    {
      id: 'chat-1',
      customerId: '2',
      customerName: 'andre',
      customerEmail: 'andrelaurentinomg@gmail.com',
      orderId: 'order-1',
      status: 'active',
      priority: 'medium',
      subject: 'Dúvida sobre pedido #1234',
      unreadCount: 2,
      assignedAdminId: '1',
      assignedAdminName: 'Administrador',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(Date.now() - 300000), // 5 minutes ago
      tags: ['pedido', 'entrega'],
      metadata: {
        orderValue: 45.90,
        customerType: 'returning',
        source: 'order'
      }
    }
  ];

  private mockMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      chatRoomId: 'chat-1',
      senderId: '2',
      senderName: 'andre',
      senderRole: 'customer',
      content: 'Olá, gostaria de saber sobre o status do meu pedido #1234',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    },
    {
      id: 'msg-2',
      chatRoomId: 'chat-1',
      senderId: '1',
      senderName: 'Administrador',
      senderRole: 'admin',
      content: 'Olá! Seu pedido está sendo preparado e deve sair para entrega em breve.',
      type: 'text',
      timestamp: new Date(Date.now() - 3300000),
      isRead: true
    },
    {
      id: 'msg-3',
      chatRoomId: 'chat-1',
      senderId: '2',
      senderName: 'andre',
      senderRole: 'customer',
      content: 'Obrigado! Quanto tempo mais ou menos para a entrega?',
      type: 'text',
      timestamp: new Date(Date.now() - 300000),
      isRead: false
    }
  ];

  constructor(private authService: AuthService) {
    this.initializeConnection();
    this.loadInitialData();
  }

  private initializeConnection(): void {
    // Simulate WebSocket connection
    setTimeout(() => {
      this._isConnected.set(true);
    }, 1000);

    // Simulate periodic updates
    interval(30000).subscribe(() => {
      this.checkForNewMessages();
    });
  }

  private loadInitialData(): void {
    this._chatRooms.set(this.mockChatRooms);
    this.updateUnreadCount();
  }

  // Chat Room Management
  getChatRooms(filter?: ChatRoomFilter, sort?: ChatRoomSort, page = 1, limit = 20): Observable<ChatRoomListResponse> {
    this._isLoading.set(true);
    
    return new Observable(observer => {
      setTimeout(() => {
        let filteredRooms = [...this.mockChatRooms];

        // Apply filters
        if (filter) {
          if (filter.status) {
            filteredRooms = filteredRooms.filter(room => room.status === filter.status);
          }
          if (filter.priority) {
            filteredRooms = filteredRooms.filter(room => room.priority === filter.priority);
          }
          if (filter.customerId) {
            filteredRooms = filteredRooms.filter(room => room.customerId === filter.customerId);
          }
          if (filter.assignedAdminId) {
            filteredRooms = filteredRooms.filter(room => room.assignedAdminId === filter.assignedAdminId);
          }
          if (filter.searchTerm) {
            const term = filter.searchTerm.toLowerCase();
            filteredRooms = filteredRooms.filter(room => 
              room.customerName.toLowerCase().includes(term) ||
              room.subject.toLowerCase().includes(term)
            );
          }
        }

        // Apply sorting
        if (sort) {
          filteredRooms.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sort.field) {
              case 'updatedAt':
                aValue = a.updatedAt.getTime();
                bValue = b.updatedAt.getTime();
                break;
              case 'createdAt':
                aValue = a.createdAt.getTime();
                bValue = b.createdAt.getTime();
                break;
              case 'priority':
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                aValue = priorityOrder[a.priority];
                bValue = priorityOrder[b.priority];
                break;
              case 'unreadCount':
                aValue = a.unreadCount;
                bValue = b.unreadCount;
                break;
              default:
                aValue = a.updatedAt.getTime();
                bValue = b.updatedAt.getTime();
            }

            if (sort.direction === 'asc') {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }

        // Apply pagination
        const total = filteredRooms.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

        this._isLoading.set(false);
        this._chatRooms.set(paginatedRooms);

        observer.next({
          chatRooms: paginatedRooms,
          total,
          page,
          limit,
          hasNext: endIndex < total,
          hasPrev: page > 1
        });
        observer.complete();
      }, 500);
    });
  }

  createChatRoom(request: CreateChatRoomRequest): Observable<ChatRoom> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentUser = this.authService.user();
        
        const newChatRoom: ChatRoom = {
          id: `chat-${Date.now()}`,
          customerId: request.customerId,
          customerName: currentUser?.name || 'Cliente',
          customerEmail: currentUser?.email || '',
          orderId: request.orderId,
          status: 'waiting',
          priority: request.priority || 'medium',
          subject: request.subject,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            source: request.source || 'manual'
          }
        };

        // Add initial message if provided
        if (request.initialMessage) {
          const initialMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            chatRoomId: newChatRoom.id,
            senderId: request.customerId,
            senderName: newChatRoom.customerName,
            senderRole: 'customer',
            content: request.initialMessage,
            type: 'text',
            timestamp: new Date(),
            isRead: false
          };
          
          this.mockMessages.push(initialMessage);
          newChatRoom.lastMessage = initialMessage;
          newChatRoom.unreadCount = 1;
        }

        this.mockChatRooms.unshift(newChatRoom);
        this._chatRooms.set([...this.mockChatRooms]);
        this.updateUnreadCount();

        observer.next(newChatRoom);
        observer.complete();
      }, 500);
    });
  }

  getChatRoomById(chatRoomId: string): Observable<ChatRoom | null> {
    return of(this.mockChatRooms.find(room => room.id === chatRoomId) || null);
  }

  // Message Management
  getMessages(chatRoomId: string, page = 1, limit = 50): Observable<ChatMessagesResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const roomMessages = this.mockMessages
          .filter(msg => msg.chatRoomId === chatRoomId)
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        const total = roomMessages.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMessages = roomMessages.slice(startIndex, endIndex);

        this._messages.set(paginatedMessages);

        observer.next({
          messages: paginatedMessages,
          total,
          page,
          limit,
          hasNext: endIndex < total,
          hasPrev: page > 1
        });
        observer.complete();
      }, 300);
    });
  }

  sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentUser = this.authService.user();
        if (!currentUser) {
          observer.error('Usuário não autenticado');
          return;
        }

        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          chatRoomId: request.chatRoomId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role === UserRole.ADMIN ? 'admin' : 'customer',
          content: request.content,
          type: request.type || 'text',
          timestamp: new Date(),
          isRead: false,
          metadata: request.metadata
        };

        this.mockMessages.push(newMessage);
        
        // Update chat room
        const chatRoom = this.mockChatRooms.find(room => room.id === request.chatRoomId);
        if (chatRoom) {
          chatRoom.lastMessage = newMessage;
          chatRoom.updatedAt = new Date();
          if (newMessage.senderRole === 'customer') {
            chatRoom.unreadCount += 1;
          }
          if (chatRoom.status === 'waiting') {
            chatRoom.status = 'active';
          }
        }

        this._messages.update(messages => [...messages, newMessage]);
        this._chatRooms.set([...this.mockChatRooms]);
        this.updateUnreadCount();

        observer.next(newMessage);
        observer.complete();
      }, 300);
    });
  }

  markMessagesAsRead(chatRoomId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mark messages as read
        this.mockMessages
          .filter(msg => msg.chatRoomId === chatRoomId && !msg.isRead)
          .forEach(msg => msg.isRead = true);

        // Update chat room unread count
        const chatRoom = this.mockChatRooms.find(room => room.id === chatRoomId);
        if (chatRoom) {
          chatRoom.unreadCount = 0;
        }

        this._chatRooms.set([...this.mockChatRooms]);
        this.updateUnreadCount();

        observer.next(true);
        observer.complete();
      }, 200);
    });
  }

  // Chat Room Actions
  assignChatRoom(chatRoomId: string, adminId: string, adminName: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const chatRoom = this.mockChatRooms.find(room => room.id === chatRoomId);
        if (chatRoom) {
          chatRoom.assignedAdminId = adminId;
          chatRoom.assignedAdminName = adminName;
          chatRoom.status = 'active';
          chatRoom.updatedAt = new Date();
          
          this._chatRooms.set([...this.mockChatRooms]);
          observer.next(true);
        } else {
          observer.error('Chat room não encontrado');
        }
        observer.complete();
      }, 300);
    });
  }

  closeChatRoom(chatRoomId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const chatRoom = this.mockChatRooms.find(room => room.id === chatRoomId);
        if (chatRoom) {
          chatRoom.status = 'closed';
          chatRoom.closedAt = new Date();
          chatRoom.updatedAt = new Date();
          
          this._chatRooms.set([...this.mockChatRooms]);
          observer.next(true);
        } else {
          observer.error('Chat room não encontrado');
        }
        observer.complete();
      }, 300);
    });
  }

  // Utility Methods
  setCurrentChatRoom(chatRoom: ChatRoom | null): void {
    this._currentChatRoom.set(chatRoom);
    if (chatRoom) {
      this.markMessagesAsRead(chatRoom.id).subscribe();
    }
  }

  private updateUnreadCount(): void {
    const total = this.mockChatRooms.reduce((sum, room) => sum + room.unreadCount, 0);
    this._unreadCount.set(total);
  }

  private checkForNewMessages(): void {
    // Simulate receiving new messages
    // In a real app, this would be handled by WebSocket
  }

  // Typing Indicators
  startTyping(chatRoomId: string): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    const typingIndicator: TypingIndicator = {
      chatRoomId,
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping: true,
      timestamp: new Date()
    };

    this._typingUsers.update(users => {
      const filtered = users.filter(u => !(u.chatRoomId === chatRoomId && u.userId === currentUser.id));
      return [...filtered, typingIndicator];
    });
  }

  stopTyping(chatRoomId: string): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    this._typingUsers.update(users => 
      users.filter(u => !(u.chatRoomId === chatRoomId && u.userId === currentUser.id))
    );
  }

  getTypingUsers(chatRoomId: string): TypingIndicator[] {
    return this._typingUsers().filter(u => u.chatRoomId === chatRoomId);
  }

  // Stats
  getChatStats(): Observable<ChatStats> {
    return new Observable(observer => {
      setTimeout(() => {
        const stats: ChatStats = {
          totalActiveChats: this.mockChatRooms.filter(r => r.status === 'active').length,
          totalWaitingChats: this.mockChatRooms.filter(r => r.status === 'waiting').length,
          totalClosedChats: this.mockChatRooms.filter(r => r.status === 'closed').length,
          averageResponseTime: 15, // minutes
          totalUnreadMessages: this._unreadCount(),
          chatsByPriority: {
            low: this.mockChatRooms.filter(r => r.priority === 'low').length,
            medium: this.mockChatRooms.filter(r => r.priority === 'medium').length,
            high: this.mockChatRooms.filter(r => r.priority === 'high').length,
            urgent: this.mockChatRooms.filter(r => r.priority === 'urgent').length
          },
          chatsByStatus: {
            active: this.mockChatRooms.filter(r => r.status === 'active').length,
            closed: this.mockChatRooms.filter(r => r.status === 'closed').length,
            waiting: this.mockChatRooms.filter(r => r.status === 'waiting').length
          }
        };

        observer.next(stats);
        observer.complete();
      }, 300);
    });
  }
}