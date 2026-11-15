export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MembershipStatus = "invited" | "active" | "suspended";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; created_at?: string; updated_at?: string };
        Update: { name?: string; updated_at?: string };
        Relationships: [];
      };
      branches: {
        Row: { id: string; organization_id: string; name: string; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; name: string; created_at?: string; updated_at?: string };
        Update: { name?: string; updated_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: { user_id: string; display_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { user_id: string; display_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { display_name?: string | null; avatar_url?: string | null; updated_at?: string };
        Relationships: [];
      };
      memberships: {
        Row: { id: string; organization_id: string; user_id: string; role_id: string; status: MembershipStatus; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; user_id: string; role_id: string; status?: MembershipStatus; created_at?: string; updated_at?: string };
        Update: { status?: MembershipStatus; role_id?: string; updated_at?: string };
        Relationships: [];
      };
      roles: {
        Row: { id: string; organization_id: string; name: string; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; name: string; created_at?: string; updated_at?: string };
        Update: { name?: string; updated_at?: string };
        Relationships: [];
      };
      permissions: {
        Row: { id: string; code: string; description: string; created_at: string; updated_at: string };
        Insert: { id?: string; code: string; description: string; created_at?: string; updated_at?: string };
        Update: { description?: string; updated_at?: string };
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string; created_at: string; updated_at: string };
        Insert: { role_id: string; permission_id: string; created_at?: string; updated_at?: string };
        Update: { updated_at?: string };
        Relationships: [];
      };
      branch_memberships: {
        Row: { id: string; organization_id: string; membership_id: string; branch_id: string; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; membership_id: string; branch_id: string; created_at?: string; updated_at?: string };
        Update: { updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_organization_member: { Args: { p_organization_id: string }; Returns: boolean };
      has_organization_permission: { Args: { p_organization_id: string; p_permission: string }; Returns: boolean };
      can_access_branch: { Args: { p_branch_id: string; p_permission: string }; Returns: boolean };
    };
    Enums: { membership_status: MembershipStatus };
    CompositeTypes: Record<string, never>;
  };
}
