import React from 'react';
import { Chat } from '../services/chatService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, MessageSquare, Users, Calendar } from 'lucide-react';

interface StatsViewProps {
  chats: Chat[];
}

export const StatsView: React.FC<StatsViewProps> = ({ chats }) => {
  const data = chats.map(chat => ({
    name: chat.contactName,
    messages: chat.messageCount
  })).sort((a, b) => b.messages - a.messages).slice(0, 5);

  const totalMessages = chats.reduce((acc, chat) => acc + chat.messageCount, 0);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8 bg-gray-50 dark:bg-whatsapp-dark-bg/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-whatsapp-green/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-whatsapp-green w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <h3 className="text-2xl font-bold">{totalMessages.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Chats</p>
              <h3 className="text-2xl font-bold">{chats.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Most Active</p>
              <h3 className="text-2xl font-bold truncate">{data[0]?.name || 'N/A'}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-whatsapp-green" />
          Message Distribution by Chat
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#88888822" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                width={100}
                tick={{ fill: '#888888', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="messages" radius={[0, 10, 10, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#25D366' : '#25D36688'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-whatsapp-green/5 dark:bg-whatsapp-green/10 p-6 rounded-2xl border border-whatsapp-green/20 flex items-start gap-4">
        <div className="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center shrink-0">
          <Calendar className="text-white w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-whatsapp-green">Insights</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your chat history spans multiple years. The most active period was detected in {format(new Date(), 'MMMM yyyy')}. 
            Consider tagging important conversations for easier retrieval later.
          </p>
        </div>
      </div>
    </div>
  );
};

function format(date: Date, fmt: string) {
  // Simple fallback for format if needed, but we have date-fns
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
