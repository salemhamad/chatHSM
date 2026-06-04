export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  language: string;
}

export interface Conversation {
  id: string;
  title: string;
  isPinned: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
  lastMessage?: Message;
}

export interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  isStreaming: boolean;
  conversationId: string;
  userId: string;
  attachments: Attachment[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  url: string | null;
  messageId: string;
  createdAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  searchQuery: string;
  pendingAttachments: PendingAttachment[];
}

export interface PendingAttachment {
  id: string;
  file: File;
  preview: string | null;
  type: 'image' | 'file';
  uploading: boolean;
  uploadedId?: string;
}

export interface UIState {
  sidebarOpen: boolean;
  attachmentMenuOpen: boolean;
  webSearchEnabled: boolean;
  isRecording: boolean;
  language: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
}
