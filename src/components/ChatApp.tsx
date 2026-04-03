import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Conversation {
  _id: Id<"conversations">;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface Message {
  _id: Id<"messages">;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

const ELON_SYSTEM_PROMPT = `You are Elon Musk, the entrepreneur and CEO of Tesla, SpaceX, and X (formerly Twitter). You have a distinctive communication style:

- You're direct, sometimes blunt, and use simple language
- You frequently reference rockets, Mars colonization, AI, electric vehicles, and the future of humanity
- You're known for making bold predictions and ambitious goals
- You have a dry, sometimes absurd sense of humor and love memes
- You occasionally use phrases like "super important", "insanely", "fundamentally", "first principles thinking"
- You're passionate about sustainable energy, multi-planetary species, and AI safety
- You sometimes tweet controversial opinions and aren't afraid of pushback
- You reference your companies (Tesla, SpaceX, Neuralink, The Boring Company, xAI) naturally
- You're dismissive of bureaucracy and traditional thinking
- You work extremely long hours and expect the same from others
- You believe in rapid iteration and "fail fast" mentality

Keep responses concise and punchy like tweets when appropriate. Be entertaining and stay in character. Never break character or acknowledge that you're an AI - you ARE Elon Musk responding in real-time from Mars mission control.`;

export function ChatApp() {
  const { signOut } = useAuthActions();
  const [activeConversation, setActiveConversation] = useState<Id<"conversations"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversations = useQuery(api.conversations.list) ?? [];
  const createConversation = useMutation(api.conversations.create);
  const deleteConversation = useMutation(api.conversations.remove);

  const handleNewChat = async () => {
    try {
      const id = await createConversation({});
      setActiveConversation(id);
      setSidebarOpen(false);
    } catch (err) {
      setError("Failed to create conversation");
    }
  };

  const handleDeleteConversation = async (id: Id<"conversations">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation({ id });
      if (activeConversation === id) {
        setActiveConversation(null);
      }
    } catch (err) {
      setError("Failed to delete conversation");
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="chat-app">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">E</div>
            <div>
              <div className="sidebar-title">ElonGPT</div>
              <div className="sidebar-status">
                <span className="status-dot" />
                ONLINE FROM MARS
              </div>
            </div>
          </div>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Transmission
        </button>

        <div className="conversations-list">
          {(conversations as Conversation[]).map((conv) => (
            <div
              key={conv._id}
              className={`conversation-item ${activeConversation === conv._id ? "active" : ""}`}
              onClick={() => {
                setActiveConversation(conv._id);
                setSidebarOpen(false);
              }}
            >
              <span className="conversation-title">{conv.title}</span>
              <button
                className="conversation-delete"
                onClick={(e) => handleDeleteConversation(conv._id, e)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="signout-btn" onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="chat-main">
        <header className="chat-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="chat-header-info">
            <div className="chat-header-title">Elon Musk</div>
            <div className="chat-header-subtitle">MARS MISSION CONTROL</div>
          </div>
          <div className="signal-indicator">
            <div className="signal-bar" />
            <div className="signal-bar" />
            <div className="signal-bar" />
            <div className="signal-bar" />
          </div>
        </header>

        {activeConversation ? (
          <ChatConversation
            conversationId={activeConversation}
            systemPrompt={ELON_SYSTEM_PROMPT}
            onError={setError}
          />
        ) : (
          <EmptyState onNewChat={handleNewChat} />
        )}

        <footer className="app-footer">
          Requested by <a href="https://twitter.com/OxPaulius" target="_blank" rel="noopener noreferrer">@OxPaulius</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer">@clonkbot</a>
        </footer>
      </main>

      {error && <div className="toast">{error}</div>}
    </div>
  );
}

function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  const suggestions = [
    "What's the timeline for Mars?",
    "Thoughts on AI safety?",
    "Why electric vehicles?",
    "Explain first principles",
  ];

  return (
    <div className="no-conversation">
      <div className="messages-container">
        <div className="empty-state">
          <div className="empty-avatar">
            <div className="empty-avatar-ring" />
            <div className="empty-avatar-img">🚀</div>
          </div>
          <h2 className="empty-title">Ready for Transmission</h2>
          <p className="empty-subtitle">
            Start a conversation with virtual Elon. Ask about rockets, Mars,
            Tesla, AI, or any bold ideas about the future of humanity.
          </p>
          <div className="suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="suggestion-btn"
                onClick={onNewChat}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatConversationProps {
  conversationId: Id<"conversations">;
  systemPrompt: string;
  onError: (msg: string) => void;
}

function ChatConversation({ conversationId, systemPrompt, onError }: ChatConversationProps) {
  const messages = useQuery(api.messages.list, { conversationId }) ?? [];
  const sendMessage = useMutation(api.messages.send);
  const chat = useAction(api.ai.chat);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isLoading) return;

    setInput("");
    setIsLoading(true);

    try {
      // Send user message
      await sendMessage({
        conversationId,
        content,
        role: "user",
      });

      // Get AI response
      const chatHistory = [
        ...(messages as Message[]).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      const response = await chat({
        messages: chatHistory,
        systemPrompt,
      });

      // Save AI response
      await sendMessage({
        conversationId,
        content: response,
        role: "assistant",
      });
    } catch (err) {
      onError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
    }
  };

  return (
    <>
      <div className="messages-container">
        {messages.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-avatar">
              <div className="empty-avatar-ring" />
              <div className="empty-avatar-img">🚀</div>
            </div>
            <h2 className="empty-title">Start Transmission</h2>
            <p className="empty-subtitle">
              Send a message to begin your conversation with Elon.
            </p>
          </div>
        ) : (
          <>
            {(messages as Message[]).map((message) => (
              <div key={message._id} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === "assistant" ? "🚀" : "👤"}
                </div>
                <div>
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="typing-indicator">
                <div className="typing-avatar">🚀</div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="input-field"
            placeholder="Send a message to Mars..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <svg className="send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
