/**
 * REFINZI — Cross-Browser WebExtension Abstraction Layer (BrowserAPI)
 * 
 * Normalizes API differences between Chrome, Firefox, Safari, and Edge.
 * Supports both `browser.*` (W3C WebExtensions standard / Firefox / Safari)
 * and `chrome.*` (Chromium / Edge / Chrome fallback).
 */

declare const globalThis: any;

export interface StorageAreaLike {
  get(keys: string | string[] | Record<string, any> | null): Promise<Record<string, any>>;
  set(items: Record<string, any>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
}

export interface RuntimeLike {
  sendMessage(message: any): Promise<any>;
  onMessage: {
    addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => boolean | void): void;
    removeListener(callback: Function): void;
  };
  getURL(path: string): string;
  getManifest(): any;
}

export interface CommandsLike {
  onCommand: {
    addListener(callback: (command: string) => void): void;
    removeListener(callback: Function): void;
  };
}

export interface TabsLike {
  query(queryInfo: any): Promise<any[]>;
  sendMessage(tabId: number, message: any): Promise<any>;
}

class BrowserAPIWrapper {
  private rawBrowser: any;
  private rawChrome: any;
  public readonly storage: { local: StorageAreaLike; sync: StorageAreaLike };
  public readonly runtime: RuntimeLike;
  public readonly commands: CommandsLike;
  public readonly tabs: TabsLike;

  constructor() {
    this.rawBrowser = typeof globalThis.browser !== 'undefined' ? globalThis.browser : null;
    this.rawChrome = typeof globalThis.chrome !== 'undefined' ? globalThis.chrome : null;

    // Storage
    const getArea = (areaName: 'local' | 'sync'): StorageAreaLike => {
      if (this.rawBrowser?.storage?.[areaName]) {
        return {
          get: (keys) => this.rawBrowser.storage[areaName].get(keys),
          set: (items) => this.rawBrowser.storage[areaName].set(items),
          remove: (keys) => this.rawBrowser.storage[areaName].remove(keys),
          clear: () => this.rawBrowser.storage[areaName].clear(),
        };
      }
      if (this.rawChrome?.storage?.[areaName]) {
        const chromeArea = this.rawChrome.storage[areaName];
        return {
          get: (keys) =>
            new Promise((resolve, reject) => {
              chromeArea.get(keys, (res: any) => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve(res || {});
                }
              });
            }),
          set: (items) =>
            new Promise((resolve, reject) => {
              chromeArea.set(items, () => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
          remove: (keys) =>
            new Promise((resolve, reject) => {
              chromeArea.remove(keys, () => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
          clear: () =>
            new Promise((resolve, reject) => {
              chromeArea.clear(() => {
                if (this.rawChrome.runtime?.lastError) {
                  reject(new Error(this.rawChrome.runtime.lastError.message));
                } else {
                  resolve();
                }
              });
            }),
        };
      }
      const memoryStore = new Map<string, any>();
      return {
        get: async (keys) => {
          if (!keys) return Object.fromEntries(memoryStore.entries());
          if (typeof keys === 'string') return { [keys]: memoryStore.get(keys) };
          if (Array.isArray(keys)) {
            const out: Record<string, any> = {};
            for (const k of keys) out[k] = memoryStore.get(k);
            return out;
          }
          const out: Record<string, any> = { ...keys };
          for (const k of Object.keys(keys)) {
            if (memoryStore.has(k)) out[k] = memoryStore.get(k);
          }
          return out;
        },
        set: async (items) => {
          for (const [k, v] of Object.entries(items)) memoryStore.set(k, v);
        },
        remove: async (keys) => {
          const list = typeof keys === 'string' ? [keys] : keys;
          for (const k of list) memoryStore.delete(k);
        },
        clear: async () => memoryStore.clear(),
      };
    };

    this.storage = {
      local: getArea('local'),
      sync: getArea('sync'),
    };

    // Runtime
    const rawR = this.rawBrowser?.runtime || this.rawChrome?.runtime;
    this.runtime = {
      sendMessage: (message: any): Promise<any> => {
        if (this.rawBrowser?.runtime?.sendMessage) {
          return this.rawBrowser.runtime.sendMessage(message);
        }
        if (this.rawChrome?.runtime?.sendMessage) {
          return new Promise((resolve, reject) => {
            this.rawChrome.runtime.sendMessage(message, (response: any) => {
              const lastErr = this.rawChrome.runtime?.lastError;
              if (lastErr) {
                reject(new Error(lastErr.message));
              } else {
                resolve(response);
              }
            });
          });
        }
        return Promise.reject(new Error('Runtime messaging not supported in current environment'));
      },
      onMessage: {
        addListener: (callback) => {
          if (rawR?.onMessage?.addListener) {
            rawR.onMessage.addListener(callback);
          }
        },
        removeListener: (callback) => {
          if (rawR?.onMessage?.removeListener) {
            rawR.onMessage.removeListener(callback);
          }
        },
      },
      getURL: (path: string): string => {
        if (rawR?.getURL) return rawR.getURL(path);
        return path;
      },
      getManifest: () => {
        if (rawR?.getManifest) return rawR.getManifest();
        return { name: 'Refinzi', version: '2.1.0' };
      },
    };

    // Commands
    const rawC = this.rawBrowser?.commands || this.rawChrome?.commands;
    this.commands = {
      onCommand: {
        addListener: (cb) => {
          if (rawC?.onCommand?.addListener) rawC.onCommand.addListener(cb);
        },
        removeListener: (cb) => {
          if (rawC?.onCommand?.removeListener) rawC.onCommand.removeListener(cb);
        },
      },
    };

    // Tabs
    const rawT = this.rawBrowser?.tabs || this.rawChrome?.tabs;
    this.tabs = {
      query: (queryInfo) => {
        if (this.rawBrowser?.tabs?.query) return this.rawBrowser.tabs.query(queryInfo);
        if (this.rawChrome?.tabs?.query) {
          return new Promise((resolve) => this.rawChrome.tabs.query(queryInfo, resolve));
        }
        return Promise.resolve([]);
      },
      sendMessage: (tabId, message) => {
        if (this.rawBrowser?.tabs?.sendMessage) return this.rawBrowser.tabs.sendMessage(tabId, message);
        if (this.rawChrome?.tabs?.sendMessage) {
          return new Promise((resolve, reject) => {
            this.rawChrome.tabs.sendMessage(tabId, message, (response: any) => {
              if (this.rawChrome.runtime?.lastError) {
                reject(new Error(this.rawChrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            });
          });
        }
        return Promise.resolve();
      },
    };
  }

  /**
   * Detected Browser Environment
   */
  get browserName(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'generic' {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('edg/')) return 'edge';
      if (ua.includes('firefox')) return 'firefox';
      if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
      if (ua.includes('chrome')) return 'chrome';
    }
    if (this.rawBrowser && !this.rawChrome) return 'firefox';
    return 'generic';
  }
}

export const BrowserAPI = new BrowserAPIWrapper();
