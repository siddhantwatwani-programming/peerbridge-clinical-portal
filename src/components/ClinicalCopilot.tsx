import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  HeartPulse, 
  Send, 
  X, 
  Minimize2,
  Maximize2,
  Bot,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import peerbridgeAILogo from '@/assets/peerbridge-ai-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PageContext {
  route: string;
  pageName: string;
  description: string;
}

const getPageContext = (pathname: string): PageContext => {
  const contexts: Record<string, PageContext> = {
    '/dashboard': {
      route: '/dashboard',
      pageName: 'Dashboard',
      description: 'Active reports, patient transmissions, and items needing attention'
    },
    '/patients': {
      route: '/patients',
      pageName: 'Patients',
      description: 'Patient demographics, MRN, and order management'
    },
    '/patients/add': {
      route: '/patients/add',
      pageName: 'Add New Patient',
      description: 'Patient registration form for demographics and contact information'
    },
    '/users': {
      route: '/users',
      pageName: 'Users',
      description: 'Clinicians, administrators, and technician management'
    },
    '/nurse-pulse': {
      route: '/nurse-pulse',
      pageName: 'Nurse Pulse',
      description: 'Real-time patient monitoring with severity indicators'
    },
    '/interpretation': {
      route: '/interpretation',
      pageName: 'Physician Interpretation',
      description: 'Clinical report review and sign-off workflow'
    },
    '/events': {
      route: '/events',
      pageName: 'Patient Transmissions',
      description: 'Patient-reported symptoms, transmission status, and physician assignments'
    },
    '/transmissions': {
      route: '/transmissions',
      pageName: 'Patient Transmissions',
      description: 'Patient-reported symptoms, transmission status, and physician assignments'
    },
    '/research': {
      route: '/research',
      pageName: 'Research',
      description: 'Clinical research studies and report analysis'
    },
    '/reports': {
      route: '/reports',
      pageName: 'Reports',
      description: 'Clinical reports and documentation'
    },
    '/inventory': {
      route: '/inventory',
      pageName: 'Inventory',
      description: 'Device inventory and management'
    },
    '/inventory/devices': {
      route: '/inventory/devices',
      pageName: 'Devices',
      description: 'Medical device inventory and status tracking'
    },
    '/inventory/shipments': {
      route: '/inventory/shipments',
      pageName: 'Device Shipments',
      description: 'Device shipment tracking and logistics'
    }
  };

  return contexts[pathname] || {
    route: pathname,
    pageName: 'Portal',
    description: 'Clinical monitoring portal'
  };
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-copilot`;

async function streamChat({
  messages,
  pageContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  pageContext: PageContext;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, pageContext }),
    });

    if (resp.status === 429) {
      onError('Rate limit exceeded. Please try again in a moment.');
      return;
    }
    if (resp.status === 402) {
      onError('AI usage limit reached. Please contact support.');
      return;
    }
    if (!resp.ok || !resp.body) {
      onError('Failed to start stream');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (error) {
    console.error('Stream error:', error);
    onError('Connection error. Please try again.');
  }
}

export const ClinicalCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isButtonCollapsed, setIsButtonCollapsed] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const pageContext = getPageContext(location.pathname);

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Welcome to **PeerBridge AI** - your clinical decision-support assistant.

I'm here to help you navigate the **${pageContext.pageName}** and provide insights based on:
- Visible screen data
- Clinical guidelines (ACC/AHA)
- Best practices for ambulatory ECG monitoring

**How can I assist you today?**`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, pageContext.pageName, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    let assistantSoFar = '';
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('stream-')) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { id: `stream-${Date.now()}`, role: 'assistant', content: assistantSoFar, timestamp: new Date() }];
      });
    };

    // Prepare message history for API
    const apiMessages = messages
      .filter(m => m.id !== '1') // Exclude initial welcome
      .map(m => ({ role: m.role, content: m.content }));
    apiMessages.push({ role: 'user', content: userMessage.content });

    await streamChat({
      messages: apiMessages,
      pageContext,
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsTyping(false),
      onError: (error) => {
        toast.error(error);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I apologize, but I encountered an error: ${error}\n\nPlease try again or contact support if the issue persists.`,
          timestamp: new Date()
        }]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsButtonCollapsed(!isButtonCollapsed)}
            className="p-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground shadow-md transition-all duration-200 hover:scale-105"
            aria-label={isButtonCollapsed ? "Expand PeerBridge AI" : "Collapse PeerBridge AI"}
          >
            {isButtonCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {/* Main AI Button */}
          <button
            onClick={handleOpen}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={cn(
              "flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group",
              isButtonCollapsed && !isButtonHovered ? "p-3" : "px-4 py-3"
            )}
            aria-label="Open PeerBridge AI"
          >
            {isButtonCollapsed && !isButtonHovered ? (
              <img 
                src={peerbridgeAILogo} 
                alt="PeerBridge" 
                className="h-6 w-6 rounded-full object-contain"
              />
            ) : (
              <>
                <HeartPulse className="h-5 w-5 animate-[pulse_1s_ease-in-out_infinite]" />
                <span className="font-medium whitespace-nowrap">PeerBridge AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-card border border-border rounded-xl shadow-2xl transition-all duration-300 flex flex-col",
            isMinimized 
              ? "bottom-6 right-6 w-72 h-14" 
              : "bottom-6 right-6 w-[420px] h-[600px] max-h-[80vh]"
          )}
          style={{
            animation: 'scale-in 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent">
                <HeartPulse className="h-4 w-4 text-accent-foreground animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">PeerBridge AI</h3>
                {!isMinimized && (
                  <p className="text-xs text-muted-foreground">
                    Viewing: {pageContext.pageName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-4 py-3 text-sm",
                          message.role === 'user'
                            ? "bg-accent text-accent-foreground rounded-br-md"
                            : "bg-secondary text-secondary-foreground rounded-bl-md"
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-secondary rounded-xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about Peerbridge Health, ECG monitoring, or this screen..."
                    className="min-h-[44px] max-h-[120px] resize-none text-sm"
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    size="icon"
                    className="h-11 w-11 bg-accent hover:bg-accent/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Clinical decision support only. Subject to physician review.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
