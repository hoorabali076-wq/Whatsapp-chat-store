import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ChatService } from '../services/chatService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [contactName, setContactName] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.name.endsWith('.txt')) {
      setFile(selectedFile);
      // Try to guess contact name from filename
      const guessedName = selectedFile.name.replace('WhatsApp Chat with ', '').replace('.txt', '');
      setContactName(guessedName);
    } else {
      setError('Please upload a valid .txt file exported from WhatsApp.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    multiple: false
  } as any);

  const handleImport = async () => {
    if (!file || !contactName) return;

    setStatus('uploading');
    try {
      const text = await file.text();
      await ChatService.importChat(contactName, text);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFile(null);
        setContactName('');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err.message || 'Failed to import chat. Please check the file format.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Import WhatsApp Chat</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-green-500 w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold">Import Successful!</h3>
              <p className="text-gray-500">Your chat has been encrypted and vaulted.</p>
            </div>
          ) : (
            <>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                  isDragActive ? 'border-whatsapp-green bg-whatsapp-green/5' : 'border-gray-300 dark:border-gray-700 hover:border-whatsapp-green'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Upload className="text-gray-400 w-6 h-6" />
                  </div>
                  {file ? (
                    <div className="flex items-center gap-2 text-whatsapp-green font-medium">
                      <FileText className="w-4 h-4" />
                      {file.name}
                    </div>
                  ) : (
                    <>
                      <p className="font-medium">Drag & drop your .txt file here</p>
                      <p className="text-sm text-gray-500 mt-1">or click to select file</p>
                    </>
                  )}
                </div>
              </div>

              {file && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Name</label>
                  <input 
                    type="text" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter contact or group name"
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-whatsapp-green outline-none transition-all"
                  />
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={!file || !contactName || status === 'uploading'}
                  onClick={handleImport}
                  className="flex-1 py-3 px-4 bg-whatsapp-green hover:bg-whatsapp-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {status === 'uploading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Start Import'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
