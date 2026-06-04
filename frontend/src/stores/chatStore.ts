import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatState, Message, Conversation, PendingAttachment, Attachment } from '../types';
import { generateId } from '../lib/utils';
import { apiClient, getToken, setToken, removeToken, API_BASE_URL } from '../lib/api';

interface ChatStore extends ChatState {
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  setSearchQuery: (query: string) => void;
  addMessage: (message: Message) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  updateStreamingContent: (content: string) => void;
  
  createConversation: (title?: string) => Promise<string>;
  sendMessage: (content: string, options?: { webSearch?: boolean }) => Promise<void>;
  retryMessage: (content: string) => Promise<void>;
  stopGenerating: () => void;
  pinMessage: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  
  addPendingAttachment: (file: File) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;
  
  loadConversations: () => Promise<void>;
  loadMessages: (id: string) => Promise<void>;
}

// Helper to check if a JWT token is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 < Date.now() + 10000; // 10s buffer
  } catch (e) {
    return true;
  }
};

// Transparently log in a Guest User to keep NestJS secure and rate-limited 
// while giving the user a zero-config, immediate chat experience
const ensureAuth = async () => {
  if (typeof window === 'undefined') return null;
  
  let token = getToken();
  if (token && !isTokenExpired(token)) return token;

  // Let's create a stable guest credential so the user keeps their chats across reloads
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = generateId();
    localStorage.setItem('guest_id', guestId);
  }

  const guestEmail = `guest_${guestId}@aichat.com`.toLowerCase();
  const guestPassword = `Password_${guestId}!`;

  try {
    // Try to login first, if failed, register
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmail, password: guestPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.tokens.accessToken);
        return data.tokens.accessToken;
      }
    } catch (e) {
      // Ignore login failure, proceed to register
    }

    const registerRes = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: guestEmail,
        password: guestPassword,
        displayName: 'Guest User',
      }),
    });
    if (registerRes.ok) {
      const data = await registerRes.json();
      setToken(data.tokens.accessToken);
      return data.tokens.accessToken;
    }
  } catch (err) {
    console.error('Failed auto-registration for guest user:', err);
  }
  return null;
};

