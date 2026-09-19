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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_last4: string | null
          apy: number | null
          available_cents: number
          currency: string
          current_cents: number
          display_name: string
          id: string
          opened_at: string
          provider_reference: string | null
          routing_last4: string | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_last4?: string | null
          apy?: number | null
          available_cents?: number
          currency?: string
          current_cents?: number
          display_name: string
          id?: string
          opened_at?: string
          provider_reference?: string | null
          routing_last4?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_last4?: string | null
          apy?: number | null
          available_cents?: number
          currency?: string
          current_cents?: number
          display_name?: string
          id?: string
          opened_at?: string
          provider_reference?: string | null
          routing_last4?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["account_status"]
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          ip_address: string | null
          new_state: Json | null
          previous_state: Json | null
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          new_state?: Json | null
          previous_state?: Json | null
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      bill_payments: {
        Row: {
          account_id: string | null
          amount_cents: number
          biller_id: string
          created_at: string
          due_date: string
          id: string
          provider_reference: string | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["txn_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          biller_id: string
          created_at?: string
          due_date: string
          id?: string
          provider_reference?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          biller_id?: string
          created_at?: string
          due_date?: string
          id?: string
          provider_reference?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_biller_id_fkey"
            columns: ["biller_id"]
            isOneToOne: false
            referencedRelation: "billers"
            referencedColumns: ["id"]
          },
        ]
      }
      billers: {
        Row: {
          account_last4: string | null
          autopay: boolean
          created_at: string
          id: string
          name: string
          nickname: string | null
          user_id: string
        }
        Insert: {
          account_last4?: string | null
          autopay?: boolean
          created_at?: string
          id?: string
          name: string
          nickname?: string | null
          user_id: string
        }
        Update: {
          account_last4?: string | null
          autopay?: boolean
          created_at?: string
          id?: string
          name?: string
          nickname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string | null
          cardholder_name: string
          created_at: string
          design: string
          exp_month: number | null
          exp_year: number | null
          id: string
          last4: string | null
          provider_reference: string | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["card_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          cardholder_name: string
          created_at?: string
          design?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          last4?: string | null
          provider_reference?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          cardholder_name?: string
          created_at?: string
          design?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          last4?: string | null
          provider_reference?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_accounts: {
        Row: {
          account_type: string
          aggregator_item_id: string | null
          created_at: string
          id: string
          institution: string
          last_synced_at: string | null
          last4: string | null
          status: Database["public"]["Enums"]["connection_status"]
          user_id: string
        }
        Insert: {
          account_type: string
          aggregator_item_id?: string | null
          created_at?: string
          id?: string
          institution: string
          last_synced_at?: string | null
          last4?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          user_id: string
        }
        Update: {
          account_type?: string
          aggregator_item_id?: string | null
          created_at?: string
          id?: string
          institution?: string
          last_synced_at?: string | null
          last4?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string
          id: string
          label: string
          last_seen_at: string
          trusted: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          last_seen_at?: string
          trusted?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          last_seen_at?: string
          trusted?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          account_id: string | null
          category: string
          created_at: string
          current_cents: number
          id: string
          name: string
          target_cents: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          category?: string
          created_at?: string
          current_cents?: number
          id?: string
          name: string
          target_cents: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          category?: string
          created_at?: string
          current_cents?: number
          id?: string
          name?: string
          target_cents?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_accounts: {
        Row: {
          account_id: string | null
          cash_cents: number
          custodian: string | null
          day_change_cents: number
          id: string
          portfolio_value_cents: number
          source: Database["public"]["Enums"]["data_source"]
          total_return_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          cash_cents?: number
          custodian?: string | null
          day_change_cents?: number
          id?: string
          portfolio_value_cents?: number
          source?: Database["public"]["Enums"]["data_source"]
          total_return_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          cash_cents?: number
          custodian?: string | null
          day_change_cents?: number
          id?: string
          portfolio_value_cents?: number
          source?: Database["public"]["Enums"]["data_source"]
          total_return_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_holdings: {
        Row: {
          asset_class: string
          cost_basis_cents: number
          id: string
          investment_account_id: string
          market_value_cents: number
          name: string
          quantity: number
          source: Database["public"]["Enums"]["data_source"]
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_class?: string
          cost_basis_cents?: number
          id?: string
          investment_account_id: string
          market_value_cents?: number
          name: string
          quantity?: number
          source?: Database["public"]["Enums"]["data_source"]
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_class?: string
          cost_basis_cents?: number
          id?: string
          investment_account_id?: string
          market_value_cents?: number
          name?: string
          quantity?: number
          source?: Database["public"]["Enums"]["data_source"]
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_holdings_investment_account_id_fkey"
            columns: ["investment_account_id"]
            isOneToOne: false
            referencedRelation: "investment_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_transactions: {
        Row: {
          action: string
          amount_cents: number
          id: string
          investment_account_id: string
          occurred_at: string
          quantity: number | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["txn_status"]
          symbol: string | null
          user_id: string
        }
        Insert: {
          action: string
          amount_cents?: number
          id?: string
          investment_account_id: string
          occurred_at?: string
          quantity?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          symbol?: string | null
          user_id: string
        }
        Update: {
          action?: string
          amount_cents?: number
          id?: string
          investment_account_id?: string
          occurred_at?: string
          quantity?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          symbol?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_transactions_investment_account_id_fkey"
            columns: ["investment_account_id"]
            isOneToOne: false
            referencedRelation: "investment_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          account_id: string | null
          amount_cents: number
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          interest_rate: number
          purpose: string
          reference: string
          status: Database["public"]["Enums"]["loan_status"]
          term_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          interest_rate?: number
          purpose: string
          reference?: string
          status?: Database["public"]["Enums"]["loan_status"]
          term_months?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          interest_rate?: number
          purpose?: string
          reference?: string
          status?: Database["public"]["Enums"]["loan_status"]
          term_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      login_sessions: {
        Row: {
          device_id: string | null
          ended_at: string | null
          id: string
          ip_address: string | null
          location: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          device_id?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          device_id?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          kyc_note: string | null
          kyc_reviewed_at: string | null
          kyc_reviewed_by: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_name: string
          phone: string | null
          postal_code: string | null
          risk_profile: Database["public"]["Enums"]["risk_profile"] | null
          state: string | null
          status: Database["public"]["Enums"]["account_status"]
          two_factor_enabled: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          address_line1?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id: string
          kyc_note?: string | null
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"] | null
          state?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          address_line1?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          kyc_note?: string | null
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          risk_profile?: Database["public"]["Enums"]["risk_profile"] | null
          state?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      provider_integrations: {
        Row: {
          display_name: string
          env_var_name: string | null
          id: string
          kind: Database["public"]["Enums"]["provider_kind"]
          last_checked_at: string | null
          state: Database["public"]["Enums"]["provider_state"]
          updated_at: string
          vendor: string | null
        }
        Insert: {
          display_name: string
          env_var_name?: string | null
          id?: string
          kind: Database["public"]["Enums"]["provider_kind"]
          last_checked_at?: string | null
          state?: Database["public"]["Enums"]["provider_state"]
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          display_name?: string
          env_var_name?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["provider_kind"]
          last_checked_at?: string | null
          state?: Database["public"]["Enums"]["provider_state"]
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          description: string
          id: string
          reference: string | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["reward_status"]
          transaction_id: string | null
          type: Database["public"]["Enums"]["reward_type"]
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description: string
          id?: string
          reference?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["reward_status"]
          transaction_id?: string | null
          type: Database["public"]["Enums"]["reward_type"]
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string
          id?: string
          reference?: string | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["reward_status"]
          transaction_id?: string | null
          type?: Database["public"]["Enums"]["reward_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string
          detail: string | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      statements: {
        Row: {
          account_id: string
          closing_balance_cents: number
          created_at: string
          deposits_cents: number
          fees_cents: number
          id: string
          opening_balance_cents: number
          period_end: string
          period_start: string
          source: Database["public"]["Enums"]["data_source"]
          user_id: string
          withdrawals_cents: number
        }
        Insert: {
          account_id: string
          closing_balance_cents?: number
          created_at?: string
          deposits_cents?: number
          fees_cents?: number
          id?: string
          opening_balance_cents?: number
          period_end: string
          period_start: string
          source?: Database["public"]["Enums"]["data_source"]
          user_id: string
          withdrawals_cents?: number
        }
        Update: {
          account_id?: string
          closing_balance_cents?: number
          created_at?: string
          deposits_cents?: number
          fees_cents?: number
          id?: string
          opening_balance_cents?: number
          period_end?: string
          period_start?: string
          source?: Database["public"]["Enums"]["data_source"]
          user_id?: string
          withdrawals_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          body: string
          created_at: string
          from_staff: boolean
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          from_staff?: boolean
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          from_staff?: boolean
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount_cents: number
          category: Database["public"]["Enums"]["txn_category"]
          created_at: string
          description: string
          direction: Database["public"]["Enums"]["txn_direction"]
          id: string
          merchant: string | null
          posted_at: string
          provider_reference: string | null
          running_balance_cents: number | null
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Insert: {
          account_id: string
          amount_cents: number
          category?: Database["public"]["Enums"]["txn_category"]
          created_at?: string
          description: string
          direction: Database["public"]["Enums"]["txn_direction"]
          id?: string
          merchant?: string | null
          posted_at?: string
          provider_reference?: string | null
          running_balance_cents?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          type: Database["public"]["Enums"]["txn_type"]
          user_id: string
        }
        Update: {
          account_id?: string
          amount_cents?: number
          category?: Database["public"]["Enums"]["txn_category"]
          created_at?: string
          description?: string
          direction?: Database["public"]["Enums"]["txn_direction"]
          id?: string
          merchant?: string | null
          posted_at?: string
          provider_reference?: string | null
          running_balance_cents?: number | null
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          type?: Database["public"]["Enums"]["txn_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount_cents: number
          created_at: string
          external_account_id: string | null
          failure_reason: string | null
          from_account_id: string | null
          id: string
          memo: string | null
          provider_reference: string | null
          scheduled_for: string
          source: Database["public"]["Enums"]["data_source"]
          status: Database["public"]["Enums"]["txn_status"]
          to_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          external_account_id?: string | null
          failure_reason?: string | null
          from_account_id?: string | null
          id?: string
          memo?: string | null
          provider_reference?: string | null
          scheduled_for?: string
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          to_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          external_account_id?: string | null
          failure_reason?: string | null
          from_account_id?: string | null
          id?: string
          memo?: string | null
          provider_reference?: string | null
          scheduled_for?: string
          source?: Database["public"]["Enums"]["data_source"]
          status?: Database["public"]["Enums"]["txn_status"]
          to_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      admin_review_kyc: {
        Args: {
          _decision: Database["public"]["Enums"]["kyc_status"]
          _reason?: string
          _user_id: string
        }
        Returns: undefined
      }
      admin_review_loan: {
        Args: {
          _loan_id: string
          _reason?: string
          _status: Database["public"]["Enums"]["loan_status"]
        }
        Returns: undefined
      }
      admin_review_transaction: {
        Args: { _approve: boolean; _reason?: string; _txn_id: string }
        Returns: undefined
      }
      admin_review_transfer: {
        Args: { _approve: boolean; _reason?: string; _transfer_id: string }
        Returns: undefined
      }
      admin_set_account_status: {
        Args: {
          _account_id: string
          _reason?: string
          _status: Database["public"]["Enums"]["account_status"]
        }
        Returns: undefined
      }
      admin_set_profile_status: {
        Args: {
          _reason?: string
          _status: Database["public"]["Enums"]["account_status"]
          _user_id: string
        }
        Returns: undefined
      }
      can_admin_act: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      write_audit: {
        Args: {
          _action: string
          _entity: string
          _entity_id: string
          _new: Json
          _prev: Json
          _reason: string
          _target_user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_status:
        | "pending"
        | "active"
        | "restricted"
        | "suspended"
        | "closed"
      account_type: "checking" | "savings" | "investment" | "rewards"
      app_role:
        | "super_admin"
        | "admin"
        | "support"
        | "finance"
        | "compliance"
        | "read_only"
      card_status:
        | "not_issued"
        | "pending"
        | "active"
        | "frozen"
        | "reported"
        | "replaced"
        | "cancelled"
      connection_status:
        | "connected"
        | "reconnect_required"
        | "syncing"
        | "error"
        | "disconnected"
      data_source: "provider" | "test"
      kyc_status:
        | "unverified"
        | "pending"
        | "in_review"
        | "verified"
        | "rejected"
      loan_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "disbursed"
        | "repaying"
        | "closed"
      notification_category:
        | "login"
        | "security"
        | "transfer"
        | "deposit"
        | "withdrawal"
        | "payment"
        | "reward"
        | "card"
        | "investment"
        | "account"
      provider_kind:
        | "banking"
        | "payment"
        | "kyc"
        | "card"
        | "brokerage"
        | "email"
        | "sms"
        | "aggregation"
      provider_state:
        | "connected"
        | "disconnected"
        | "error"
        | "configuration_required"
      reward_status: "pending" | "available" | "redeemed" | "reversed"
      reward_type:
        | "cashback"
        | "partner_offer"
        | "promotional"
        | "redemption"
        | "adjustment"
      risk_profile:
        | "conservative"
        | "moderate"
        | "balanced"
        | "growth"
        | "aggressive"
      ticket_status: "open" | "in_progress" | "waiting" | "resolved" | "closed"
      txn_category:
        | "groceries"
        | "restaurants"
        | "shopping"
        | "transportation"
        | "entertainment"
        | "housing"
        | "utilities"
        | "bills"
        | "travel"
        | "healthcare"
        | "education"
        | "subscriptions"
        | "income"
        | "transfer"
        | "other"
      txn_direction: "credit" | "debit"
      txn_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "reversed"
        | "cancelled"
      txn_type:
        | "deposit"
        | "withdrawal"
        | "transfer"
        | "payment"
        | "reward"
        | "fee"
        | "adjustment"
        | "trade"
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
    Enums: {
      account_status: [
        "pending",
        "active",
        "restricted",
        "suspended",
        "closed",
      ],
      account_type: ["checking", "savings", "investment", "rewards"],
      app_role: [
        "super_admin",
        "admin",
        "support",
        "finance",
        "compliance",
        "read_only",
      ],
      card_status: [
        "not_issued",
        "pending",
        "active",
        "frozen",
        "reported",
        "replaced",
        "cancelled",
      ],
      connection_status: [
        "connected",
        "reconnect_required",
        "syncing",
        "error",
        "disconnected",
      ],
      data_source: ["provider", "test"],
      kyc_status: [
        "unverified",
        "pending",
        "in_review",
        "verified",
        "rejected",
      ],
      loan_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "disbursed",
        "repaying",
        "closed",
      ],
      notification_category: [
        "login",
        "security",
        "transfer",
        "deposit",
        "withdrawal",
        "payment",
        "reward",
        "card",
        "investment",
        "account",
      ],
      provider_kind: [
        "banking",
        "payment",
        "kyc",
        "card",
        "brokerage",
        "email",
        "sms",
        "aggregation",
      ],
      provider_state: [
        "connected",
        "disconnected",
        "error",
        "configuration_required",
      ],
      reward_status: ["pending", "available", "redeemed", "reversed"],
      reward_type: [
        "cashback",
        "partner_offer",
        "promotional",
        "redemption",
        "adjustment",
      ],
      risk_profile: [
        "conservative",
        "moderate",
        "balanced",
        "growth",
        "aggressive",
      ],
      ticket_status: ["open", "in_progress", "waiting", "resolved", "closed"],
      txn_category: [
        "groceries",
        "restaurants",
        "shopping",
        "transportation",
        "entertainment",
        "housing",
        "utilities",
        "bills",
        "travel",
        "healthcare",
        "education",
        "subscriptions",
        "income",
        "transfer",
        "other",
      ],
      txn_direction: ["credit", "debit"],
      txn_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "reversed",
        "cancelled",
      ],
      txn_type: [
        "deposit",
        "withdrawal",
        "transfer",
        "payment",
        "reward",
        "fee",
        "adjustment",
        "trade",
      ],
    },
  },
} as const
