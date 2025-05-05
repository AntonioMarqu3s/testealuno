export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["admin_audit_action"]
          created_at: string
          details: Json | null
          id: string
          performed_by: string
          target_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["admin_audit_action"]
          created_at?: string
          details?: Json | null
          id?: string
          performed_by: string
          target_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["admin_audit_action"]
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string
          target_id?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          admin_level: string
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["admin_role_type"]
          user_id: string
        }
        Insert: {
          admin_level?: string
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["admin_role_type"]
          user_id: string
        }
        Update: {
          admin_level?: string
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["admin_role_type"]
          user_id?: string
        }
        Relationships: []
      }
      agentes: {
        Row: {
          created_at: string | null
          grupo_id: string | null
          id: string
          nome: string
          status: string | null
          tipo_id: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          grupo_id?: string | null
          id?: string
          nome: string
          status?: string | null
          tipo_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          grupo_id?: string | null
          id?: string
          nome?: string
          status?: string | null
          tipo_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agentes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agentes_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_agente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agentes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_data: Json | null
          client_identifier: string | null
          connect_instancia: boolean | null
          created_at: string | null
          id: string
          instance_id: string
          is_connected: boolean | null
          name: string
          type: string
          user_id: string
        }
        Insert: {
          agent_data?: Json | null
          client_identifier?: string | null
          connect_instancia?: boolean | null
          created_at?: string | null
          id: string
          instance_id: string
          is_connected?: boolean | null
          name: string
          type: string
          user_id: string
        }
        Update: {
          agent_data?: Json | null
          client_identifier?: string | null
          connect_instancia?: boolean | null
          created_at?: string | null
          id?: string
          instance_id?: string
          is_connected?: boolean | null
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      agents_extended: {
        Row: {
          discount_coupon: string | null
          email: string | null
          id: string
          instance_name: string | null
          is_connected: boolean | null
          name: string
          payment_date: string | null
          plan_end_date: string | null
          plan_id: number | null
          start_date: string | null
          trial_end_date: string | null
          user_id: string
        }
        Insert: {
          discount_coupon?: string | null
          email?: string | null
          id: string
          instance_name?: string | null
          is_connected?: boolean | null
          name: string
          payment_date?: string | null
          plan_end_date?: string | null
          plan_id?: number | null
          start_date?: string | null
          trial_end_date?: string | null
          user_id: string
        }
        Update: {
          discount_coupon?: string | null
          email?: string | null
          id?: string
          instance_name?: string | null
          is_connected?: boolean | null
          name?: string
          payment_date?: string | null
          plan_end_date?: string | null
          plan_id?: number | null
          start_date?: string | null
          trial_end_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_extended_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      group_admins: {
        Row: {
          admin_id: string
          created_at: string
          created_by: string
          group_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          created_by: string
          group_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          created_by?: string
          group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_admins_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "group_admins_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_at: string | null
          group_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_users: {
        Row: {
          created_at: string
          group_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_users_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      grupos: {
        Row: {
          admin_id: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          data_expiracao: string | null
          data_pagamento: string
          id: string
          is_promo_applied: boolean | null
          plano_id: number | null
          promo_code: string | null
          status: string
          user_id: string | null
          valor: number
        }
        Insert: {
          data_expiracao?: string | null
          data_pagamento: string
          id?: string
          is_promo_applied?: boolean | null
          plano_id?: number | null
          promo_code?: string | null
          status: string
          user_id?: string | null
          valor: number
        }
        Update: {
          data_expiracao?: string | null
          data_pagamento?: string
          id?: string
          is_promo_applied?: boolean | null
          plano_id?: number | null
          promo_code?: string | null
          status?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          email: string | null
          error: string | null
          id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          email?: string | null
          error?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          email?: string | null
          error?: string | null
          id?: string
          status?: string | null
        }
        Relationships: []
      }
      planos: {
        Row: {
          agentes: number
          descricao: string | null
          id: number
          nome: string
          valor: number
        }
        Insert: {
          agentes: number
          descricao?: string | null
          id?: number
          nome: string
          valor: number
        }
        Update: {
          agentes?: number
          descricao?: string | null
          id?: number
          nome?: string
          valor?: number
        }
        Relationships: []
      }
      plans: {
        Row: {
          agent_limit: number
          created_at: string | null
          description: string
          id: string
          name: string
          price: number
          trial_days: number | null
          type: number
          updated_at: string | null
        }
        Insert: {
          agent_limit?: number
          created_at?: string | null
          description: string
          id?: string
          name: string
          price?: number
          trial_days?: number | null
          type: number
          updated_at?: string | null
        }
        Update: {
          agent_limit?: number
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          price?: number
          trial_days?: number | null
          type?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          type?: string
        }
        Relationships: []
      }
      temp_pagamentos: {
        Row: {
          created_at: string | null
          data_expiracao: string | null
          data_pagamento: string | null
          error: string | null
          id: string
          is_promo_applied: boolean | null
          plano_id: number | null
          promo_code: string | null
          status: string
          user_email: string
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_expiracao?: string | null
          data_pagamento?: string | null
          error?: string | null
          id?: string
          is_promo_applied?: boolean | null
          plano_id?: number | null
          promo_code?: string | null
          status: string
          user_email: string
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_expiracao?: string | null
          data_pagamento?: string | null
          error?: string | null
          id?: string
          is_promo_applied?: boolean | null
          plano_id?: number | null
          promo_code?: string | null
          status?: string
          user_email?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      tipos_agente: {
        Row: {
          id: number
          nome: string
        }
        Insert: {
          id?: number
          nome: string
        }
        Update: {
          id?: number
          nome?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          agent_limit: number
          connect_instancia: boolean | null
          id: string
          name: string
          payment_date: string | null
          payment_status: string | null
          plan: number
          subscription_ends_at: string | null
          trial_ends_at: string | null
          trial_init: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_limit?: number
          connect_instancia?: boolean | null
          id?: string
          name: string
          payment_date?: string | null
          payment_status?: string | null
          plan?: number
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          trial_init?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_limit?: number
          connect_instancia?: boolean | null
          id?: string
          name?: string
          payment_date?: string | null
          payment_status?: string | null
          plan?: number
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          trial_init?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          admin_level: string | null
          agentes_limite: number | null
          avatar_url: string | null
          benefits: string | null
          clientidentifier: string | null
          commonobjections: string | null
          companydescription: string | null
          companyname: string | null
          competitors: string | null
          conect: boolean | null
          created_at: string | null
          custompersonality: string | null
          data_expiracao: string | null
          data_pagamento: string | null
          differentials: string | null
          email: string
          empresa_dados: string | null
          empresa_nome: string | null
          faqs: string | null
          full_name: string | null
          google_docs_id: string | null
          google_sheet_id: string | null
          id: string
          instanceid: string | null
          instancename: string | null
          instancia_nome: string | null
          instancia_telefone: string | null
          last_payment_amount: number | null
          last_payment_date: string | null
          maindifferentials: string | null
          mission: string | null
          nome: string | null
          objecoes: string | null
          personality: string | null
          plano_id: number | null
          plano_nome: string | null
          plano_status: string | null
          plano_valor: number | null
          problemssolved: string | null
          productdescription: string | null
          productname: string | null
          script: string | null
          segment: string | null
          telefone: string | null
          updated_at: string | null
          vision: string | null
        }
        Insert: {
          admin_level?: string | null
          agentes_limite?: number | null
          avatar_url?: string | null
          benefits?: string | null
          clientidentifier?: string | null
          commonobjections?: string | null
          companydescription?: string | null
          companyname?: string | null
          competitors?: string | null
          conect?: boolean | null
          created_at?: string | null
          custompersonality?: string | null
          data_expiracao?: string | null
          data_pagamento?: string | null
          differentials?: string | null
          email: string
          empresa_dados?: string | null
          empresa_nome?: string | null
          faqs?: string | null
          full_name?: string | null
          google_docs_id?: string | null
          google_sheet_id?: string | null
          id: string
          instanceid?: string | null
          instancename?: string | null
          instancia_nome?: string | null
          instancia_telefone?: string | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          maindifferentials?: string | null
          mission?: string | null
          nome?: string | null
          objecoes?: string | null
          personality?: string | null
          plano_id?: number | null
          plano_nome?: string | null
          plano_status?: string | null
          plano_valor?: number | null
          problemssolved?: string | null
          productdescription?: string | null
          productname?: string | null
          script?: string | null
          segment?: string | null
          telefone?: string | null
          updated_at?: string | null
          vision?: string | null
        }
        Update: {
          admin_level?: string | null
          agentes_limite?: number | null
          avatar_url?: string | null
          benefits?: string | null
          clientidentifier?: string | null
          commonobjections?: string | null
          companydescription?: string | null
          companyname?: string | null
          competitors?: string | null
          conect?: boolean | null
          created_at?: string | null
          custompersonality?: string | null
          data_expiracao?: string | null
          data_pagamento?: string | null
          differentials?: string | null
          email?: string
          empresa_dados?: string | null
          empresa_nome?: string | null
          faqs?: string | null
          full_name?: string | null
          google_docs_id?: string | null
          google_sheet_id?: string | null
          id?: string
          instanceid?: string | null
          instancename?: string | null
          instancia_nome?: string | null
          instancia_telefone?: string | null
          last_payment_amount?: number | null
          last_payment_date?: string | null
          maindifferentials?: string | null
          mission?: string | null
          nome?: string | null
          objecoes?: string | null
          personality?: string | null
          plano_id?: number | null
          plano_nome?: string | null
          plano_status?: string | null
          plano_valor?: number | null
          problemssolved?: string | null
          productdescription?: string | null
          productname?: string | null
          script?: string | null
          segment?: string | null
          telefone?: string | null
          updated_at?: string | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_metrics: {
        Row: {
          active_subscriptions: number | null
          free_trials: number | null
          total_agents: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_audit_log: {
        Args: {
          p_action: Database["public"]["Enums"]["admin_audit_action"]
          p_target_id?: string
          p_details?: Json
        }
        Returns: string
      }
      admin_count_active_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      admin_count_agents: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      admin_count_new_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      admin_count_total_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          count: number
        }[]
      }
      admin_create_admin_user: {
        Args: { p_email: string; p_password: string }
        Returns: string
      }
      admin_create_group: {
        Args: { p_name: string; p_description?: string }
        Returns: string
      }
      admin_create_group_admin: {
        Args: { p_email: string; p_password: string; p_group_ids: string[] }
        Returns: string
      }
      admin_create_master_admin: {
        Args: { p_email: string; p_password: string }
        Returns: string
      }
      admin_create_user: {
        Args: { p_email: string; p_password: string; p_plan_type: number }
        Returns: string
      }
      admin_delete_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      admin_list_group_users: {
        Args: { p_group_id: string }
        Returns: {
          user_id: string
          email: string
          created_at: string
        }[]
      }
      admin_list_groups: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          created_at: string
          created_by: string
          updated_at: string
          total_users: number
          total_admins: number
        }[]
      }
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          created_at: string
          last_sign_in_at: string
          plan_id: string
          plan_name: string
          plan_type: number
          agent_limit: number
          trial_ends_at: string
          subscription_ends_at: string
          payment_status: string
          is_admin: boolean
        }[]
      }
      admin_update_user_plan: {
        Args: { p_user_id: string; p_plan_type: number; p_agent_limit: number }
        Returns: boolean
      }
      buscar_pagamentos_por_email: {
        Args: { email_busca: string }
        Returns: {
          id: string
          email: string
          nome: string
          plano: number
          status_pagamento: string
          valor: number
          data_pagamento: string
          validade_assinatura: string
        }[]
      }
      count_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_admin_audit_logs_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_level: {
        Args: { checking_user_id?: string }
        Returns: string
      }
      get_auth_user_emails: {
        Args: { user_ids: string[] }
        Returns: {
          id: string
          email: string
        }[]
      }
      get_auth_users_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_plan_name: {
        Args: { p_plano_id: number }
        Returns: string
      }
      get_user_by_email: {
        Args: { p_email: string }
        Returns: {
          id: string
          email: string
        }[]
      }
      get_user_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_id_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { checking_user_id: string }
        Returns: boolean
      }
      is_master_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      register_payment_with_log: {
        Args: {
          p_email: string
          p_plano_id: number
          p_valor: number
          p_promo_code?: string
        }
        Returns: Json
      }
      registrar_pagamento: {
        Args:
          | {
              p_email: string
              p_plano_id: number
              p_valor: number
              p_data_pagamento: string
              p_data_expiracao?: string
              p_promo_code?: string
              p_is_promo_applied?: boolean
              p_status?: string
            }
          | {
              p_email: string
              p_plano_id: number
              p_valor: number
              p_data_pagamento: string
              p_data_expiracao?: string
              p_promo_code?: string
              p_is_promo_applied?: boolean
              p_status?: string
            }
        Returns: Json
      }
      registrar_pagamento_simples: {
        Args: { p_email: string; p_plano_id: number; p_valor: number }
        Returns: Json
      }
      send_admin_notification: {
        Args: {
          p_admin_id: string
          p_type: string
          p_title: string
          p_message: string
        }
        Returns: string
      }
      test_payment_registration: {
        Args: { p_email: string; p_plano_id: number; p_valor: number }
        Returns: Json
      }
      update_user_details: {
        Args: { p_user_id: string; p_email: string; p_password?: string }
        Returns: undefined
      }
    }
    Enums: {
      admin_audit_action:
        | "create_admin"
        | "update_admin"
        | "delete_admin"
        | "create_group"
        | "update_group"
        | "delete_group"
        | "add_group_user"
        | "remove_group_user"
        | "add_group_admin"
        | "remove_group_admin"
        | "update_settings"
      admin_role_type: "master" | "group"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_audit_action: [
        "create_admin",
        "update_admin",
        "delete_admin",
        "create_group",
        "update_group",
        "delete_group",
        "add_group_user",
        "remove_group_user",
        "add_group_admin",
        "remove_group_admin",
        "update_settings",
      ],
      admin_role_type: ["master", "group"],
    },
  },
} as const
