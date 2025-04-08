import { Schema, model } from 'mongoose';
import { ICustomer, CustomerModel } from './crm-interface';

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    lastVisit: {
      type: Date,
      required: [true, 'Last visit date is required'],
    },
    preferredService: {
      type: String,
      required: [true, 'Preferred service is required'],
    },
    totalVisits: {
      type: Number,
      required: [true, 'Total visits is required'],
      min: [0, 'Total visits cannot be negative'],
    },
    lifetimeSpend: {
      type: Number,
      required: [true, 'Lifetime spend is required'],
      min: [0, 'Lifetime spend cannot be negative'],
    },
    email: {
      type: String,
      optional: true,
    },
    phone: {
      type: String,
      optional: true,
    },
    nextAppointment: {
      type: Date,
      optional: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const Customer = model<ICustomer, CustomerModel>('Customer', CustomerSchema);