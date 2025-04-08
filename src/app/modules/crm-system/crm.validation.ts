import { z } from 'zod';

const createCustomerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    lastVisit: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    preferredService: z.string({ required_error: 'Preferred service is required' }),
    totalVisits: z.number({ required_error: 'Total visits is required' }).min(0),
    lifetimeSpend: z.number({ required_error: 'Lifetime spend is required' }).min(0),
    email: z.string().email().optional(),
  }),
});

const updateCustomerZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    lastVisit: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }).optional(),
    preferredService: z.string().optional(),
    totalVisits: z.number().min(0).optional(),
    lifetimeSpend: z.number().min(0).optional(),
    email: z.string().email().optional(),
  }).optional(),
});

export const crmValidation = {
  createCustomerZodSchema,
  updateCustomerZodSchema,
};