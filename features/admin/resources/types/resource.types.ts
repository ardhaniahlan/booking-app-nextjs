export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  capacity: number;
  quantity: number;
  price: number;
  price_unit: "hour" | "day" | "session";
  image_urls: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  profiles: { full_name: string } | null;
  city: string;
  address: string;
}

export interface AvailabilityRule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}