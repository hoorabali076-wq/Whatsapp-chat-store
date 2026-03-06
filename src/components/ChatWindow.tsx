import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Chat, Message, ChatService } from '../services/chatService';
import { Shield, Lock, Search, MoreVertical, Calendar, User } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatWindowProps {
  chat: Chat;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = ChatService.subscribeToMessages(chat.id!, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-whatsapp-bg dark:bg-whatsapp-dark-bg relative">
      {/* Chat Header */}
      <div className="h-16 bg-white dark:bg-whatsapp-dark-bg border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center text-white font-bold">
            {chat.contactName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{chat.contactName}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> AES-256 Encrypted
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col space-y-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:bg-none"
      >
        <div className="self-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-1 rounded-lg text-[11px] text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 border border-gray-200 dark:border-gray-700">
          <Shield className="w-3 h-3 text-whatsapp-green" />
          Messages are end-to-end encrypted in your vault
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-green"></div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSelf = msg.sender.toLowerCase().includes('me') || msg.sender.toLowerCase().includes('you');
            const showDate = idx === 0 || format(messages[idx-1].timestamp, 'yyyy-MM-dd') !== format(msg.timestamp, 'yyyy-MM-dd');
            
            return (
              <React.Fragment key={msg.id}>
                {showDate && (
                  <div className="self-center my-4 px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-md text-[10px] font-medium text-gray-500">
                    {format(msg.timestamp, 'MMMM d, yyyy')}
                  </div>
                )}
                <div className={clsx(
                  "flex flex-col",
                  isSelf ? "items-end" : "items-start"
                )}>
                  {!isSelf && (
                    <span className="text-[10px] font-bold text-whatsapp-green ml-2 mb-0.5">
                      {msg.sender}
                    </span>
                  )}
                  <div className={clsx(
                    isSelf ? "chat-bubble-right" : "chat-bubble-left",
                    "group"
                  )}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-gray-400">
                        {format(msg.timestamp, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-white dark:bg-whatsapp-dark-bg border-t border-gray-200 dark:border-gray-800 text-center">
        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-2">
          <Calendar className="w-3 h-3" /> Imported from WhatsApp Export • {messages.length} messages total
        </p>
      </div>
    </div>
  );
};
