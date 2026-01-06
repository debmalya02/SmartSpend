
import { createClient } from '@supabase/supabase-js';

// Ensure these are defined in your .env or .env.local
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadToSupabase = async (uri: string, bucketName = 'receipts') => {
    try {
        const filename = uri.split('/').pop();
        const extension = filename?.split('.').pop();
        const path = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(path, arrayBuffer, {
                contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            throw error;
        }

        const { data: signedData, error: signError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(path, 60);

        if (signError) {
            throw signError;
        }

        return signedData.signedUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};
