import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut, Search, Plus, MessageSquare, Shield, Settings, Moon, Sun, TrendingUp, Link } from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
  children: React.ReactNode;
  onImportClick: () => void;
  onSearchChange: (query: string) => void;
  activeTab: 'chats' | 'stats' | 'settings' | 'link';
  setActiveTab: (tab: 'chats' | 'stats' | 'settings' | 'link') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onImportClick, onSearchChange, activeTab, setActiveTab }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-whatsapp-bg dark:bg-whatsapp-dark-bg p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-whatsapp-green rounded-3xl flex items-center justify-center mx-auto shadow-lg rotate-3">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ChatVault</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Securely store, search, and relive your WhatsApp memories with AES-256 encryption.
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full py-3 px-4 bg-whatsapp-green hover:bg-whatsapp-dark text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-whatsapp-dark-bg">
      {/* Sidebar */}
      <aside className="w-16 md:w-20 flex flex-col items-center py-6 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="w-12 h-12 bg-whatsapp-green rounded-2xl flex items-center justify-center mb-8 shadow-lg">
          <Shield className="text-white w-6 h-6" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('chats')}
            className={clsx(
              "p-3 rounded-xl transition-all",
              activeTab === 'chats' ? "bg-whatsapp-green/10 text-whatsapp-green shadow-sm" : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={clsx(
              "p-3 rounded-xl transition-all",
              activeTab === 'stats' ? "bg-whatsapp-green/10 text-whatsapp-green shadow-sm" : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            <TrendingUp className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('link')}
            className={clsx(
              "p-3 rounded-xl transition-all",
              activeTab === 'link' ? "bg-whatsapp-green/10 text-whatsapp-green shadow-sm" : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            <Link className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={clsx(
              "p-3 rounded-xl transition-all",
              activeTab === 'settings' ? "bg-whatsapp-green/10 text-whatsapp-green shadow-sm" : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
            )}
          >
            <Settings className="w-6 h-6" />
          </button>
        </nav>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button 
            onClick={logout}
            className="p-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-bottom border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-whatsapp-dark-bg z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search messages, contacts..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-whatsapp-green outline-none transition-all"
              />
            </div>
          </div>
          
          <button 
            onClick={onImportClick}
            className="ml-4 flex items-center gap-2 bg-whatsapp-green hover:bg-whatsapp-dark text-white px-4 py-2 rounded-full font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Import Chat</span>
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};
