export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'expired';
    expires_at?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface ChatSession {
  id: number;
  session_id: string;
  title?: string;
  created_at: string;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    visibility: number;
    wind_speed: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
    humidity: number;
    wind_speed: number;
  }>;
}

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  class_type?: string;
}

export interface HotelSearchRequest {
  location: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
}

export interface TrainSearchRequest {
  origin: string;
  destination: string;
  departure_date: string;
  passengers: number;
}

export interface Booking {
  id: number;
  booking_reference: string;
  status: string;
  total_amount: number;
  booking_type: string;
  booking_data: any;
  created_at: string;
}
