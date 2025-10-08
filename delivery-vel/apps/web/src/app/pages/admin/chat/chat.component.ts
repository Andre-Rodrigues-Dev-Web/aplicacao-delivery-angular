import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '@delivery-vel/data';
import { 
  ChatMessage, 
  ChatRoom, 
  ChatParticipant, 
  SendMessageRequest 
} from '../../../models/chat.model';

// Removendo interfaces duplicadas - usando as do modelo
// As interfaces ChatMessage, ChatAttachment, etc. já estão definidas em chat.model.ts

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>Conversas</h3>
          <div class="chat-stats">
            <span class="stat">
              <span class="count">{{ getActiveConversationsCount() }}</span>
              <span class="label">Ativas</span>
            </span>
            <span class="stat">
              <span class="count">{{ getTotalUnreadCount() }}</span>
              <span class="label">Não lidas</span>
            </span>
          </div>
        </div>

        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar conversas..." 
            [(ngModel)]="searchTerm"
            (input)="filterConversations()"
          >
        </div>

        <div class="status-filters">
          <button 
            class="filter-btn" 
            [class.active]="statusFilter === 'all'"
            (click)="setStatusFilter('all')"
          >
            Todas
          </button>
          <button 
            class="filter-btn" 
            [class.active]="statusFilter === 'active'"
            (click)="setStatusFilter('active')"
          >
            Ativas
          </button>
          <button 
            class="filter-btn" 
            [class.active]="statusFilter === 'pending'"
            (click)="setStatusFilter('pending')"
          >
            Pendentes
          </button>
        </div>

        <div class="conversations-list">
          <div 
            class="conversation-item" 
            *ngFor="let chatRoom of filteredChatRooms()"
            [class.active]="selectedChatRoom?.id === chatRoom.id"
            [class.unread]="chatRoom.unreadCount > 0"
            (click)="selectChatRoom(chatRoom)"
          >
            <div class="conversation-avatar">
              <div class="avatar-circle">
                {{ getInitials(getCustomerName(chatRoom)) }}
              </div>
              <div 
                class="status-indicator" 
                [class.active]="chatRoom.status === 'active'"
                [class.pending]="chatRoom.status === 'pending'"
                [class.closed]="chatRoom.status === 'closed'"
              ></div>
            </div>

            <div class="conversation-info">
              <div class="conversation-header">
                <h4 class="customer-name">{{ getCustomerName(chatRoom) }}</h4>
                <span class="timestamp">{{ formatTime(chatRoom.updatedAt) }}</span>
              </div>
              <p class="last-message">{{ chatRoom.lastMessage || 'Nova conversa' }}</p>
              <div class="conversation-meta">
                <span class="customer-email">{{ getCustomerEmail(chatRoom) }}</span>
                <span class="unread-badge" *ngIf="chatRoom.unreadCount > 0">
                  {{ chatRoom.unreadCount }}
                </span>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="filteredChatRooms().length === 0">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>Nenhuma conversa encontrada</p>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-header" *ngIf="selectedChatRoom">
          <div class="customer-info">
            <div class="customer-avatar">
              {{ getInitials(getCustomerName(selectedChatRoom)) }}
            </div>
            <div class="customer-details">
              <h3>{{ getCustomerName(selectedChatRoom) }}</h3>
              <p>{{ getCustomerEmail(selectedChatRoom) }}</p>
            </div>
          </div>

          <div class="chat-actions">
            <button 
              class="action-btn"
              [class.active]="selectedChatRoom.status === 'active'"
              (click)="updateChatRoomStatus(selectedChatRoom, 'active')"
              title="Marcar como ativa"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </button>
            <button 
              class="action-btn"
              [class.active]="selectedChatRoom.status === 'closed'"
              (click)="updateChatRoomStatus(selectedChatRoom, 'closed')"
              title="Fechar conversa"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,11 12,14 22,4"></polyline>
                <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="messages-container" #messagesContainer *ngIf="selectedChatRoom">
          <div class="messages-list">
            <div 
              class="message" 
              *ngFor="let message of currentMessages()"
              [class.sent]="message.senderType === 'admin'"
              [class.received]="message.senderType === 'customer'"
            >
              <div class="message-content">
                <div class="message-bubble">
                  <p>{{ message.content }}</p>
                </div>
                <div class="message-info">
                  <span class="sender">{{ message.senderName }}</span>
                  <span class="timestamp">{{ formatMessageTime(message.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="message-input" *ngIf="selectedChatRoom">
          <div class="input-container">
            <button class="attachment-btn" title="Anexar arquivo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path>
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Digite sua mensagem..." 
              [(ngModel)]="newMessage"
              (keydown.enter)="sendMessage()"
              #messageInput
            >
            <button 
              class="send-btn" 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim()"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </div>

        <div class="no-conversation" *ngIf="!selectedChatRoom">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3>Selecione uma conversa</h3>
          <p>Escolha uma conversa da lista para começar a responder aos clientes.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      height: calc(100vh - 120px);
      background: white;
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chat-sidebar {
      width: 350px;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .sidebar-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
    }

    .chat-stats {
      display: flex;
      gap: 1rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .count {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .label {
      font-size: 0.75rem;
      color: #64748b;
    }

    .search-box {
      position: relative;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .search-box svg {
      position: absolute;
      left: 1.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .search-box input {
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .status-filters {
      display: flex;
      padding: 1rem;
      gap: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #f8fafc;
    }

    .filter-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;
    }

    .conversation-item {
      display: flex;
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .conversation-item:hover {
      background: #f8fafc;
    }

    .conversation-item.active {
      background: #eff6ff;
      border-right: 3px solid #3b82f6;
    }

    .conversation-item.unread {
      background: #fefce8;
    }

    .conversation-avatar {
      position: relative;
      margin-right: 0.75rem;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .status-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .status-indicator.active {
      background: #10b981;
    }

    .status-indicator.pending {
      background: #f59e0b;
    }

    .status-indicator.closed {
      background: #6b7280;
    }

    .conversation-info {
      flex: 1;
      min-width: 0;
    }

    .conversation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .customer-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      truncate: true;
    }

    .timestamp {
      font-size: 0.75rem;
      color: #64748b;
    }

    .last-message {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.5rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conversation-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .customer-email {
      font-size: 0.75rem;
      color: #64748b;
    }

    .unread-badge {
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 1rem;
      min-width: 20px;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      color: #cbd5e1;
    }

    .empty-state h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
    }

    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .customer-info {
      display: flex;
      align-items: center;
    }

    .customer-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #3b82f6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: 1rem;
    }

    .customer-details h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .customer-details p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.25rem 0;
    }

    .phone {
      font-size: 0.75rem;
      color: #64748b;
    }

    .chat-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      color: #64748b;
    }

    .action-btn:hover {
      background: #f1f5f9;
      color: #374151;
    }

    .action-btn.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      display: flex;
    }

    .message.sent {
      justify-content: flex-end;
    }

    .message.received {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 70%;
    }

    .message-bubble {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      margin-bottom: 0.25rem;
    }

    .message.sent .message-bubble {
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 0.25rem;
    }

    .message.received .message-bubble {
      background: #f1f5f9;
      color: #1e293b;
      border-bottom-left-radius: 0.25rem;
    }

    .message-bubble p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .message-attachments {
      margin-top: 0.5rem;
    }

    .attachment {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.75rem;
    }

    .message.received .attachment {
      background: rgba(0, 0, 0, 0.05);
    }

    .message-info {
      display: flex;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .message.sent .message-info {
      justify-content: flex-end;
    }

    .message-input {
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      padding: 0.5rem;
    }

    .attachment-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: #64748b;
      transition: all 0.2s;
    }

    .attachment-btn:hover {
      background: #f1f5f9;
      color: #374151;
    }

    .input-container input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.875rem;
      padding: 0.5rem;
    }

    .send-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .send-btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
    }

    .no-conversation {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      text-align: center;
    }

    .no-conversation svg {
      margin-bottom: 1rem;
      color: #cbd5e1;
    }

    .no-conversation h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .no-conversation p {
      margin: 0;
      max-width: 300px;
    }

    @media (max-width: 768px) {
      .chat-container {
        flex-direction: column;
        height: auto;
      }

      .chat-sidebar {
        width: 100%;
        max-height: 300px;
      }

      .chat-main {
        min-height: 400px;
      }

      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class AdminChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private chatService = inject(ChatService);

  chatRooms = this.chatService.chatRooms;
  filteredChatRooms = signal<ChatRoom[]>([]);
  selectedChatRoom: ChatRoom | null = null;
  currentMessages = signal<ChatMessage[]>([]);
  searchTerm = '';
  statusFilter = 'all';
  newMessage = '';

  ngOnInit() {
    this.loadChatRooms();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private loadChatRooms() {
    this.chatService.getChatRooms().subscribe(rooms => {
      this.filteredChatRooms.set(rooms);
    });
  }
    // Removendo dados mock - agora usando ChatService
  }

  filterConversations() {
    let filtered = this.chatRooms();

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(room => 
        room.participants.some(p => 
          p.name.toLowerCase().includes(term) || 
          p.email?.toLowerCase().includes(term)
        )
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === this.statusFilter);
    }

    this.filteredChatRooms.set(filtered);
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
    this.filterConversations();
  }

  selectChatRoom(chatRoom: ChatRoom) {
    this.selectedChatRoom = chatRoom;
    
    // Carregar mensagens da sala
    this.chatService.getChatMessages(chatRoom.id).subscribe(messages => {
      this.currentMessages.set(messages);
    });

    // Marcar mensagens como lidas
    this.chatService.markMessagesAsRead(chatRoom.id, 'admin').subscribe();
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChatRoom) return;

    const messageRequest: SendMessageRequest = {
      chatRoomId: this.selectedChatRoom.id,
      senderId: 'admin1',
      senderName: 'Atendente',
      message: this.newMessage.trim(),
      senderType: 'admin'
    };

    this.chatService.sendMessage(messageRequest).subscribe(message => {
      const currentMessages = this.currentMessages();
      this.currentMessages.set([...currentMessages, message]);
      this.newMessage = '';
    });
  }

  updateChatRoomStatus(chatRoom: ChatRoom, status: 'active' | 'closed' | 'pending') {
    this.chatService.closeChatRoom(chatRoom.id).subscribe(() => {
      chatRoom.status = status;
      console.log(`Conversa com ${this.getCustomerName(chatRoom)} marcada como ${status}`);
    });
  }

  getActiveConversationsCount(): number {
    return this.chatRooms().filter(room => room.status === 'active').length;
  }

  getTotalUnreadCount(): number {
    return this.chatRooms().reduce((total, room) => total + room.unreadCount, 0);
  }

  getCustomerName(chatRoom: ChatRoom): string {
    const customer = chatRoom.participants.find(p => p.type === 'customer');
    return customer?.name || 'Cliente';
  }

  getCustomerEmail(chatRoom: ChatRoom): string {
    const customer = chatRoom.participants.find(p => p.type === 'customer');
    return customer?.email || '';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }



  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}