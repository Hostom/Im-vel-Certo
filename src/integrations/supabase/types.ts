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
      configuracoes_regionais: {
        Row: {
          ativo: boolean | null
          configuracoes: Json | null
          created_at: string | null
          gerente_responsavel_id: string | null
          id: string
          meta_captacoes_mes: number | null
          prazo_padrao_horas: number | null
          regiao: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          gerente_responsavel_id?: string | null
          id?: string
          meta_captacoes_mes?: number | null
          prazo_padrao_horas?: number | null
          regiao: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          gerente_responsavel_id?: string | null
          id?: string
          meta_captacoes_mes?: number | null
          prazo_padrao_horas?: number | null
          regiao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_regionais_gerente_responsavel_id_fkey"
            columns: ["gerente_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      demandas: {
        Row: {
          caracteristicas_desejadas: string | null
          cliente_interessado: string
          codigo_demanda: string
          consultor_locacao: string
          contato: string
          created_at: string | null
          criado_por_id: string | null
          faixa_aluguel: string
          id: string
          observacoes: string | null
          prazo_necessidade: string
          regiao_demanda: string | null
          regiao_desejada: string
          status: string | null
          tipo_imovel: string
          updated_at: string | null
          valor_aluguel_max: number | null
          valor_aluguel_min: number | null
        }
        Insert: {
          caracteristicas_desejadas?: string | null
          cliente_interessado: string
          codigo_demanda: string
          consultor_locacao: string
          contato: string
          created_at?: string | null
          criado_por_id?: string | null
          faixa_aluguel: string
          id?: string
          observacoes?: string | null
          prazo_necessidade: string
          regiao_demanda?: string | null
          regiao_desejada: string
          status?: string | null
          tipo_imovel: string
          updated_at?: string | null
          valor_aluguel_max?: number | null
          valor_aluguel_min?: number | null
        }
        Update: {
          caracteristicas_desejadas?: string | null
          cliente_interessado?: string
          codigo_demanda?: string
          consultor_locacao?: string
          contato?: string
          created_at?: string | null
          criado_por_id?: string | null
          faixa_aluguel?: string
          id?: string
          observacoes?: string | null
          prazo_necessidade?: string
          regiao_demanda?: string | null
          regiao_desejada?: string
          status?: string | null
          tipo_imovel?: string
          updated_at?: string | null
          valor_aluguel_max?: number | null
          valor_aluguel_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demandas_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_missoes: {
        Row: {
          alterado_por_id: string | null
          created_at: string | null
          id: string
          missao_id: string | null
          observacoes: string | null
          status_anterior: string | null
          status_novo: string | null
          tempo_na_etapa_minutos: number | null
        }
        Insert: {
          alterado_por_id?: string | null
          created_at?: string | null
          id?: string
          missao_id?: string | null
          observacoes?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          tempo_na_etapa_minutos?: number | null
        }
        Update: {
          alterado_por_id?: string | null
          created_at?: string | null
          id?: string
          missao_id?: string | null
          observacoes?: string | null
          status_anterior?: string | null
          status_novo?: string | null
          tempo_na_etapa_minutos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_missoes_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      missoes: {
        Row: {
          captador_id: string | null
          created_at: string | null
          criado_por_id: string | null
          data_atribuicao: string | null
          data_conclusao: string | null
          data_limite: string | null
          demanda_id: string | null
          id: string
          imovel_encontrado_detalhes: string | null
          observacoes_captador: string | null
          prazo_horas: number | null
          resultado: string | null
          status: string | null
          tempo_decorrido_minutos: number | null
          updated_at: string | null
        }
        Insert: {
          captador_id?: string | null
          created_at?: string | null
          criado_por_id?: string | null
          data_atribuicao?: string | null
          data_conclusao?: string | null
          data_limite?: string | null
          demanda_id?: string | null
          id?: string
          imovel_encontrado_detalhes?: string | null
          observacoes_captador?: string | null
          prazo_horas?: number | null
          resultado?: string | null
          status?: string | null
          tempo_decorrido_minutos?: number | null
          updated_at?: string | null
        }
        Update: {
          captador_id?: string | null
          created_at?: string | null
          criado_por_id?: string | null
          data_atribuicao?: string | null
          data_conclusao?: string | null
          data_limite?: string | null
          demanda_id?: string | null
          id?: string
          imovel_encontrado_detalhes?: string | null
          observacoes_captador?: string | null
          prazo_horas?: number | null
          resultado?: string | null
          status?: string | null
          tempo_decorrido_minutos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missoes_captador_id_fkey"
            columns: ["captador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missoes_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missoes_demanda_id_fkey"
            columns: ["demanda_id"]
            isOneToOne: false
            referencedRelation: "demandas"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios: {
        Row: {
          created_at: string | null
          dados: Json | null
          data_fim: string | null
          data_inicio: string | null
          filtros: Json | null
          gerado_por_id: string | null
          id: string
          regiao: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          dados?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          filtros?: Json | null
          gerado_por_id?: string | null
          id?: string
          regiao?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          dados?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          filtros?: Json | null
          gerado_por_id?: string | null
          id?: string
          regiao?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_gerado_por_id_fkey"
            columns: ["gerado_por_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          gerente_responsavel_id: string | null
          id: string
          nome: string
          regiao: string | null
          regioes_responsavel: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          gerente_responsavel_id?: string | null
          id?: string
          nome: string
          regiao?: string | null
          regioes_responsavel?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          gerente_responsavel_id?: string | null
          id?: string
          nome?: string
          regiao?: string | null
          regioes_responsavel?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_gerente_responsavel_id_fkey"
            columns: ["gerente_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_metricas_dashboard: {
        Row: {
          demandas_concluidas: number | null
          demandas_em_captacao: number | null
          demandas_pendentes: number | null
          missoes_ativas: number | null
          missoes_sucesso: number | null
          missoes_tempo_esgotado: number | null
          tempo_medio_conclusao_horas: number | null
          total_demandas: number | null
          total_missoes: number | null
        }
        Relationships: []
      }
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
    Enums: {},
  },
} as const
