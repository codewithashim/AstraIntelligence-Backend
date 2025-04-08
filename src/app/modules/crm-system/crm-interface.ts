import { Model } from 'mongoose';

export type ICustomer = {
    _id?: string;
    name: string;
    lastVisit: Date;
    preferredService: string;
    totalVisits: number;
    lifetimeSpend: number;
    email?: string;
};

export type ICustomerFilters = {
    searchTerm?: string;
    minSpend?: number;
    maxSpend?: number;
};

export type CustomerModel = Model<ICustomer, Record<string, unknown>>;