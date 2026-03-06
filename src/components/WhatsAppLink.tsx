import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { QrCode, RefreshCw, CheckCircle2, AlertCircle, Link, Unlink, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const socket: Socket = io();

export const WhatsAppLink: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    socket.on('whatsapp:status', (newStatus: any) => {
      setStatus(newStatus);
      if (newStatus === 'connected') setQrCode(null);
    });

    socket.on('whatsapp:qr', (qr: string) => {
      setQrCode(qr);
      setStatus('disconnected');
    });

    return () => {
      socket.off('whatsapp:status');
      socket.off('whatsapp:qr');
    };
  }, []);

  const handleReconnect = () => {
    setStatus('connecting');
    socket.emit('whatsapp:reconnect');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to disconnect your WhatsApp?')) {
      socket.emit('whatsapp:logout');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-whatsapp-dark-bg/50">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          <div className={clsx(
            "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-500",
            status === 'connected' ? "bg-whatsapp-green rotate-0" : "bg-gray-100 dark:bg-gray-700 rotate-3"
          )}>
            {status === 'connected' ? (
              <CheckCircle2 className="text-white w-10 h-10" />
            ) : (
              <Link className="text-gray-400 w-10 h-10" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold">Direct Connect</h2>
          <p className="text-gray-500 text-sm">
            Link your WhatsApp account to automatically sync and vault your messages in real-time.
          </p>
        </div>

        <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
          {status === 'connected' ? (
            <div className="flex flex-col items-center space-y-2 text-whatsapp-green animate-in fade-in zoom-in">
              <CheckCircle2 className="w-12 h-12" />
              <span className="font-bold">Linked Successfully</span>
            </div>
          ) : qrCode ? (
            <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full p-4 animate-in fade-in" />
          ) : (
            <div className="flex flex-col items-center space-y-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs">Generating QR Code...</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {status === 'connected' ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Unlink className="w-4 h-4" />
              Disconnect WhatsApp
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-left p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Open WhatsApp on your phone, tap Menu or Settings and select Linked Devices to scan this code.</p>
              </div>
              <button
                onClick={handleReconnect}
                className="w-full py-3 px-4 bg-whatsapp-green hover:bg-whatsapp-dark text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Connection
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Secure End-to-End Encryption
          </p>
        </div>
      </div>
    </div>
  );
};
