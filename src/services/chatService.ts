import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { EncryptionService } from './encryptionService';
import { ChatParser, ParsedMessage } from './chatParser';

export interface Chat {
  id?: string;
  contactName: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  messageCount: number;
  ownerId: string;
  tags: string[];
}

export interface Message {
  id?: string;
  chatId: string;
  sender: string;
  content: string; // Decrypted content for UI
  encryptedContent: string;
  timestamp: Date;
  isMedia: boolean;
  ownerId: string;
}

export const ChatService = {
  async importChat(contactName: string, fileContent: string) {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const parsedMessages = ChatParser.parse(fileContent);
    if (parsedMessages.length === 0) throw new Error('No messages found in file');

    const ownerId = auth.currentUser.uid;
    
    // 1. Create Chat document
    const chatData: Omit<Chat, 'id'> = {
      contactName,
      lastMessage: parsedMessages[parsedMessages.length - 1].content.substring(0, 100),
      lastMessageTimestamp: parsedMessages[parsedMessages.length - 1].timestamp,
      messageCount: parsedMessages.length,
      ownerId,
      tags: []
    };

    const chatRef = await addDoc(collection(db, 'chats'), {
      ...chatData,
      lastMessageTimestamp: Timestamp.fromDate(chatData.lastMessageTimestamp),
      createdAt: Timestamp.now()
    });

    // 2. Batch upload messages (Firestore limits batches to 500)
    // For large chats, we might need multiple batches or a different strategy
    // Here we'll do a simple loop for the demo, but in production use chunks
    const CHUNK_SIZE = 400;
    for (let i = 0; i < parsedMessages.length; i += CHUNK_SIZE) {
      const batch = writeBatch(db);
      const chunk = parsedMessages.slice(i, i + CHUNK_SIZE);
      
      chunk.forEach(msg => {
        const msgRef = doc(collection(db, 'messages'));
        batch.set(msgRef, {
          chatId: chatRef.id,
          sender: msg.sender,
          encryptedContent: EncryptionService.encrypt(msg.content),
          timestamp: Timestamp.fromDate(msg.timestamp),
          isMedia: msg.isMedia,
          ownerId
        });
      });
      
      await batch.commit();
    }

    return chatRef.id;
  },

  subscribeToChats(callback: (chats: Chat[]) => void) {
    if (!auth.currentUser) return () => {};
    
    const q = query(
      collection(db, 'chats'),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTimestamp: (doc.data().lastMessageTimestamp as Timestamp).toDate()
      })) as Chat[];
      callback(chats);
    });
  },

  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    if (!auth.currentUser) return () => {};

    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          chatId: data.chatId,
          sender: data.sender,
          encryptedContent: data.encryptedContent,
          content: EncryptionService.decrypt(data.encryptedContent),
          timestamp: (data.timestamp as Timestamp).toDate(),
          isMedia: data.isMedia,
          ownerId: data.ownerId
        };
      }) as Message[];
      callback(messages);
    });
  },

  async findOrCreateChat(contactName: string) {
    if (!auth.currentUser) throw new Error('User not authenticated');
    const ownerId = auth.currentUser.uid;

    const q = query(
      collection(db, 'chats'),
      where('ownerId', '==', ownerId),
      where('contactName', '==', contactName)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    const chatRef = await addDoc(collection(db, 'chats'), {
      contactName,
      lastMessage: '',
      lastMessageTimestamp: Timestamp.now(),
      messageCount: 0,
      ownerId,
      tags: [],
      createdAt: Timestamp.now()
    });

    return chatRef.id;
  },

  async addMessage(chatId: string, sender: string, content: string, timestamp: Date) {
    if (!auth.currentUser) return;
    const ownerId = auth.currentUser.uid;

    const encryptedContent = EncryptionService.encrypt(content);
    
    await addDoc(collection(db, 'messages'), {
      chatId,
      sender,
      encryptedContent,
      timestamp: Timestamp.fromDate(timestamp),
      isMedia: false,
      ownerId
    });

    // Update chat metadata
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: content.substring(0, 100),
      lastMessageTimestamp: Timestamp.fromDate(timestamp),
      messageCount: increment(1)
    });
  }
};
