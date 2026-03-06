import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { ImportModal } from './components/ImportModal';
import { StatsView } from './components/StatsView';
import { WhatsAppLink } from './components/WhatsAppLink';
import { Chat, ChatService } from './services/chatService';
import { Shield, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io();

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'stats' | 'settings' | 'link'>('chats');

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToChats((updatedChats) => {
      setChats(updatedChats);
    });

    // Handle real-time WhatsApp messages
    socket.on('whatsapp:message', async (data: any) => {
      try {
        const chatId = await ChatService.findOrCreateChat(data.sender);
        await ChatService.addMessage(chatId, data.sender, data.content, new Date(data.timestamp));
      } catch (err) {
        console.error('Failed to sync message:', err);
      }
    });

    return () => {
      unsubscribe();
      socket.off('whatsapp:message');
    };
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'link':
        return <WhatsAppLink />;
      case 'stats':
        return <StatsView chats={chats} />;
      case 'settings':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-whatsapp-dark-bg/50">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
              <SettingsIcon className="text-gray-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-gray-500 max-w-md">
              Manage your encryption keys, backup preferences, and account details.
            </p>
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl text-sm border border-yellow-100 dark:border-yellow-900/30">
              Settings are currently in read-only mode for this preview.
            </div>
          </div>
        );
      case 'chats':
      default:
        return (
          <div className="flex h-full">
            <ChatList 
              chats={filteredChats} 
              selectedChatId={selectedChat?.id}
              onChatSelect={setSelectedChat}
            />
            
            <div className="flex-1 h-full">
              {selectedChat ? (
                <ChatWindow chat={selectedChat} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-whatsapp-dark-bg/50">
                  <div className="w-24 h-24 bg-whatsapp-green/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Shield className="text-whatsapp-green w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to ChatVault</h2>
                  <p className="text-gray-500 max-w-md">
                    Select a conversation from the list to view your encrypted messages, or import a new WhatsApp export file.
                  </p>
                  
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                        <MessageSquare className="text-blue-500 w-6 h-6" />
                      </div>
                      <h3 className="font-bold mb-1">Encrypted Storage</h3>
                      <p className="text-sm text-gray-500">All messages are encrypted using AES-256 before being stored in your personal vault.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-left">
                      <div className="w-10 h-10 bg-whatsapp-green/10 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="text-whatsapp-green w-6 h-6" />
                      </div>
                      <h3 className="font-bold mb-1">Offline Access</h3>
                      <p className="text-sm text-gray-500">Once imported, your chats are indexed and searchable even when you're offline.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      onImportClick={() => setIsImportModalOpen(true)}
      onSearchChange={setSearchQuery}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderContent()}

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </Layout>
  );
}
