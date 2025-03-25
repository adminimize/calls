// Storage adapter type for InstantDB
interface StorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

const isServer = typeof window === 'undefined';

export const storage: StorageAdapter = {
    getItem: (key: string): string | null => {
        if (isServer) {
            console.log('[Server] getItem:', key);
            return null;
        }
        const value = window.localStorage.getItem(key);
        console.log('[Client] getItem:', { key, value });
        return value;
    },
    
    setItem: (key: string, value: string): void => {
        if (isServer) {
            console.log('[Server] setItem:', { key, value });
            return;
        }
        console.log('[Client] setItem:', { key, value });
        window.localStorage.setItem(key, value);
    },
    
    removeItem: (key: string): void => {
        if (isServer) {
            console.log('[Server] removeItem:', key);
            return;
        }
        console.log('[Client] removeItem:', key);
        window.localStorage.removeItem(key);
    }
}; 