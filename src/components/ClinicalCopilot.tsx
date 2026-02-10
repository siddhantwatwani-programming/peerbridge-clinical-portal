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

interface ClinicalCopilotProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ClinicalCopilot: React.FC<ClinicalCopilotProps> = ({ open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setInternalOpen(val);
  };
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
  const isSpeakingRef = useRef(false);
  const ignoreTranscriptsUntilRef = useRef(0);
  const voiceFlowStateRef = useRef(voiceFlowState);
  const currentFieldRef = useRef(currentField);
  const patientDataRef = useRef(patientData);

  // Keep refs in sync
  useEffect(() => { voiceFlowStateRef.current = voiceFlowState; }, [voiceFlowState]);
  useEffect(() => { currentFieldRef.current = currentField; }, [currentField]);
  useEffect(() => { patientDataRef.current = patientData; }, [patientData]);
  
  const patientFields = [
    { key: 'firstName', label: 'First Name', question: 'Please say the first name.', required: true },
    { key: 'lastName', label: 'Last Name', question: 'Please say the last name.', required: true },
    { key: 'dob', label: 'Date of Birth', question: 'Please say the date of birth, like January 15, 1980.', required: true },
    { key: 'mrn', label: 'Medical Record Number', question: 'Please say the medical record number.', required: true },
    { key: 'gender', label: 'Gender', question: 'Please say the gender: Male, Female, or Other.', required: true },
    { key: 'cellPhone', label: 'Cell Phone Number', question: 'Please say the cell phone number.', required: true },
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

  // Text-to-speech that mutes transcript processing to avoid feedback loop
  // IMPORTANT: Does NOT stop/restart recognition to avoid race conditions with onend events
  const speakWithPause = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = true;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        const fallbackMs = Math.min(10000, Math.max(2500, Math.round(text.length * 50)));
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          isSpeakingRef.current = false;
          // Ignore any transcripts captured during TTS + buffer after
          ignoreTranscriptsUntilRef.current = Date.now() + 1200;
          resolve();
        };

        utterance.onend = settle;
        utterance.onerror = settle;
        window.speechSynthesis.speak(utterance);
        setTimeout(settle, fallbackMs);
      } else {
        resolve();
      }
    });
  }, []);

  // Refs for start/stop listening (kept for potential future use)
  const startListeningFnRef = useRef<() => void>();
  const stopListeningFnRef = useRef<() => void>();

  // Voice command handling - use refs to avoid stale closures
  const handleVoiceTranscript = useCallback((transcript: string, isFinal: boolean) => {
    if (!isFinal) return;
    
    // Ignore transcripts while speaking or shortly after
    if (isSpeakingRef.current) return;
    if (Date.now() < ignoreTranscriptsUntilRef.current) return;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    const flowState = voiceFlowStateRef.current;
    const field = currentFieldRef.current;
    const data = patientDataRef.current;
    
    // Check for "create patient" command
    if (flowState === 'idle' || flowState === 'awaiting_command') {
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
        speakWithPause("I'll help you create a new patient. Please say the first name.");
        return;
      }
      
      if (flowState === 'awaiting_command') {
        setInputValue(transcript);
        setVoiceFlowState('idle');
      }
    }
    
    // Collecting patient data
    if (flowState === 'collecting_patient' && field) {
      const fieldIndex = patientFields.findIndex(f => f.key === field);
      const fieldLabel = patientFields[fieldIndex]?.label || field;
      
      // Use functional update to avoid losing previously collected fields
      setPatientData(prev => {
        const newData = { ...prev, [field]: transcript };
        patientDataRef.current = newData; // sync ref immediately
        
        const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `**${fieldLabel}:** ${transcript}`,
          timestamp: new Date()
        };
        setMessages(msgs => [...msgs, userMsg]);
        
        const nextFieldIndex = fieldIndex + 1;
        if (nextFieldIndex < patientFields.length) {
          const nextField = patientFields[nextFieldIndex];
          setCurrentField(nextField.key);
          currentFieldRef.current = nextField.key; // sync ref immediately
          
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✓ Got it! Now please say the **${nextField.label}**:`,
            timestamp: new Date()
          };
          setMessages(msgs => [...msgs, aiMsg]);
          speakWithPause(`Got it! Now please say the ${nextField.label}`);
        } else {
          setCurrentField(null);
          currentFieldRef.current = null;
          setVoiceFlowState('awaiting_command');
          voiceFlowStateRef.current = 'awaiting_command';
          
          const summaryMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `✅ **Patient Registration Complete!**\n\n**Summary:**\n- First Name: ${newData.firstName}\n- Last Name: ${newData.lastName}\n- DOB: ${newData.dob}\n- MRN: ${newData.mrn}\n- Gender: ${newData.gender}\n- Cell Phone: ${newData.cellPhone}\n\nSay **"confirm"** to proceed to the registration form, or **"start over"** to try again.`,
            timestamp: new Date()
          };
          setMessages(msgs => [...msgs, summaryMsg]);
          speakWithPause("Patient registration complete! Say confirm to proceed, or start over to try again.");
        }
        
        return newData;
      });
      return;
    }
    
    // Handle confirm/start over
    if (lowerTranscript.includes('confirm') && Object.keys(patientDataRef.current).length > 0) {
      const dataToPass = { ...patientDataRef.current };
      toast.success('Navigating to registration form with patient data');
      speakWithPause("Opening registration form with patient data");
      navigate('/patients/add', { state: { voicePatientData: dataToPass } });
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
      speakWithPause("Cancelled. Say create patient to start again.");
      return;
    }
  }, [patientFields, navigate, speakWithPause]);

  const handleVoiceError = useCallback((error: string) => {
    if (error === 'no-speech') {
      toast.info('No speech detected. Try again.');
    } else if (error === 'not-allowed') {
      toast.error('Microphone access denied. Please allow microphone access.');
    } else {
      toast.error(`Voice error: ${error}`);
    }
  }, []);

  const { isListening, isSupported, startListening, toggleListening, stopListening } = useVoiceCommand({
    onTranscript: handleVoiceTranscript,
    onError: handleVoiceError,
    continuous: true
  });

  // Keep refs updated for speakWithPause
  useEffect(() => {
    startListeningFnRef.current = startListening;
    stopListeningFnRef.current = stopListening;
  }, [startListening, stopListening]);

  const handleVoiceModeToggle = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser. Try Chrome or Edge.');
      return;
    }
    
    setIsVoiceMode(!isVoiceMode);
    
    if (!isVoiceMode) {
      toggleListening();
      setVoiceFlowState('awaiting_command');
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎤 **Voice Mode Activated**\n\nI'm listening. You can say:\n- **"Create patient"** - Start voice-guided patient registration\n- Or ask any clinical question\n\n*Speak clearly and I'll respond.*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      speakWithPause("Voice mode activated. Say create patient to start registration, or ask any clinical question.");
    } else {
      stopListening();
      setVoiceFlowState('idle');
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
      
      const aiMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔇 Voice mode deactivated. You can type your questions below.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }
  }, [isVoiceMode, isSupported, toggleListening, stopListening, speakWithPause]);

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
      {/* Floating Button — hidden when controlled externally */}
      {!isOpen && controlledOpen === undefined && (
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
          <div
            className={cn(
              "p-2 rounded-xl bg-card/80 backdrop-blur-md hover:bg-card text-muted-foreground shadow-lg border border-border/40 transition-all duration-200 hover:scale-105",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onClick={(e) => {
              if (!isDragging) setIsButtonCollapsed(!isButtonCollapsed);
            }}
          >
            {isButtonCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          
          <button
            onClick={handleOpen}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={cn(
              "flex items-center gap-2 rounded-2xl bg-accent text-accent-foreground shadow-xl shadow-accent/20 hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300 hover:scale-105 group",
              isButtonCollapsed && !isButtonHovered ? "p-3.5" : "px-5 py-3.5"
            )}
          >
            {isButtonCollapsed && !isButtonHovered ? (
              <img src={peerbridgeAILogo} alt="PeerBridge" className="h-6 w-6 rounded-full object-contain" />
            ) : (
              <>
                <HeartPulse className="h-5 w-5 animate-[pulse_1s_ease-in-out_infinite]" />
                <span className="font-semibold whitespace-nowrap text-sm">PeerBridge AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-card border border-border/60 rounded-2xl shadow-2xl flex flex-col",
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
          {/* Header */}
          <div 
            className={cn(
              "flex items-center justify-between p-4 border-b border-border/40 rounded-t-2xl",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent">
                <HeartPulse className="h-4 w-4 text-accent-foreground animate-[pulse_1s_ease-in-out_infinite]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">PeerBridge AI</h3>
                {!isMinimized && (
                  <p className="text-xs text-muted-foreground">
                    {pageContext.pageName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleClose}>
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-accent" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                          message.role === 'user'
                            ? "bg-accent text-accent-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-accent" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              <div className="p-4 border-t border-border/40">
                <div className="flex gap-2">
                  <Button
                    onClick={handleVoiceModeToggle}
                    variant={isVoiceMode ? "default" : "outline"}
                    size="icon"
                    className={cn(
                      "h-10 w-10 shrink-0 rounded-xl transition-all",
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
                    placeholder={isVoiceMode ? "Voice mode active..." : "Ask anything..."}
                    className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-xl"
                    rows={1}
                    disabled={isVoiceMode && isListening}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping || (isVoiceMode && isListening)}
                    size="icon"
                    className="h-10 w-10 bg-accent hover:bg-accent/90 rounded-xl"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
                  {isVoiceMode 
                    ? '🎤 Say "create patient" to start voice registration' 
                    : 'Clinical decision support · Subject to review'}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
