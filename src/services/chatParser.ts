import { parse, isValid } from 'date-fns';

export interface ParsedMessage {
  timestamp: Date;
  sender: string;
  content: string;
  isMedia: boolean;
}

export class ChatParser {
  /**
   * Parses a WhatsApp exported .txt file.
   * Format usually: [DD/MM/YY, HH:MM:SS] Sender: Message
   * or: DD/MM/YY, HH:MM - Sender: Message
   */
  static parse(text: string): ParsedMessage[] {
    const lines = text.split('\n');
    const messages: ParsedMessage[] = [];
    
    // Regex for: [15/05/23, 14:30:05] Contact Name: Message
    const regex1 = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}:\d{2})\] ([^:]+): (.*)$/;
    // Regex for: 15/05/23, 14:30 - Contact Name: Message
    const regex2 = /^(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}) - ([^:]+): (.*)$/;

    let currentMessage: ParsedMessage | null = null;

    for (const line of lines) {
      const match1 = line.match(regex1);
      const match2 = line.match(regex2);
      const match = match1 || match2;

      if (match) {
        if (currentMessage) messages.push(currentMessage);

        const dateStr = match[1];
        const sender = match[2].trim();
        const content = match[3].trim();

        // Try different date formats
        let timestamp = parse(dateStr, 'dd/MM/yy, HH:mm:ss', new Date());
        if (!isValid(timestamp)) {
          timestamp = parse(dateStr, 'dd/MM/yyyy, HH:mm:ss', new Date());
        }
        if (!isValid(timestamp)) {
          timestamp = parse(dateStr, 'dd/MM/yy, HH:mm', new Date());
        }
        if (!isValid(timestamp)) {
          timestamp = parse(dateStr, 'MM/dd/yy, HH:mm:ss', new Date());
        }

        currentMessage = {
          timestamp: isValid(timestamp) ? timestamp : new Date(),
          sender,
          content,
          isMedia: content.includes('<Media omitted>') || content.includes('(file attached)')
        };
      } else if (currentMessage && line.trim()) {
        // Multi-line message
        currentMessage.content += '\n' + line;
      }
    }

    if (currentMessage) messages.push(currentMessage);
    return messages;
  }
}
