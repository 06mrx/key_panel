import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Initialize Supabase client
export const supabase = createClient(
    env.SUPABASE_URL || '',
    env.SUPABASE_ANON_KEY || ''
);

// Helper functions for database operations
export async function getRow(table: string, query: any) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(query)
        .single();
    
    if (error) throw error;
    return data;
}

export async function getRows(table: string, query: any = {}) {
    const { data, error } = await supabase
        .from(table)
        .select('*')
        .match(query);
    
    if (error) throw error;
    return data;
}

export async function insertRow(table: string, data: any) {
    const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
    
    if (error) throw error;
    return result;
}

export async function updateRow(table: string, query: any, data: any) {
    const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .match(query)
        .select()
        .single();
    
    if (error) throw error;
    return result;
}

export async function deleteRow(table: string, query: any) {
    const { error } = await supabase
        .from(table)
        .delete()
        .match(query);
    
    if (error) throw error;
    return true;
} 