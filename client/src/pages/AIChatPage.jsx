import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

function AIChatPage() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your MediCose AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const chatHistoryForAI = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const { data } = await axios.post('/ai/chat', {
        prompt: userMessage.text,
        chatHistory: chatHistoryForAI
      });

      setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
    } catch (err) {
      console.error(err);
      const fallback = { sender: 'ai', text: "Sorry, I'm having trouble connecting right now." };
      setMessages((prev) => [...prev, fallback]);
      setError(err.response?.data?.message || "AI request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white border border-gray-200 rounded-xl shadow-lg max-w-3xl mx-2 md:mx-auto my-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <SparklesIcon className="h-6 w-6" />
        <h1 className="text-lg font-semibold">MediCose AI Assistant</h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 transition-all">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} transition-all`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg text-sm shadow-md transform transition-all duration-300 ease-in-out
                ${msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border'}
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-2 rounded-lg shadow bg-white text-gray-800 rounded-bl-none border">
              <LoadingSpinner />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Message type="error">{error}</Message>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 border-t bg-white p-4"
      >
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow transition-all duration-200"
          title="Send Message"
        >
          <PaperAirplaneIcon className="h-5 w-5 transform rotate-45" />
        </button>
      </form>
    </div>
  );
}

export default AIChatPage;
