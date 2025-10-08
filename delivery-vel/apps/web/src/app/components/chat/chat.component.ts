import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ChatService } from '@delivery-vel/data';
import { AuthService } from '@delivery-vel/data';
import { 
  ChatRoom, 
  ChatMessage, 
  SendMessageRequest,
  CreateChatRoomRequest 
} from '@delivery-vel/data';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container" [class.chat-open]="isOpen()">
      <!-- Chat Toggle Button -->
      <button 
        class="chat-toggle-btn"
        (click)="toggleChat()"
        [class.has-unread]="hasUnreadMessages()"
        type="button"
        aria-label="Abrir chat">
        <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="unread-badge" *ngIf="hasUnreadMessages()">
          {{ unreadCount() }}
        </span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="isOpen()">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-title">
            <h3>Atendimento ao Cliente</h3>
            <div class="chat-status" [class]="connectionStatus()">
              <span class="status-dot"></span>
              {{ getStatusText() }}
            </div>
          </div>
          <button 
            class="close-btn"
            (click)="closeChat()"
            type="button"
            aria-label="Fechar chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" #messagesContainer>
          <div class="messages-list">
            <!-- Welcome Message -->
            <div class="message system-message" *ngIf="!currentChatRoom()">
              <div class="message-content">
                <p>Olá! Como podemos ajudá-lo hoje?</p>
                <p class="message-subtitle">Digite sua mensagem abaixo para iniciar uma conversa com nossa equipe.</p>
              </div>
            </div>

            <!-- Chat Messages -->
            <div 
              class="message"
              [class.own-message]="message.senderRole === 'customer'"
              [class.admin-message]="message.senderRole === 'admin'"
              *ngFor="let message of messages(); trackBy: trackByMessageId">
              
              <div class="message-avatar" *ngIf="message.senderRole === 'admin'">
                <span>{{ getInitials(message.senderName) }}</span>
              </div>
              
              <div class="message-content">
                <div class="message-header" *ngIf="message.senderRole === 'admin'">
                  <span class="sender-name">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
                
                <div class="message-text">{{ message.content }}</div>
                
                <div class="message-footer" *ngIf="message.senderRole === 'customer'">
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                  <span class="message-status" *ngIf="message.isRead">✓</span>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div class="message admin-message typing-indicator" *ngIf="isTyping()">
              <div class="message-avatar">
                <span>A</span>
              </div>
              <div class="message-content">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input">
          <div class="input-container">
            <textarea
              #messageInput
              [(ngModel)]="newMessage"
              (keydown)="onKeyDown($event)"
              (input)="onTyping()"
              placeholder="Digite sua mensagem..."
              rows="1"
              maxlength="1000"
              [disabled]="isLoading()"></textarea>
            
            <button 
              class="send-btn"
              (click)="sendMessage()"
              [disabled]="!canSendMessage()"
              type="button"
              aria-label="Enviar mensagem">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
            </button>
          </div>
          
          <div class="input-footer">
            <span class="char-count">{{ newMessage.length }}/1000</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .chat-toggle-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chat-toggle-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .chat-icon {
      width: 24px;
      height: 24px;
    }

    .unread-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ff4757;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }

    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .chat-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      opacity: 0.9;
      margin-top: 4px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
    }

    .status-dot.offline {
      background: #f87171;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .message {
      display: flex;
      gap: 8px;
      max-width: 85%;
    }

    .message.own-message {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message.system-message {
      align-self: center;
      max-width: 100%;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .message-content {
      flex: 1;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .sender-name {
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
    }

    .message-time {
      font-size: 11px;
      color: #9ca3af;
    }

    .message-text {
      background: white;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      word-wrap: break-word;
      line-height: 1.4;
    }

    .own-message .message-text {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .system-message .message-content {
      text-align: center;
      background: #e0e7ff;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #c7d2fe;
    }

    .message-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
      margin-bottom: 0;
    }

    .message-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }

    .message-status {
      color: #10b981;
      font-size: 12px;
    }

    .typing-indicator .message-text {
      padding: 8px 12px;
    }

    .typing-dots {
      display: flex;
      gap: 4px;
    }

    .typing-dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9ca3af;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .chat-input {
      border-top: 1px solid #e5e7eb;
      background: white;
    }

    .input-container {
      display: flex;
      align-items: flex-end;
      padding: 12px;
      gap: 8px;
    }

    .input-container textarea {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      padding: 8px 16px;
      resize: none;
      outline: none;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
      max-height: 80px;
      transition: border-color 0.2s;
    }

    .input-container textarea:focus {
      border-color: #667eea;
    }

    .input-container textarea:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }

    .send-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #667eea;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .send-btn:hover:not(:disabled) {
      background: #5a67d8;
      transform: scale(1.05);
    }

    .send-btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      transform: none;
    }

    .send-btn svg {
      width: 16px;
      height: 16px;
    }

    .input-footer {
      padding: 0 12px 8px;
      display: flex;
      justify-content: flex-end;
    }

    .char-count {
      font-size: 11px;
      color: #9ca3af;
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .chat-container {
        bottom: 10px;
        right: 10px;
        left: 10px;
      }

      .chat-window {
        width: 100%;
        height: 70vh;
        bottom: 80px;
        right: 0;
        left: 0;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private destroy$ = new Subject<void>();
  private typingSubject = new Subject<void>();

  // Signals
  isOpen = signal(false);
  newMessage = '';
  currentChatRoom = this.chatService.currentChatRoom;
  messages = this.chatService.messages;
  isLoading = this.chatService.isLoading;
  unreadCount = this.chatService.unreadCount;
  isConnected = this.chatService.isConnected;
  isTyping = signal(false);

  // Computed
  hasUnreadMessages = computed(() => this.unreadCount() > 0);
  connectionStatus = computed(() => this.isConnected() ? 'online' : 'offline');
  canSendMessage = computed(() => 
    this.newMessage.trim().length > 0 && 
    !this.isLoading() && 
    this.isConnected()
  );

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    // Auto-scroll effect
    effect(() => {
      if (this.messages().length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });

    // Setup typing debounce
    this.typingSubject.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.currentChatRoom()) {
        this.chatService.stopTyping(this.currentChatRoom()!.id);
      }
    });
  }

  ngOnInit(): void {
    // Check if chat should be auto-opened (e.g., from order completion)
    const shouldAutoOpen = sessionStorage.getItem('openChat');
    if (shouldAutoOpen) {
      this.openChat();
      sessionStorage.removeItem('openChat');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChat(): void {
    if (this.isOpen()) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat(): void {
    this.isOpen.set(true);
    
    // Load existing chat room or prepare for new one
    const currentUser = this.authService.user();
    if (currentUser) {
      this.loadOrCreateChatRoom();
    }

    // Focus input after animation
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 300);
  }

  closeChat(): void {
    this.isOpen.set(false);
    
    // Stop typing indicator
    if (this.currentChatRoom()) {
      this.chatService.stopTyping(this.currentChatRoom()!.id);
    }
  }

  private loadOrCreateChatRoom(): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    // Try to find existing active chat room for this customer
    this.chatService.getChatRooms({ customerId: currentUser.id, status: 'active' })
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        if (response.chatRooms.length > 0) {
          // Use existing chat room
          const chatRoom = response.chatRooms[0];
          this.chatService.setCurrentChatRoom(chatRoom);
          this.loadMessages(chatRoom.id);
        }
        // If no existing chat room, it will be created when first message is sent
      });
  }

  private loadMessages(chatRoomId: string): void {
    this.chatService.getMessages(chatRoomId)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  sendMessage(): void {
    if (!this.canSendMessage()) return;

    const currentUser = this.authService.user();
    if (!currentUser) return;

    const messageContent = this.newMessage.trim();
    this.newMessage = '';

    // If no current chat room, create one first
    if (!this.currentChatRoom()) {
      this.createChatRoomAndSendMessage(messageContent);
    } else {
      this.sendMessageToExistingRoom(messageContent);
    }
  }

  private createChatRoomAndSendMessage(messageContent: string): void {
    const currentUser = this.authService.user();
    if (!currentUser) return;

    const createRequest: CreateChatRoomRequest = {
      customerId: currentUser.id,
      subject: 'Atendimento ao Cliente',
      priority: 'medium',
      initialMessage: messageContent,
      source: 'customer'
    };

    this.chatService.createChatRoom(createRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe(chatRoom => {
        this.chatService.setCurrentChatRoom(chatRoom);
        this.loadMessages(chatRoom.id);
      });
  }

  private sendMessageToExistingRoom(messageContent: string): void {
    const chatRoom = this.currentChatRoom();
    if (!chatRoom) return;

    const sendRequest: SendMessageRequest = {
      chatRoomId: chatRoom.id,
      content: messageContent,
      type: 'text'
    };

    this.chatService.sendMessage(sendRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping(): void {
    if (this.currentChatRoom()) {
      this.chatService.startTyping(this.currentChatRoom()!.id);
      this.typingSubject.next();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // Template helpers
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusText(): string {
    return this.isConnected() ? 'Online' : 'Offline';
  }

  // Public method to open chat from external components
  static openChatFromOrder(): void {
    sessionStorage.setItem('openChat', 'true');
    // Dispatch custom event to notify chat component
    window.dispatchEvent(new CustomEvent('openChat'));
  }
}