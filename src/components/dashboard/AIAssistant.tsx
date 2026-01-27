import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Zap,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  suggestions?: string[];
}

const initialMessages: AIMessage[] = [
  {
    id: '1',
    type: 'ai',
    content: "I've analyzed the 7-day Holter data. Here's my clinical summary:",
    suggestions: [
      "Normal sinus rhythm predominant (85%)",
      "Tachycardia episodes noted - 12 occurrences",
      "PVC burden: 1.2% - within normal limits",
    ]
  },
  {
    id: '2',
    type: 'ai',
    content: "Based on the findings, I recommend the following sign-off:",
    suggestions: []
  }
];

const quickSignOffs = [
  { id: '1', label: 'Normal NSR - No action needed', confidence: 95 },
  { id: '2', label: 'Tachycardia - Follow-up recommended', confidence: 87 },
  { id: '3', label: 'PVCs within limits - Monitor', confidence: 92 },
];

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I understand. Based on your query, I've updated my analysis. The tachycardia episodes appear to correlate with patient-reported activity periods.",
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="glass-panel overflow-hidden animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-primary/5">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Clinical Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Powered by advanced cardiac analysis
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${message.type === 'ai' ? 'pr-4' : 'pl-4'}`}
          >
            {message.type === 'ai' ? (
              <div className="space-y-2">
                <div className="ai-bubble">
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="ml-2 space-y-1">
                    {message.suggestions.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/50 px-3 py-1.5 rounded-lg"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="bg-accent text-accent-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">AI is analyzing...</span>
          </div>
        )}
      </div>

      {/* Quick Sign-offs */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" />
          One-click Sign-offs
        </p>
        <div className="space-y-2">
          {quickSignOffs.map((signOff) => (
            <button
              key={signOff.id}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left group"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {signOff.label}
              </span>
              <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                {signOff.confidence}% confident
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about the findings..."
              className="input-medical w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <Button variant="accent" size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
