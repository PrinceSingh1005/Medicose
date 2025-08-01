import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown'; // Add this if rendering markdown

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

      const formattedText = data.response?.trim() || 'Sorry, I had trouble understanding that.';

      setMessages((prev) => [...prev, { sender: 'ai', text: formattedText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: "Sorry, I'm having trouble connecting right now."
      }]);
      setError(err.response?.data?.message || "AI request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-3xl mx-4 md:mx-auto my-8 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <SparklesIcon className="h-6 w-6" />
        <h1 className="text-lg font-semibold">MediCose AI Assistant</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-gray-50 text-sm sm:text-base">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl shadow-sm transition duration-300
                ${msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border rounded-bl-none'}
              `}
            >
              {msg.sender === 'ai' ? (
                <div className="prose prose-sm sm:prose max-w-full prose-indigo ">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-xl shadow bg-white text-gray-800 border">
              <LoadingSpinner />
            </div>
          </div>
        )}

        {error && <Message type="error">{error}</Message>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 border-t bg-white px-4 py-3"
      >
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition"
          title="Send Message"
        >
          <PaperAirplaneIcon className="h-5 w-5 transform rotate-45" />
        </button>
      </form>
    </div>
  );
}

export default AIChatPage;
