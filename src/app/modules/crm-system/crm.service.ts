import { SortOrder } from 'mongoose';
import { ICustomer, ICustomerFilters } from './crm-interface';
import { Customer } from './crm.models';
import ApiError from '../../../shared/errors/api-error';
import { paginationHelpers } from '../../../shared/helpers/pagination-helper';
import { emailService } from '../../../shared/services/email/email.service';
import httpStatus from 'http-status';
 
/**
 * Fetches all customers with optional filters and pagination.
 * @param filters - Search and spend range filters
 * @param paginationOptions - Pagination and sorting options
 * @returns Promise containing metadata and customer data
 * @throws ApiError if database query fails
 */
const getAllCustomers = async (
    filters: ICustomerFilters,
    paginationOptions: any
): Promise<{ meta: { page: number; limit: number; total: number }; data: ICustomer[] }> => {
    const { searchTerm, minSpend, maxSpend } = filters;
    const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(paginationOptions);

    const andConditions = [];

    // Add search term condition for name or preferredService
    if (searchTerm) {
        andConditions.push({
            $or: ['name', 'preferredService'].map((field) => ({
                [field]: { $regex: searchTerm, $options: 'i' },
            })),
        });
    }

    // Add spend range filter
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

    try {
        const result = await Customer.find(whereConditions)
            .sort(sortConditions)
            .skip(skip)
            .limit(limit);

        const total = await Customer.countDocuments(whereConditions);

        return {
            meta: { page, limit, total },
            data: result,
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch customers');
    }
};

/**
 * Fetches a customer by their ID.
 * @param id - Customer ID
 * @returns Promise resolving to the customer or null
 * @throws ApiError if customer not found or query fails
 */
const getCustomerById = async (id: string): Promise<ICustomer | null> => {
    try {
        const customer = await Customer.findById(id);
        if (!customer) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
        }
        return customer;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch customer');
    }
};

/**
 * Creates a new customer.
 * @param payload - Customer data to create
 * @returns Promise resolving to the created customer
 * @throws ApiError if creation fails
 */
const createCustomer = async (payload: ICustomer): Promise<ICustomer> => {
    try {
        const newCustomer = await Customer.create(payload);
        return newCustomer;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create customer');
    }
};

/**
 * Updates an existing customer.
 * @param id - Customer ID
 * @param payload - Partial customer data to update
 * @returns Promise resolving to the updated customer or null
 * @throws ApiError if customer not found or update fails
 */
const updateCustomer = async (
    id: string,
    payload: Partial<ICustomer>
): Promise<ICustomer | null> => {
    try {
        const customer = await Customer.findByIdAndUpdate(id, payload, { new: true });
        if (!customer) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
        }
        return customer;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update customer');
    }
};

/**
 * Generates a rule-based personalized offer based on customer spending and visit habits.
 * @param id - Customer ID
 * @returns Promise resolving to the offer string
 * @throws ApiError if customer retrieval fails
 */
const getPersonalizedOfferRuleBased = async (id: string): Promise<string> => {
    try {
        const customer = await getCustomerById(id);
        if (!customer) return 'No offer available';

        const { lifetimeSpend, totalVisits, preferredService } = customer;

        if (lifetimeSpend > 700) {
            return `20% discount on your next ${preferredService} - High Spender Special!`;
        } else if (lifetimeSpend > 400 && totalVisits > 3) {
            return `15% off ${preferredService} - Loyal Customer Deal!`;
        } else if (totalVisits > 5) {
            return `10% off your next ${preferredService} - Frequent Visitor Bonus!`;
        }
        return '5% off your next visit - Welcome Back Offer!';
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate rule-based offer');
    }
};

/**
 * Generates an AI-inspired personalized offer using simple clustering logic.
 * @param id - Customer ID
 * @returns Promise resolving to the offer string
 * @throws ApiError if customer retrieval or data processing fails
 */
const getPersonalizedOfferAIInspired = async (id: string): Promise<string> => {
    try {
        const customer = await getCustomerById(id);
        if (!customer) return 'No offer available';

        const allCustomers = await Customer.find(); // Fetch all customers for clustering simulation
        const { lifetimeSpend, totalVisits, preferredService } = customer;

        // Calculate average spend and visits (simulating K-means centroids)
        const avgSpend = allCustomers.reduce((sum, c) => sum + c.lifetimeSpend, 0) / allCustomers.length;
        const avgVisits = allCustomers.reduce((sum, c) => sum + c.totalVisits, 0) / allCustomers.length;

        // Define customer "cluster" based on spending habits
        if (lifetimeSpend > avgSpend * 1.5 && totalVisits > avgVisits) {
            return `25% off ${preferredService} - Elite Customer Exclusive!`;
        } else if (lifetimeSpend > avgSpend) {
            return `15% off ${preferredService} - Valued Spender Reward!`;
        } else if (totalVisits > avgVisits * 1.2) {
            return `10% off ${preferredService} - Frequent Flyer Discount!`;
        }
        return `5% off your next ${preferredService} - Keep Coming Back!`;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate AI-inspired offer');
    }
};

/**
 * Wrapper function to choose between rule-based and AI-inspired personalized offers.
 * @param id - Customer ID
 * @param useAI - Boolean flag to toggle AI-inspired logic (default: false)
 * @returns Promise resolving to the offer string
 */
const getPersonalizedOffer = async (id: string, useAI: boolean = false): Promise<string> => {
    return useAI ? await getPersonalizedOfferAIInspired(id) : await getPersonalizedOfferRuleBased(id);
};

/**
 * Sends a visit reminder email if the customer hasn’t visited in over 30 days.
 * @param id - Customer ID
 * @returns Promise resolving to void
 * @throws ApiError if customer not found, email missing, or sending fails
 */
const sendVisitReminder = async (id: string): Promise<void> => {
    try {
        const customer = await getCustomerById(id);
        if (!customer || !customer.email) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Customer email not available');
        }

        const daysSinceLastVisit = Math.floor(
            (new Date().getTime() - customer.lastVisit.getTime()) / (1000 * 3600 * 24)
        );

        if (daysSinceLastVisit > 30) {
            const offer = await getPersonalizedOffer(id);
            await emailService.sendEmail({
                to: customer.email,
                subject: 'We Miss You!',
                text: `Hi ${customer.name}, it's been ${daysSinceLastVisit} days since your last visit on ${customer.lastVisit.toDateString()}. Book your next ${customer.preferredService} today and enjoy your personalized offer: ${offer}`,
            });
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send visit reminder');
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