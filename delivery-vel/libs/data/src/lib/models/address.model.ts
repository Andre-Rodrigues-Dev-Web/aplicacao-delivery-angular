export interface Address {
  id: string;
  userId: string;
  label: string; // Casa, Trabalho, etc.
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  instructions?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressRequest {
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  label?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface AddressValidation {
  isValid: boolean;
  errors: string[];
  suggestions?: Address[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  deliveryFee: number;
  estimatedTime: number; // em minutos
  isActive: boolean;
}