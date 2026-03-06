import React from 'react';
import { format } from 'date-fns';
import { Chat } from '../services/chatService';
import { MessageSquare, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onChatSelect }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-whatsapp-dark-bg border-r border-gray-200 dark:border-gray-800 w-full md:w-80 lg:w-96">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold">Vaulted Chats</h2>
        <p className="text-sm text-gray-500">{chats.length} conversations stored</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <MessageSquare className="text-gray-400 w-8 h-8" />
            </div>
            <p className="text-gray-500">No chats imported yet. Click "Import Chat" to get started.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={clsx(
                "w-full p-4 flex items-start gap-4 border-b border-gray-100 dark:border-gray-900 transition-colors text-left",
                selectedChatId === chat.id 
                  ? "bg-whatsapp-green/5 dark:bg-whatsapp-green/10 border-l-4 border-l-whatsapp-green" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              )}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-whatsapp-green to-whatsapp-dark rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                {chat.contactName.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold truncate pr-2">{chat.contactName}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {format(chat.lastMessageTimestamp, 'MMM d')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {chat.lastMessage}
                </p>
                
                {chat.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 overflow-hidden">
                    {chat.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="w-2 h-2" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
