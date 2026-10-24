export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string
          animal_id: string | null
          created_at: string
          done: boolean
          id: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          animal_id?: string | null
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          type: string
          user_id?: string
        }
        Update: {
          activity_date?: string
          animal_id?: string | null
          created_at?: string
          done?: boolean
          id?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          acquired_date: string | null
          birth_date: string | null
          breed: string | null
          created_at: string
          id: string
          kind: string
          location: string | null
          name: string
          notes: string | null
          quantity: number
          sex: string | null
          species: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquired_date?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          kind?: string
          location?: string | null
          name: string
          notes?: string | null
          quantity?: number
          sex?: string | null
          species: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          acquired_date?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          id?: string
          kind?: string
          location?: string | null
          name?: string
          notes?: string | null
          quantity?: number
          sex?: string | null
          species?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_name: string | null
          body: string
          category: string
          created_at: string
          id: string
          likes: number
          user_id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          category?: string
          created_at?: string
          id?: string
          likes?: number
          user_id?: string
        }
        Update: {
          author_name?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          likes?: number
          user_id?: string
        }
        Relationships: []
      }
      consultation_requests: {
        Row: {
          animal_id: string | null
          concern: string
          contact_method: string
          created_at: string
          id: string
          preferred_time: string | null
          status: string
          symptoms: string | null
          user_id: string
          vet_name: string
        }
        Insert: {
          animal_id?: string | null
          concern: string
          contact_method?: string
          created_at?: string
          id?: string
          preferred_time?: string | null
          status?: string
          symptoms?: string | null
          user_id?: string
          vet_name: string
        }
        Update: {
          animal_id?: string | null
          concern?: string
          contact_method?: string
          created_at?: string
          id?: string
          preferred_time?: string | null
          status?: string
          symptoms?: string | null
          user_id?: string
          vet_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          animal_id: string
          created_at: string
          details: string | null
          given_by: string | null
          id: string
          next_date: string | null
          outcome: string | null
          record_date: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          details?: string | null
          given_by?: string | null
          id?: string
          next_date?: string | null
          outcome?: string | null
          record_date?: string
          title: string
          type: string
          user_id?: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          details?: string | null
          given_by?: string | null
          id?: string
          next_date?: string | null
          outcome?: string | null
          record_date?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          currency: string
          farm_name: string | null
          farm_size: string | null
          full_name: string | null
          id: string
          language: string
          livestock_types: string[]
          location: string | null
          onboarded: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          farm_name?: string | null
          farm_size?: string | null
          full_name?: string | null
          id: string
          language?: string
          livestock_types?: string[]
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          farm_name?: string | null
          farm_size?: string | null
          full_name?: string | null
          id?: string
          language?: string
          livestock_types?: string[]
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          animal_id: string | null
          created_at: string
          due_date: string
          due_time: string | null
          id: string
          notes: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          due_date: string
          due_time?: string | null
          id?: string
          notes?: string | null
          status?: string
          title: string
          type: string
          user_id?: string
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          due_date?: string
          due_time?: string | null
          id?: string
          notes?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          kind: string
          tx_date: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          tx_date?: string
          user_id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          tx_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
