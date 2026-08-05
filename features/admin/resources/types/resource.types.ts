export interface Resource {
  id: string;
  name: string;
  category: string;
  capacity: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  profiles: { full_name: string } | null;
}