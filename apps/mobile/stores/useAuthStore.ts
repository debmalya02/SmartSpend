import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const API_URL = 'http://192.168.0.177:3000'; // Local Machine IP
// const API_URL = 'https://smartspend-h9vm.onrender.com'; // Production

interface UserProfile {
    id: string;
    phone: string;
    name: string | null;
    isOnboarded: boolean;
    currency: string;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isInitialized: boolean;
    
    // Computed
    isLoggedIn: boolean;
    needsOnboarding: boolean;
    
    // Actions
    initialize: () => Promise<void>;
    sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
    verifyOTP: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
    setUsername: (name: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    userProfile: null,
    isLoading: false,
    isInitialized: false,
    isLoggedIn: false,
    needsOnboarding: false,

    initialize: async () => {
        try {
            set({ isLoading: true });
            
            // Get current session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
                set({ isLoading: false, isInitialized: true });
                return;
            }
            
            if (session) {
                set({ 
                    session, 
                    user: session.user,
                    isLoggedIn: true,
                });
                
                // Fetch user profile from backend
                await get().fetchUserProfile();
            }
            
            set({ isLoading: false, isInitialized: true });
            
            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth state changed:', event);
                
                if (session) {
                    set({ 
                        session, 
                        user: session.user,
                        isLoggedIn: true,
                    });
                    
                    if (event === 'SIGNED_IN') {
                        await get().fetchUserProfile();
                    }
                } else {
                    set({ 
                        session: null, 
                        user: null, 
                        userProfile: null,
                        isLoggedIn: false,
                        needsOnboarding: false,
                    });
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    fetchUserProfile: async () => {
        const { user } = get();
        if (!user?.id || !user?.phone) return;
        
        try {
            // First try to find by Supabase user ID
            const response = await fetch(`${API_URL}/users/${user.id}`);
            
            if (response.ok) {
                const profile = await response.json();
                set({ 
                    userProfile: profile,
                    needsOnboarding: !profile.isOnboarded || !profile.name,
                });
            } else if (response.status === 404) {
                // User doesn't exist in backend yet, create with Supabase UID
                const createResponse = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id: user.id,  // Use Supabase user ID
                        phone: user.phone 
                    }),
                });
                
                if (createResponse.ok) {
                    const newProfile = await createResponse.json();
                    set({ 
                        userProfile: newProfile,
                        needsOnboarding: true,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    },

    sendOTP: async (phone: string) => {
        set({ isLoading: true });
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
            });
            
            if (error) {
                set({ isLoading: false });
                return { success: false, error: error.message };
            }
            
            set({ isLoading: false });
            return { success: true };
        } catch (error: any) {
            set({ isLoading: false });
            return { success: false, error: error.message || 'Failed to send OTP' };
        }
    },

    verifyOTP: async (phone: string, token: string) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'sms',
            });
            
            if (error) {
                set({ isLoading: false });
                return { success: false, error: error.message };
            }
            
            if (data.session) {
                set({ 
                    session: data.session, 
                    user: data.user,
                    isLoggedIn: true,
                    isLoading: false,
                });
                
                // Fetch or create user profile
                await get().fetchUserProfile();
            }
            
            return { success: true };
        } catch (error: any) {
            set({ isLoading: false });
            return { success: false, error: error.message || 'Failed to verify OTP' };
        }
    },

    setUsername: async (name: string) => {
        const { userProfile } = get();
        if (!userProfile) {
            return { success: false, error: 'No user profile found' };
        }
        
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/users/${userProfile.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, isOnboarded: true }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            
            const updatedProfile = await response.json();
            set({ 
                userProfile: updatedProfile,
                needsOnboarding: false,
                isLoading: false,
            });
            
            return { success: true };
        } catch (error: any) {
            set({ isLoading: false });
            return { success: false, error: error.message || 'Failed to set username' };
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
            set({ 
                user: null, 
                session: null, 
                userProfile: null,
                isLoggedIn: false,
                needsOnboarding: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error signing out:', error);
            set({ isLoading: false });
        }
    },
}));
