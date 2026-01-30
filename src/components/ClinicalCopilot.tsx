import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Send, 
  X, 
  Minimize2,
  Maximize2,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useVoiceCommand } from '@/hooks/useVoiceCommand';
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
  const navigate = useNavigate();
  const pageContext = getPageContext(location.pathname);

  // Voice command state
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceFlowState, setVoiceFlowState] = useState<'idle' | 'awaiting_command' | 'collecting_patient'>('idle');
  const [patientData, setPatientData] = useState<Record<string, string>>({});
  const [currentField, setCurrentField] = useState<string | null>(null);
  
  const patientFields = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'dob', label: 'Date of Birth (say like January 15, 1980)', required: true },
    { key: 'mrn', label: 'Medical Record Number', required: true },
    { key: 'gender', label: 'Gender (Male, Female, or Other)', required: true },
    { key: 'cellPhone', label: 'Cell Phone Number', required: true },
  ];

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  // Handle mouse down for drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, input, textarea')) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    e.preventDefault();
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = dragRef.current.startX - e.clientX;
      const deltaY = dragRef.current.startY - e.clientY;
      
      // Calculate new position (we're using bottom-right positioning, so invert deltas)
      const newX = dragRef.current.initialX + deltaX;
      const newY = dragRef.current.initialY + deltaY;
      
      // Constrain to viewport
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      
      setPosition({
        x: Math.max(-window.innerWidth + 450, Math.min(maxX, newX)),
        y: Math.max(-window.innerHeight + 650, Math.min(maxY, newY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Text-to-speech for AI responses
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Voice command handling
  const handleVoiceTranscript = useCallback((transcript: string, isFinal: boolean) => {
    if (!isFinal) return;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Check for "create patient" or "new patient" command
    if (voiceFlowState === 'idle' || voiceFlowState === 'awaiting_command') {
      if (lowerTranscript.includes('create patient') || 
          lowerTranscript.includes('new patient') || 
          lowerTranscript.includes('add patient') ||
          lowerTranscript.includes('register patient')) {
        
        setVoiceFlowState('collecting_patient');
        setPatientData({});
        setCurrentField('firstName');
        
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎤 **Voice Patient Registration Started**\n\nI'll help you create a new patient. Please say the **First Name**:`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        speak("I'll help you create a new patient. Please say the first name.");
        return;
      }
      
      // If in awaiting command mode but didn't recognize command
      if (voiceFlowState === 'awaiting_command') {
        // Treat as regular chat input
        setInputValue(transcript);
        setVoiceFlowState('idle');
      }
    }
    
    // Collecting patient data
    if (voiceFlowState === 'collecting_patient' && currentField) {
      const fieldIndex = patientFields.findIndex(f => f.key === currentField);
      const fieldLabel = patientFields[fieldIndex]?.label || currentField;
      
      // Save the current field value
      setPatientData(prev => ({ ...prev, [currentField]: transcript }));
      
      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `**${fieldLabel}:** ${transcript}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      
      // Move to next field
      const nextFieldIndex = fieldIndex + 1;
      if (nextFieldIndex < patientFields.length) {
        const nextField = patientFields[nextFieldIndex];
        setCurrentField(nextField.key);
        
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `✓ Got it! Now please say the **${nextField.label}**:`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
        speak(`Got it! Now please say the ${nextField.label}`);
      } else {
        // All fields collected - show summary
        const allData = { ...patientData, [currentField]: transcript };
        setCurrentField(null);
        setVoiceFlowState('idle');
        
        const summaryMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `✅ **Patient Registration Complete!**\n\n**Summary:**\n- First Name: ${allData.firstName}\n- Last Name: ${allData.lastName}\n- DOB: ${allData.dob}\n- MRN: ${allData.mrn}\n- Gender: ${allData.gender}\n- Cell Phone: ${allData.cellPhone}\n\nSay **"confirm"** to proceed to the registration form, or **"start over"** to try again.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, summaryMsg]);
        speak("Patient registration complete! Say confirm to proceed to the registration form, or start over to try again.");
        setVoiceFlowState('awaiting_command');
      }
      return;
    }
    
    // Handle confirm/start over
    if (lowerTranscript.includes('confirm') && Object.keys(patientData).length > 0) {
      toast.success('Navigating to registration form with patient data');
      speak("Opening registration form with patient data");
      
      // Navigate to add patient page (in a real app, you'd pre-fill the form)
      navigate('/patients/add');
      setVoiceFlowState('idle');
      setPatientData({});
      return;
    }
    
    if (lowerTranscript.includes('start over') || lowerTranscript.includes('cancel')) {
      setVoiceFlowState('idle');
      setPatientData({});
      setCurrentField(null);
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔄 Cancelled. Say **"create patient"** to start again, or ask me anything else.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      speak("Cancelled. Say create patient to start again.");
      return;
    }
  }, [voiceFlowState, currentField, patientData, patientFields, navigate, speak]);

  const handleVoiceError = useCallback((error: string) => {
    if (error === 'no-speech') {
      toast.info('No speech detected. Try again.');
    } else if (error === 'not-allowed') {
      toast.error('Microphone access denied. Please allow microphone access.');
    } else {
      toast.error(`Voice error: ${error}`);
    }
  }, []);

  const { isListening, isSupported, toggleListening, stopListening } = useVoiceCommand({
    onTranscript: handleVoiceTranscript,
    onError: handleVoiceError,
    continuous: true
  });

  const handleVoiceModeToggle = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser. Try Chrome or Edge.');
      return;
    }
    
    setIsVoiceMode(!isVoiceMode);
    
    if (!isVoiceMode) {
      // Starting voice mode
      toggleListening();
      setVoiceFlowState('awaiting_command');
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎤 **Voice Mode Activated**\n\nI'm listening. You can say:\n- **"Create patient"** - Start voice-guided patient registration\n- Or ask any clinical question\n\n*Speak clearly and I'll respond.*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      speak("Voice mode activated. Say create patient to start registration, or ask any clinical question.");
    } else {
      // Stopping voice mode
      stopListening();
      setVoiceFlowState('idle');
      window.speechSynthesis.cancel();
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔇 Voice mode deactivated. You can type your questions below.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }
  }, [isVoiceMode, isSupported, toggleListening, stopListening, speak]);

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
        <div 
          className={cn(
            "fixed z-50 flex items-center gap-2",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{
            bottom: `${24 + position.y}px`,
            right: `${24 + position.x}px`,
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Collapse/Expand Toggle - also draggable */}
          <div
            className={cn(
              "p-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground shadow-md transition-all duration-200 hover:scale-105",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onClick={(e) => {
              // Only toggle if it wasn't a drag
              if (!isDragging) {
                setIsButtonCollapsed(!isButtonCollapsed);
              }
            }}
            aria-label={isButtonCollapsed ? "Expand PeerBridge AI" : "Collapse PeerBridge AI"}
          >
            {isButtonCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          
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
            "fixed z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col",
            isMinimized 
              ? "w-72 h-14" 
              : "w-[420px] h-[600px] max-h-[80vh]",
            !isDragging && "transition-all duration-300"
          )}
          style={{
            bottom: `${24 + position.y}px`,
            right: `${24 + position.x}px`,
            animation: !isDragging ? 'scale-in 0.2s ease-out' : undefined
          }}
        >
          {/* Header - Draggable */}
          <div 
            className={cn(
              "flex items-center justify-between p-4 border-b border-border bg-primary/5 rounded-t-xl",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onMouseDown={handleMouseDown}
          >
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

              {/* Voice Mode Indicator */}
              {isVoiceMode && (
                <div className="px-4 py-2 bg-accent/10 border-t border-border flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    isListening ? "bg-accent animate-pulse" : "bg-muted-foreground"
                  )} />
                  <span className="text-xs text-accent font-medium">
                    {voiceFlowState === 'collecting_patient' && currentField
                      ? `Listening for: ${patientFields.find(f => f.key === currentField)?.label}`
                      : isListening ? 'Listening...' : 'Voice mode active'}
                  </span>
                  {voiceFlowState === 'collecting_patient' && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      Field {patientFields.findIndex(f => f.key === currentField) + 1}/{patientFields.length}
                    </span>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  {/* Voice Button */}
                  <Button
                    onClick={handleVoiceModeToggle}
                    variant={isVoiceMode ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-11 w-11 shrink-0 transition-all",
                      isVoiceMode && "bg-accent hover:bg-accent/90",
                      isListening && "ring-2 ring-accent ring-offset-2"
                    )}
                    title={isVoiceMode ? "Stop voice mode" : "Start voice mode"}
                  >
                    {isVoiceMode ? (
                      <Mic className={cn("h-4 w-4", isListening && "animate-pulse")} />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isVoiceMode ? "Voice mode active - speak your command..." : "Ask about Peerbridge Health, ECG monitoring, or this screen..."}
                    className="min-h-[44px] max-h-[120px] resize-none text-sm"
                    rows={1}
                    disabled={isVoiceMode && isListening}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping || (isVoiceMode && isListening)}
                    size="icon"
                    className="h-11 w-11 bg-accent hover:bg-accent/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {isVoiceMode 
                    ? '🎤 Say "create patient" to start voice registration' 
                    : 'Clinical decision support only. Subject to physician review.'}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
