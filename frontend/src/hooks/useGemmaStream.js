import { useState, useCallback } from 'react';
import { generateTextStream } from '../services/ai.service';

export const useGemmaStream = (onComplete) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (prompt) => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Placeholder for the AI response
    const aiMessageId = Date.now();
    setMessages((prev) => [...prev, { role: 'ai', content: '', id: aiMessageId }]);

    try {
      const stream = await generateTextStream(prompt);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponseContent += chunk;

        // Update the specific AI message chunk by chunk
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: aiResponseContent } : msg
          )
        );
      }
      
      if (onComplete) {
        onComplete(aiResponseContent);
      }
    } catch (err) {
      console.error('Error in stream:', err);
      setError(err.message);
      // Remove the empty AI message if failed, or show error in line
      setMessages((prev) => [
        ...prev.filter(msg => msg.id !== aiMessageId),
        { role: 'error', content: err.message || 'An error occurred during generation' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [onComplete]);

  return { messages, isLoading, error, sendMessage };
};
