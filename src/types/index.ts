export type ShipmentStatus = 
  | 'BOOKED' 
  | 'PICKED_UP' 
  | 'SORTING_HUB' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'DELAYED' 
  | 'RETURNED';

export type ServiceType = 
  | 'EXPRESS_AIR' 
  | 'PRIORITY_GROUND' 
  | 'STANDARD_FREIGHT' 
  | 'SAME_DAY';

export type PackageType = 
  | 'DOCUMENT' 
  | 'PARCEL' 
  | 'ELECTRONICS' 
  | 'FRAGILE' 
  | 'PERISHABLE';

export type PriorityLevel = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface Checkpoint {
  id: string;
  trackingNumber: string;
  timestamp: string;
  status: ShipmentStatus;
  facility: string;
  city: string;
  locationCode: string;
  operatorId: string;
  description: string;
}

export interface CourierAgent {
  name: string;
  phone: string;
  badgeNumber: string;
  vehiclePlate: string;
  hubLocation: string;
}

export interface Shipment {
  trackingNumber: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderAddress: string;
  senderCity: string;
  
  receiverId: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  receiverCity: string;
  
  serviceType: ServiceType;
  packageType: PackageType;
  priority: PriorityLevel;
  weightKg: number;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  declaredValue: number;
  shippingFee: number;
  
  status: ShipmentStatus;
  bookingDate: string;
  estimatedDeliveryDate: string;
  deliveredDate?: string;
  
  fragile: boolean;
  insurance: boolean;
  signatureRequired: boolean;
  notes?: string;
  
  assignedCourier?: CourierAgent;
  checkpoints: Checkpoint[];
}

export interface Customer {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
  totalBookings: number;
  totalSpent: number;
  tier: 'REGULAR' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export interface BookingFormData {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderAddress: string;
  senderCity: string;
  
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  receiverAddress: string;
  receiverCity: string;
  
  serviceType: ServiceType;
  packageType: PackageType;
  priority: PriorityLevel;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValue: number;
  fragile: boolean;
  insurance: boolean;
  signatureRequired: boolean;
  notes?: string;
}
