'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNoteStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadAsWord } from '@/lib/download';

export function Editor() {
  const { content, setContent, appendContent } = useNoteStore();
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef(content);

  const generateSuggestion = useCallback(async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setShowSuggestion(false);
    setSuggestion('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: content }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setSuggestion(fullText);
      }

      setShowSuggestion(true);
    } catch (error) {
      console.error('Error generating suggestion:', error);
      setSuggestion('');
    } finally {
      setIsLoading(false);
    }
  }, [content, isLoading]);

  // Auto-trigger after 3 seconds of inactivity
  useEffect(() => {
    if (content === lastContentRef.current) return;
    
    lastContentRef.current = content;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (content.trim() && !isLoading) {
        generateSuggestion();
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, generateSuggestion, isLoading]);

  // Sync overlay position and styling with textarea
  useEffect(() => {
    if (textareaRef.current && overlayRef.current) {
      const textarea = textareaRef.current;
      const overlay = overlayRef.current;
      
      // Match styles
      const computedStyle = window.getComputedStyle(textarea);
      overlay.style.fontSize = computedStyle.fontSize;
      overlay.style.fontFamily = computedStyle.fontFamily;
      overlay.style.lineHeight = computedStyle.lineHeight;
      overlay.style.padding = computedStyle.padding;
      overlay.style.border = computedStyle.border;
      overlay.style.width = computedStyle.width;
      overlay.style.height = computedStyle.height;
      overlay.style.whiteSpace = 'pre-wrap';
      overlay.style.wordWrap = 'break-word';
    }
  }, [content, suggestion]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key to accept suggestion
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (showSuggestion && suggestion) {
        // Accept suggestion
        appendContent(' ' + suggestion);
        setSuggestion('');
        setShowSuggestion(false);
      } else if (content.trim()) {
        // Generate new suggestion if none showing
        generateSuggestion();
      }
      return;
    }

    // Shift+Tab to retry/generate new suggestion
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (content.trim()) {
        generateSuggestion();
      }
      return;
    }

    // Escape to dismiss suggestion
    if (e.key === 'Escape') {
      setShowSuggestion(false);
      setSuggestion('');
      return;
    }

    // If user types, hide suggestion
    if (showSuggestion && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Reset suggestion when user types
    if (showSuggestion) {
      setShowSuggestion(false);
      setSuggestion('');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, suggestion]);

  const handleDownload = async () => {
    if (!content.trim()) return;
    await downloadAsWord(content);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-6 md:p-8">
      <ScrollArea className="flex-1">
        <div className="relative min-h-full">
          {/* Ghost text overlay */}
          {showSuggestion && suggestion && (
            <div 
              ref={overlayRef}
              className="absolute top-0 left-0 pointer-events-none text-lg md:text-xl leading-relaxed font-light whitespace-pre-wrap wrap-break-word"
              style={{
                color: 'transparent',
                zIndex: 1,
                overflow: 'hidden',
              }}
            >
              {content}
              <span className="text-muted-foreground/30">{suggestion}</span>
            </div>
          )}
          
          {/* Actual textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Start writing..."
            className="relative w-full min-h-full resize-none bg-transparent border-none outline-none text-lg md:text-xl leading-relaxed font-light text-foreground placeholder:text-muted-foreground/40 whitespace-pre-wrap wrap-break-word"
            style={{ 
              fontFamily: 'inherit',
              padding: 0,
              zIndex: 2,
            }}
            autoFocus
          />
        </div>
      </ScrollArea>

      {/* Bottom navbar */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <div className="text-xs text-muted-foreground/60">
          <p>
            Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Tab</kbd> to accept • <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs">Shift+Tab</kbd> to retry • Auto-suggests after 3 seconds
            {isLoading && <span className="ml-2">Generating...</span>}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={!content.trim()}
          className="text-xs text-muted-foreground/60 hover:text-foreground h-auto py-1 px-2"
        >
          <Download className="size-3 mr-1.5" />
          Download
        </Button>
      </div>
    </div>
  );
}
