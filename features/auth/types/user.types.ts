export interface User {
  id: string;
  email: string;
  full_name?:string
  role?:string
  phone_number?: string;
  address?: string;
  user_metadata?: {
    phone_number?: string;
    address?: string;
  };
}