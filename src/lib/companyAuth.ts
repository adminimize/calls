import { db } from './db';
import type { User } from '@instantdb/core';

export interface CompanyAuthState {
    isLoading: boolean;
    error: Error | null;
    user: User | null;
}

export const companyAuth = {
    // Get the current auth state using InstantDB's useAuth
    useAuth: () => {
        return db.useAuth();
    },

    // Send magic code for email authentication
    sendMagicCode: async (email: string) => {
        try {
            await db.auth.sendMagicCode({ email });
            return { success: true };
        } catch (err) {
            console.error('Failed to send magic code:', err);
            throw err;
        }
    },

    // Verify magic code and sign in
    verifyAndSignIn: async (email: string, code: string) => {
        try {
            await db.auth.signInWithMagicCode({ email, code });
            return { success: true };
        } catch (err) {
            console.error('Failed to verify code:', err);
            throw err;
        }
    },

    // Sign out the current user
    signOut: async () => {
        try {
            await db.auth.signOut();
            return { success: true };
        } catch (err) {
            console.error('Failed to sign out:', err);
            throw err;
        }
    }
}; 