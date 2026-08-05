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

export interface AvailabilityRule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}