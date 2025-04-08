import { SortOrder } from 'mongoose';
import { ICustomer, ICustomerFilters } from './crm-interface';
import { Customer } from './crm.models';
import ApiError from '../../../shared/errors/api-error';
import { paginationHelpers } from '../../../shared/helpers/pagination-helper';
import httpStatus from 'http-status';
import { emailService } from '../../../shared/services/email/email.service';

// Fetch all customers with filters and pagination
const getAllCustomers = async (
  filters: ICustomerFilters,
  paginationOptions: any
): Promise<{ meta: any; data: ICustomer[] }> => {
  const { searchTerm, minSpend, maxSpend } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: ['name', 'preferredService'].map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (minSpend || maxSpend) {
    const spendFilter: any = {};
    if (minSpend) spendFilter.$gte = minSpend;
    if (maxSpend) spendFilter.$lte = maxSpend;
    andConditions.push({ lifetimeSpend: spendFilter });
  }

  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Customer.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Customer.countDocuments(whereConditions);

  return {
    meta: { page, limit, total },
    data: result,
  };
};

// Fetch customer by ID
const getCustomerById = async (id: string): Promise<ICustomer | null> => {
  const customer = await Customer.findById(id);
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  return customer;
};

// Create new customer
const createCustomer = async (payload: ICustomer): Promise<ICustomer> => {
  return await Customer.create(payload);
};

// Update customer
const updateCustomer = async (
  id: string,
  payload: Partial<ICustomer>
): Promise<ICustomer | null> => {
  const customer = await Customer.findByIdAndUpdate(id, payload, { new: true });
  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }
  return customer;
};

// Recommend personalized offer
const getPersonalizedOffer = async (id: string): Promise<string> => {
  const customer = await getCustomerById(id);
  if (!customer) return 'No offer available';

  if (customer.lifetimeSpend > 700) {
    return `20% discount on ${customer.preferredService}`;
  } else if (customer.totalVisits > 5) {
    return `10% off your next ${customer.preferredService}`;
  }
  return '5% off your next visit';
};

// Send visit reminder
const sendVisitReminder = async (id: string): Promise<void> => {
  const customer = await getCustomerById(id);
  if (!customer || !customer.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Customer email not available');
  }

  const daysSinceLastVisit = Math.floor(
    (new Date().getTime() - customer.lastVisit.getTime()) / (1000 * 3600 * 24)
  );

  if (daysSinceLastVisit > 30) {
    await emailService.sendEmail({
      to: customer.email,
      subject: 'We Miss You!',
      text: `Hi ${customer.name}, it's been a while since your last visit on ${customer.lastVisit.toDateString()}. Book your next ${customer.preferredService} today!`,
    });
  }
};

export const CRMService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getPersonalizedOffer,
  sendVisitReminder,
};