import { Injectable } from '@angular/core';

export interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // timestamp
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'delivery_app_';

  constructor() {}

  setItem(key: string, value: string, options?: StorageOptions): void {
    try {
      const prefixedKey = this.PREFIX + key;
      let dataToStore = value;

      if (options?.expiry) {
        const item = {
          value: value,
          expiry: options.expiry
        };
        dataToStore = JSON.stringify(item);
      }

      if (options?.encrypt) {
        dataToStore = this.encrypt(dataToStore);
      }

      localStorage.setItem(prefixedKey, dataToStore);
    } catch (error) {
      console.error('Error storing item:', error);
    }
  }

  getItem(key: string, encrypted = false): string | null {
    try {
      const prefixedKey = this.PREFIX + key;
      let item = localStorage.getItem(prefixedKey);

      if (!item) return null;

      if (encrypted) {
        item = this.decrypt(item);
      }

      // Check if item has expiry
      try {
        const parsedItem = JSON.parse(item);
        if (parsedItem.expiry && parsedItem.value) {
          if (Date.now() > parsedItem.expiry) {
            this.removeItem(key);
            return null;
          }
          return parsedItem.value;
        }
      } catch {
        // Item is not JSON with expiry, return as is
      }

      return item;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      const prefixedKey = this.PREFIX + key;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  hasItem(key: string): boolean {
    const prefixedKey = this.PREFIX + key;
    return localStorage.getItem(prefixedKey) !== null;
  }

  getAllKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.PREFIX))
        .map(key => key.replace(this.PREFIX, ''));
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  getSize(): number {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += key.length + item.length;
          }
        }
      });
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  // Session storage methods
  setSessionItem(key: string, value: string): void {
    try {
      const prefixedKey = this.PREFIX + key;
      sessionStorage.setItem(prefixedKey, value);
    } catch (error) {
      console.error('Error storing session item:', error);
    }
  }

  getSessionItem(key: string): string | null {
    try {
      const prefixedKey = this.PREFIX + key;
      return sessionStorage.getItem(prefixedKey);
    } catch (error) {
      console.error('Error retrieving session item:', error);
      return null;
    }
  }

  removeSessionItem(key: string): void {
    try {
      const prefixedKey = this.PREFIX + key;
      sessionStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Error removing session item:', error);
    }
  }

  clearSession(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }

  // Simple encryption/decryption (for demo purposes - use proper encryption in production)
  private encrypt(text: string): string {
    // This is a very basic encoding - replace with proper encryption
    return btoa(text);
  }

  private decrypt(encodedText: string): string {
    try {
      return atob(encodedText);
    } catch (error) {
      console.error('Error decrypting text:', error);
      return encodedText;
    }
  }

  // IndexedDB wrapper methods for large data
  async setLargeItem(key: string, data: any): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      
      await store.put({
        key: this.PREFIX + key,
        value: data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error storing large item:', error);
      throw error;
    }
  }

  async getLargeItem(key: string): Promise<any> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['storage'], 'readonly');
      const store = transaction.objectStore('storage');
      
      const result = await store.get(this.PREFIX + key);
      return result?.value || null;
    } catch (error) {
      console.error('Error retrieving large item:', error);
      return null;
    }
  }

  async removeLargeItem(key: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['storage'], 'readwrite');
      const store = transaction.objectStore('storage');
      
      await store.delete(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing large item:', error);
      throw error;
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DeliveryAppStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage', { keyPath: 'key' });
        }
      };
    });
  }
}