// Custom fetch for streaming that supports abort controller
let activeAbortController: AbortController | null = null;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messages: [],
      isLoading: false,
      isStreaming: false,
      streamingContent: '',
      searchQuery: '',
      pendingAttachments: [],

      setConversations: (conversations) => set({ conversations }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      setMessages: (messages) => set({ messages }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      updateStreamingContent: (content) => set({ streamingContent: content }),

      createConversation: async (title) => {
        await ensureAuth();
        try {
          const res = await apiClient.post('/conversations', { title: title || 'New Chat' });
          const newConv: Conversation = {
            id: res.id,
            title: res.title,
            isPinned: res.isPinned,
            userId: res.userId,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt,
          };
          set((state) => ({
            conversations: [newConv, ...state.conversations],
            activeConversationId: res.id,
            messages: [],
          }));
          return res.id;
        } catch (error) {
          console.error('Failed to create conversation in DB, generating local ID', error);
          const localId = generateId();
          return localId;
        }
      },

      sendMessage: async (content, options) => {
        const token = await ensureAuth();
        const { activeConversationId, createConversation, addMessage, setIsStreaming, updateStreamingContent, pendingAttachments } = get();
        
        let convId = activeConversationId;
        
        // 1. If no active conversation, create one on the backend first
        if (!convId) {
          convId = await createConversation(content.substring(0, 30) + '...');
        }

        // 2. Upload any pending attachments to the backend
        const uploadedAttachments: Attachment[] = [];
        const attachmentIds: string[] = [];

        if (pendingAttachments.length > 0) {
          set({
            pendingAttachments: pendingAttachments.map(a => ({ ...a, uploading: true }))
          });

          for (const pending of pendingAttachments) {
            try {
              const formData = new FormData();
              formData.append('file', pending.file);

              const response = await fetch(`${API_BASE_URL}/attachments/upload`, {
                method: 'POST',
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
              });

              if (response.ok) {
                const data = await response.json();
                attachmentIds.push(data.id);
                uploadedAttachments.push({
                  id: data.id,
                  fileName: data.fileName,
                  fileType: data.fileType,
                  fileSize: data.fileSize,
                  storageKey: data.storageKey,
                  url: data.url,
                  messageId: '',
                  createdAt: data.createdAt,
                });
              }
            } catch (err) {
              console.error('Failed uploading attachment:', err);
            }
          }
        }

        // 3. Create and append the User message locally
        const userMsg: Message = {
          id: generateId(),
          role: 'USER',
          content,
          isStreaming: false,
          conversationId: convId,
          userId: 'user',
          attachments: uploadedAttachments,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        addMessage(userMsg);
        set({ pendingAttachments: [] }); // Clear pending uploads
        setIsStreaming(true);
        updateStreamingContent('');

        // 4. Initiate SSE Streaming from the backend
        activeAbortController = new AbortController();
        let currentText = '';

        try {
          const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              conversationId: convId,
              message: content,
              attachmentIds,
              webSearch: !!options?.webSearch,
            }),
            signal: activeAbortController.signal,
          });

          if (response.status === 401) {
            removeToken();
          }
          if (!response.ok) {
            throw new Error(`SSE HTTP Error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder('utf-8');
          if (!reader) throw new Error('Readable stream not supported.');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                
                try {
                  const data = JSON.parse(dataStr);
                  
                  if (data.type === 'title') {
                    // Update active conversation title in state
                    const updatedTitle = data.content;
                    set((state) => ({
                      conversations: state.conversations.map(c =>
                        c.id === convId ? { ...c, title: updatedTitle } : c
                      ),
                    }));
                  } else if (data.type === 'chunk') {
                    currentText += data.content;
                    updateStreamingContent(currentText);
                  } else if (data.type === 'error') {
                    throw new Error(data.content);
                  } else if (data.type === 'done') {
                    // Create permanent AI message card
                    const aiMsg: Message = {
                      id: data.messageId || generateId(),
                      role: 'ASSISTANT',
                      content: currentText.trim(),
                      isStreaming: false,
                      conversationId: convId,
                      userId: 'assistant',
                      attachments: [],
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };

                    addMessage(aiMsg);
                    setIsStreaming(false);
                    updateStreamingContent('');
                    
                    // Refresh conversation list to update dates
                    await get().loadConversations();
                  }
                } catch (e) {
                  // Parsing incomplete JSON chunks gracefully
                }
              }
            }
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.log('Streaming connection aborted by user.');
          } else {
            console.error('Streaming failed:', err);
            // Append error message to chat window
            const errorMsg: Message = {
              id: generateId(),
              role: 'SYSTEM',
              content: `⚠️ Connection error: ${err.message || 'Failed to generate response.'}`,
              isStreaming: false,
              conversationId: convId,
              userId: 'system',
              attachments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            addMessage(errorMsg);
          }
          setIsStreaming(false);
          updateStreamingContent('');
        }
      },
      
      retryMessage: async (content) => {
         await get().sendMessage(content);
      },

      stopGenerating: () => {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }

        const { activeConversationId, streamingContent, isStreaming, addMessage, setIsStreaming, updateStreamingContent } = get();

        if (isStreaming && activeConversationId) {
          const aiMsg: Message = {
            id: generateId(),
            role: 'ASSISTANT',
            content: streamingContent.trim() || 'Generation stopped.',
            isStreaming: false,
            conversationId: activeConversationId,
            userId: 'assistant',
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          addMessage(aiMsg);
          setIsStreaming(false);
          updateStreamingContent('');
        }
      },

      pinMessage: async (id) => {
        await ensureAuth();
        try {
          const res = await apiClient.post(`/messages/${id}/pin`);
          set((state) => ({
            messages: state.messages.map(m => m.id === id ? { ...m, isPinned: res.pinned } : m)
          }));
        } catch (err) {
          console.error('Failed to pin message on backend:', err);
          // Fallback toggle
          set((state) => ({
            messages: state.messages.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m)
          }));
        }
      },

      deleteConversation: async (id) => {
        await ensureAuth();
        try {
          await apiClient.delete(`/conversations/${id}`);
        } catch (err) {
          console.error('Failed to delete conversation on backend:', err);
        }

        set((state) => ({
          conversations: state.conversations.filter(c => c.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
          messages: state.activeConversationId === id ? [] : state.messages,
        }));
      },

      addPendingAttachment: (file) => {
        const url = URL.createObjectURL(file);
        set((state) => ({
          pendingAttachments: [...state.pendingAttachments, {
            id: generateId(),
            file,
            preview: url,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            uploading: false,
          }]
        }));
      },

      removePendingAttachment: (id) => set((state) => ({
        pendingAttachments: state.pendingAttachments.filter(a => {
          if (a.id === id && a.preview) URL.revokeObjectURL(a.preview);
          return a.id !== id;
        })
      })),

      clearPendingAttachments: () => set((state) => {
        state.pendingAttachments.forEach(a => {
          if (a.preview) URL.revokeObjectURL(a.preview);
        });
        return { pendingAttachments: [] };
      }),

      loadConversations: async () => {
        await ensureAuth();
        try {
          const res = await apiClient.get('/conversations');
          const conversations: Conversation[] = res.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            isPinned: item.isPinned,
            userId: item.userId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            _count: item._count,
            lastMessage: item.messages?.[0] ? {
              id: item.messages[0].id,
              role: item.messages[0].role,
              content: item.messages[0].content,
              isStreaming: item.messages[0].isStreaming,
              conversationId: item.messages[0].conversationId,
              userId: item.messages[0].userId,
              attachments: item.messages[0].attachments || [],
              createdAt: item.messages[0].createdAt,
              updatedAt: item.messages[0].updatedAt,
            } : undefined,
          }));

          set({ conversations });
        } catch (error) {
          console.error('Failed to load conversations:', error);
        }
      },

      loadMessages: async (id) => {
        await ensureAuth();
        set({ isLoading: true });
        try {
          const res = await apiClient.get(`/conversations/${id}/messages`);
          const messages: Message[] = res.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            isStreaming: msg.isStreaming,
            conversationId: msg.conversationId,
            userId: msg.userId,
            attachments: msg.attachments || [],
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
          }));

          set({ messages, isLoading: false });
        } catch (error) {
          console.error('Failed to load messages:', error);
          set({ messages: [], isLoading: false });
        }
      }
    }),
    {
      name: 'ai-chat-storage',
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        conversations: state.conversations,
      }),
    }
  )
);
