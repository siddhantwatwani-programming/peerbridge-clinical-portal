import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  X, 
  Minimize2,
  Maximize2,
  Bot,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
    }
  };

  return contexts[pathname] || {
    route: pathname,
    pageName: 'Portal',
    description: 'Clinical monitoring portal'
  };
};

const getContextualGreeting = (context: PageContext): string => {
  const greetings: Record<string, string> = {
    'Dashboard': "I see you're on the Dashboard. I can help you:\n\n• Summarize active reports and pending reviews\n• Highlight transmissions with symptoms\n• Explain items needing attention\n\nWhat would you like to know?",
    'Patients': "I see you're viewing the Patients list. I can help you:\n\n• Explain patient demographics and MRN details\n• Guide you through patient lookup\n• Answer questions about patient records\n\nHow can I assist?",
    'Add New Patient': "I see you're adding a new patient. I can help you:\n\n• Explain required fields and their purpose\n• Guide you through the registration process\n• Clarify data entry requirements\n\nWhat do you need help with?",
    'Users': "I see you're on the Users page. I can help you:\n\n• Explain user roles and permissions\n• Guide user management tasks\n• Answer questions about access levels\n\nHow can I assist?",
    'Nurse Pulse': "I see you're on Nurse Pulse monitoring. I can help you:\n\n• Explain severity indicators and scores\n• Highlight patients needing attention\n• Correlate symptoms with findings\n\nWhat would you like to review?",
    'Physician Interpretation': "I see you're reviewing a clinical interpretation. I can help you:\n\n• Explain report sections and findings\n• Provide guideline context\n• Summarize notable patterns\n\nWhat would you like me to clarify?"
  };

  return greetings[context.pageName] || "I'm the Peerbridge Clinical Copilot. I can help you navigate and understand data on this screen. What would you like to know?";
};

const generateResponse = (input: string, context: PageContext): string => {
  const lowerInput = input.toLowerCase();

  // Dashboard-specific responses
  if (context.pageName === 'Dashboard') {
    if (lowerInput.includes('report') || lowerInput.includes('active')) {
      return "**What I see on this screen:**\nThe Dashboard displays active reports awaiting review.\n\n**Relevant evidence:**\nActive reports are listed with patient identifiers, study types, and status indicators.\n\n**Clinical note:**\nItems marked with elevated severity scores may warrant prioritized physician review.\n\n*This requires physician judgment for final interpretation.*";
    }
    if (lowerInput.includes('transmission') || lowerInput.includes('symptom')) {
      return "**What I see on this screen:**\nPatient transmissions are displayed with symptom correlations.\n\n**Relevant evidence:**\nTransmissions showing patient-activated events or reported symptoms are flagged for attention.\n\n**Guideline context:**\nPer ACC/AHA guidance, symptom-correlated arrhythmias may have different clinical significance than asymptomatic findings.\n\n*This requires physician judgment for final interpretation.*";
    }
  }

  // Patients-specific responses
  if (context.pageName === 'Patients' || context.pageName === 'Add New Patient') {
    if (lowerInput.includes('mrn') || lowerInput.includes('medical record')) {
      return "**What I see on this screen:**\nThe patient list displays MRN (Medical Record Number) for each patient.\n\n**Relevant evidence:**\nMRN is a unique identifier assigned to each patient for tracking across the healthcare system.\n\n**Clinical note:**\nEnsure MRN accuracy when creating orders to prevent patient matching errors.";
    }
    if (lowerInput.includes('required') || lowerInput.includes('field')) {
      return "**What I see on this screen:**\nThe patient registration form contains demographic and contact fields.\n\n**Relevant evidence:**\nRequired fields typically include: Name, DOB, MRN, and primary contact information.\n\n**Clinical note:**\nAccurate demographic data ensures proper patient identification and communication.";
    }
  }

  // Interpretation-specific responses
  if (context.pageName === 'Physician Interpretation') {
    if (lowerInput.includes('finding') || lowerInput.includes('rhythm')) {
      return "**What I see on this screen:**\nThe interpretation panel displays study findings and rhythm analysis.\n\n**Relevant evidence:**\nFindings are categorized by rhythm type, ectopy burden, and notable events.\n\n**Guideline context:**\nPer ACC/AHA Holter guidelines, findings should be correlated with patient symptoms and clinical context.\n\n**Clinical note:**\nConsider comparison with prior studies when available to assess trending.\n\n*This requires physician judgment for final interpretation.*";
    }
    if (lowerInput.includes('sign') || lowerInput.includes('approve')) {
      return "**What I see on this screen:**\nThe sign-off workflow allows physician review and approval.\n\n**Relevant evidence:**\nAI-suggested interpretations are provided with confidence scores based on findings analysis.\n\n**Clinical note:**\nAll AI suggestions are assistive only. Final interpretation authority rests with the reviewing physician.\n\n*This requires physician judgment for final interpretation.*";
    }
  }

  // Generic contextual response
  return `**What I see on this screen:**\nYou're currently on the ${context.pageName} page.\n\n**Context:**\n${context.description}\n\n**How I can help:**\nI can answer questions about the data displayed on this screen, explain clinical terminology, or provide guideline context for findings.\n\nCould you tell me more specifically what you'd like to know about?`;
};

export const ClinicalCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  const pageContext = getPageContext(location.pathname);

  // Initialize with contextual greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getContextualGreeting(pageContext),
        timestamp: new Date()
      }]);
    }
  }, [isOpen, pageContext, messages.length]);

  // Update greeting when page changes
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const contextMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `*Navigated to ${pageContext.pageName}*\n\n${getContextualGreeting(pageContext)}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, contextMessage]);
    }
  }, [location.pathname]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(userMessage.content, pageContext);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
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
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          aria-label="Open Clinical Copilot"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Clinical Copilot</span>
        </button>
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
              <div className="p-1.5 rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Clinical Copilot</h3>
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
                        <div className="whitespace-pre-wrap">
                          {message.content.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-semibold mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                            }
                            if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                              return <p key={i} className="text-muted-foreground italic text-xs mt-2">{line.replace(/\*/g, '')}</p>;
                            }
                            if (line.startsWith('• ')) {
                              return <p key={i} className="ml-2">{line}</p>;
                            }
                            return <p key={i}>{line}</p>;
                          })}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
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
                    placeholder="Ask about this screen..."
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
