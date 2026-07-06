import { useEffect, useRef } from 'react';
import { AIMessageBubble, type PublicAIMessage } from './AIMessageBubble';
import type { AIActionIntent, AiPropertyResult } from '../../types';

export function AIChatThread({
  messages,
  onRetry,
  onSuggestion,
  onPropertyClick,
  onFeedback,
  onBookingSubmit,
}: {
  messages: PublicAIMessage[];
  onRetry: (prompt: string) => void;
  onSuggestion: (suggestion: string) => void;
  onPropertyClick: (property: AiPropertyResult, message: PublicAIMessage) => void;
  onFeedback: (message: PublicAIMessage, value: 'up' | 'down', reason?: string) => void;
  onBookingSubmit?: (actionIntent: AIActionIntent) => Promise<void>;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <div className="space-y-3">
      {messages.map(message => (
        <AIMessageBubble
          key={message.id}
          message={message}
          onRetry={onRetry}
          onSuggestion={onSuggestion}
          onPropertyClick={onPropertyClick}
          onFeedback={onFeedback}
          onBookingSubmit={onBookingSubmit}
        />
      ))}
      <div ref={endRef} aria-hidden="true" />
    </div>
  );
}
