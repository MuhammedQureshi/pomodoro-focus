import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: 'work' | 'shortBreak' | 'longBreak';
          duration_minutes: number;
          completed: boolean;
          started_at: string;
          completed_at: string | null;
          interrupted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mode: 'work' | 'shortBreak' | 'longBreak';
          duration_minutes: number;
          completed?: boolean;
          started_at?: string;
          completed_at?: string | null;
          interrupted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mode?: 'work' | 'shortBreak' | 'longBreak';
          duration_minutes?: number;
          completed?: boolean;
          started_at?: string;
          completed_at?: string | null;
          interrupted?: boolean;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 