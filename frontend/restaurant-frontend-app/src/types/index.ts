export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  image?: string;
  allergens?: string[];
}

export interface ReservationForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  message: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image?: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: {
    [key: string]: string;
  };
}
