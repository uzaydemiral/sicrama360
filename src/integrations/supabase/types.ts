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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_settings: {
        Row: {
          campaign_end_date: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          campaign_end_date: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          campaign_end_date?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          name: string
          subject: string
          text_content: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          text_content: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          text_content?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          access_token: string | null
          amount: number
          callback_received_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          payment_status: string | null
          paytr_order_id: string | null
          product_id: string
          redirect_url: string | null
          tier: string
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          amount: number
          callback_received_at?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          payment_status?: string | null
          paytr_order_id?: string | null
          product_id: string
          redirect_url?: string | null
          tier?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          amount?: number
          callback_received_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          payment_status?: string | null
          paytr_order_id?: string | null
          product_id?: string
          redirect_url?: string | null
          tier?: string
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bonus_assets: Json | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          pdf_url: string | null
          price: number
          primary_pdf_path: string | null
          slug: string | null
          title: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          bonus_assets?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          pdf_url?: string | null
          price: number
          primary_pdf_path?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          bonus_assets?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          pdf_url?: string | null
          price?: number
          primary_pdf_path?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      program_stats: {
        Row: {
          average_improvement: number
          id: string
          total_athletes: number
          total_cm_gained: number
          updated_at: string
        }
        Insert: {
          average_improvement?: number
          id?: string
          total_athletes?: number
          total_cm_gained?: number
          updated_at?: string
        }
        Update: {
          average_improvement?: number
          id?: string
          total_athletes?: number
          total_cm_gained?: number
          updated_at?: string
        }
        Relationships: []
      }
      quiz_leads: {
        Row: {
          answers: Json
          converted: boolean | null
          created_at: string | null
          current_jump: number | null
          email: string
          id: string
          name: string | null
          potential_improvement: number | null
        }
        Insert: {
          answers: Json
          converted?: boolean | null
          created_at?: string | null
          current_jump?: number | null
          email: string
          id?: string
          name?: string | null
          potential_improvement?: number | null
        }
        Update: {
          answers?: Json
          converted?: boolean | null
          created_at?: string | null
          current_jump?: number | null
          email?: string
          id?: string
          name?: string | null
          potential_improvement?: number | null
        }
        Relationships: []
      }
      rate_limit_tracking: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          badge: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          after_cm: number
          age: string
          before_cm: number
          created_at: string
          display_order: number | null
          id: string
          improvement_cm: number | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          quote: string
          sport: string
          updated_at: string
          video_url: string | null
          weeks_completed: string
        }
        Insert: {
          after_cm: number
          age: string
          before_cm: number
          created_at?: string
          display_order?: number | null
          id?: string
          improvement_cm?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          quote: string
          sport: string
          updated_at?: string
          video_url?: string | null
          weeks_completed: string
        }
        Update: {
          after_cm?: number
          age?: string
          before_cm?: number
          created_at?: string
          display_order?: number | null
          id?: string
          improvement_cm?: number | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          quote?: string
          sport?: string
          updated_at?: string
          video_url?: string | null
          weeks_completed?: string
        }
        Relationships: []
      }
      upsell_events: {
        Row: {
          base_order_amount: number | null
          created_at: string
          customer_email: string | null
          event_type: string
          id: string
          upsell_price: number
        }
        Insert: {
          base_order_amount?: number | null
          created_at?: string
          customer_email?: string | null
          event_type: string
          id?: string
          upsell_price: number
        }
        Update: {
          base_order_amount?: number | null
          created_at?: string
          customer_email?: string | null
          event_type?: string
          id?: string
          upsell_price?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_order_by_paytr_id: {
        Args: { paytr_id: string }
        Returns: {
          amount: number
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          payment_status: string
          product_id: string
          product_name: string
          product_pdf_url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
