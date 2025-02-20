'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useChat } from 'ai/react';
import { IconSend } from '@tabler/icons-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'value';
  timestamp: Date;
}

interface ValuesChatInterfaceProps {
  selectedValue: string;
}

const getConversationStarters = (value: string) => {
  const starters = {
    Friendships: [
      "How do you nurture your friendships?",
      "What qualities do you value most in friends?",
      "How do friendships contribute to your life?",
    ],
    Fun: [
      "What activities bring you the most joy?",
      "How do you balance fun with responsibilities?",
      "When do you feel most playful and free?",
    ],
    Security: [
      "What makes you feel most secure?",
      "How do you handle uncertainty?",
      "What steps do you take to build security in your life?",
    ],
    // Add starters for other values...
  };
  return starters[value as keyof typeof starters] || [
    "What does this value mean to you?",
    "How does this value show up in your daily life?",
    "What challenges do you face in living this value?",
  ];
};

const ValuesChatInterface: React.FC<ValuesChatInterfaceProps> = ({ selectedValue }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/values-chat',
    body: {
      selectedValue,
    },
    onFinish: async (message) => {
      if (!user) return;

      try {
        await addDoc(collection(db, 'valueChats'), {
          userId: user.uid,
          value: selectedValue,
          content: message.content,
          sender: message.role === 'user' ? 'user' : 'value',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error saving message:', error);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) return;
      setLoadError(null);

      try {
        const messagesRef = collection(db, 'valueChats');
        const q = query(
          messagesRef,
          where('userId', '==', user.uid),
          where('value', '==', selectedValue),
          orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const loadedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        })) as Message[];

        setStoredMessages(loadedMessages);
      } catch (error: any) {
        if (error?.message?.includes('index')) {
          setLoadError('Setting up database indexes... This may take a few minutes. Please refresh the page shortly.');
        } else {
          setLoadError('Error loading messages. Please try again.');
          console.error('Error loading messages:', error);
        }
      }
    };

    loadMessages();
  }, [selectedValue, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Chat with {selectedValue}
        </h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {storedMessages.length === 0 && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              Chat with Your Values
            </h3>
            <div className="grid grid-cols-1 gap-4 w-full max-w-2xl">
              {getConversationStarters(selectedValue).map((starter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const form = document.querySelector('form');
                    const input = form?.querySelector('input');
                    if (input) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        'value'
                      )?.set;
                      nativeInputValueSetter?.call(input, starter);
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                      input.focus();
                    }
                  }}
                  className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <p className="text-gray-900">{starter}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="space-y-6">
              {loadError ? (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">{loadError}</p>
                </div>
              ) : (
                <>
                  {storedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message your value..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || !!loadError}
            />
            <button
              type="submit"
              disabled={isLoading || !!loadError || !input.trim()}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconSend size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ValuesChatInterface; 