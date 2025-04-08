import { Model } from 'mongoose';

export type ICustomer = {
  _id?: string;
  name: string;
  lastVisit: Date;
  preferredService: string;
  totalVisits: number;
  lifetimeSpend: number;
  email?: string;
  phone?: string; // Added for contact info
  nextAppointment?: Date; // Added for upcoming appointments
};

export type ICustomerFilters = {
  searchTerm?: string;
  minSpend?: number;
  maxSpend?: number;
};

export type IServicePreference = {
  service: string;
  count: number;
};

export type ICustomerRecommendation = {
  highValueCustomers: ICustomer[];
  reengagementNeeded: ICustomer[];
  crossSellingOpportunities: { customer: ICustomer; suggestedService: string }[];
};

export type ILoyaltyTier = {
  name: string;
  visitRange: { min: number; max?: number };
  benefits: string;
  customerCount: number;
};

export type ICustomerInsights = {
  servicePreferences: IServicePreference[];
  recommendations: ICustomerRecommendation;
  loyaltyProgram: ILoyaltyTier[];
};

export type CustomerModel = Model<ICustomer, Record<string, unknown>>;