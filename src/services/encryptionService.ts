import CryptoJS from 'crypto-js';

/**
 * Service for AES-256 encryption and decryption.
 * In a real app, the master key should be derived from a user password
 * and never stored directly in plain text.
 */
export class EncryptionService {
  private static readonly DEFAULT_KEY = 'chatvault-secure-key-2024'; // Fallback

  static encrypt(text: string, key: string = this.DEFAULT_KEY): string {
    return CryptoJS.AES.encrypt(text, key).toString();
  }

  static decrypt(cipherText: string, key: string = this.DEFAULT_KEY): string {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Decryption failed', e);
      return '[Decryption Error]';
    }
  }

  /**
   * Generates a random salt or key component
   */
  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }
}
