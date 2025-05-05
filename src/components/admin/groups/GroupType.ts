
export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  total_users?: number;
  total_admins?: number;
  admin_id?: string; // Adding this property that's required by the Group type
}

export interface GroupUser {
  user_id: string;
  email: string;
  created_at: string;
}

export interface GroupAdmin {
  admin_id: string;
  email: string;
  created_at: string;
}
