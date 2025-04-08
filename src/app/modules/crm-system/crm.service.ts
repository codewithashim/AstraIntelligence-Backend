import { SortOrder } from 'mongoose';
import {
    ICustomer,
    ICustomerFilters,
    IServicePreference,
    ICustomerRecommendation,
    ILoyaltyTier,
    ICustomerInsights,
} from './crm-interface';
import { Customer } from './crm.models';
import ApiError from '../../../shared/errors/api-error';
import { paginationHelpers } from '../../../shared/helpers/pagination-helper';
import { emailService } from '../../../shared/services/email/email.service';
import httpStatus from 'http-status';
import { paginationFields } from '../../../shared/constants/common-constants';

/**
 * Fetches all customers with filters and pagination.
 */
const getAllCustomers = async (
    filters: ICustomerFilters,
    paginationOptions: any
): Promise<{ meta: { page: number; limit: number; total: number }; data: ICustomer[] }> => {
    const { searchTerm, minSpend, maxSpend } = filters;
    const { page, limit, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(paginationOptions);

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: ['name', 'preferredService'].map((field) => ({
                [field]: { $regex: searchTerm, $options: 'i' },
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
 * Generates a rule-based personalized offer.
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
 * Generates an AI-inspired personalized offer using clustering.
 */
const getPersonalizedOfferAIInspired = async (id: string): Promise<string> => {
    try {
        const customer = await getCustomerById(id);
        if (!customer) return 'No offer available';

        const allCustomers = await Customer.find();
        const { lifetimeSpend, totalVisits, preferredService } = customer;

        const avgSpend = allCustomers.reduce((sum, c) => sum + c.lifetimeSpend, 0) / allCustomers.length;
        const avgVisits = allCustomers.reduce((sum, c) => sum + c.totalVisits, 0) / allCustomers.length;

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
 * Wrapper for personalized offers.
 */
const getPersonalizedOffer = async (id: string, useAI: boolean = false): Promise<string> => {
    return useAI ? await getPersonalizedOfferAIInspired(id) : await getPersonalizedOfferRuleBased(id);
};

/**
 * Sends a visit reminder email if the customer hasn’t visited in over 45 days.
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

        if (daysSinceLastVisit > 45) {
            const offer = await getPersonalizedOffer(id);
            await emailService.sendVisitReminderEmail(
                customer.email,
                customer.name,
                daysSinceLastVisit,
                customer.lastVisit,
                customer.preferredService,
                offer
            );
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send visit reminder');
    }
};


/**
 * Fetches dashboard overview metrics.
 */
const getDashboardOverview = async (): Promise<{
    totalCustomers: number;
    customersWithAppointments: number;
    averageCustomerValue: number;
    totalVisits: number;
    averageVisitsPerCustomer: number;
    topService: { service: string; percentage: number };
}> => {
    try {
        const allCustomers = await Customer.find();

        const totalCustomers = allCustomers.length;
        const customersWithAppointments = allCustomers.filter(c => c.nextAppointment && c.nextAppointment > new Date()).length;
        const totalLifetimeSpend = allCustomers.reduce((sum, c) => sum + c.lifetimeSpend, 0);
        const averageCustomerValue = totalCustomers > 0 ? totalLifetimeSpend / totalCustomers : 0;
        const totalVisits = allCustomers.reduce((sum, c) => sum + c.totalVisits, 0);
        const averageVisitsPerCustomer = totalCustomers > 0 ? totalVisits / totalCustomers : 0;

        // Calculate top service
        const serviceCounts: { [key: string]: number } = {};
        allCustomers.forEach(c => {
            serviceCounts[c.preferredService] = (serviceCounts[c.preferredService] || 0) + 1;
        });
        const topServiceEntry = Object.entries(serviceCounts).reduce(
            (max, entry) => (entry[1] > max[1] ? entry : max),
            ['Unknown', 0]
        );
        const topService = {
            service: topServiceEntry[0],
            percentage: totalCustomers > 0 ? (topServiceEntry[1] / totalCustomers) * 100 : 0,
        };

        return {
            totalCustomers,
            customersWithAppointments,
            averageCustomerValue,
            totalVisits,
            averageVisitsPerCustomer,
            topService,
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch dashboard overview');
    }
};

/**
 * Fetches customer insights including service preferences, recommendations, and loyalty program.
 */
const getCustomerInsights = async (): Promise<ICustomerInsights> => {
    try {
        const allCustomers = await Customer.find();

        // Service Preferences
        const serviceCounts: { [key: string]: number } = {};
        allCustomers.forEach(c => {
            serviceCounts[c.preferredService] = (serviceCounts[c.preferredService] || 0) + 1;
        });
        const servicePreferences: IServicePreference[] = Object.entries(serviceCounts).map(([service, count]) => ({
            service,
            count,
        }));

        // Recommendations
        const sortedBySpend = [...allCustomers].sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);
        const highValueCount = Math.ceil(allCustomers.length * 0.2); // Top 20%
        const highValueCustomers = sortedBySpend.slice(0, highValueCount);

        const reengagementNeeded = allCustomers.filter(c => {
            const daysSinceLastVisit = Math.floor(
                (new Date().getTime() - c.lastVisit.getTime()) / (1000 * 3600 * 24)
            );
            return daysSinceLastVisit > 45;
        });

        const crossSellingOpportunities = allCustomers.map(c => {
            const otherServices = servicePreferences
                .filter(s => s.service !== c.preferredService)
                .sort((a, b) => b.count - a.count);
            return {
                customer: c,
                suggestedService: otherServices[0]?.service || 'Nail Art', // Default to Nail Art if none
            };
        }).filter((_, index) => index < 2); // Limit to 2 suggestions for simplicity

        // Loyalty Program
        const loyaltyTiers: ILoyaltyTier[] = [
            { name: 'Basic', visitRange: { min: 1, max: 3 }, benefits: '5% off retail products', customerCount: 0 },
            { name: 'Silver', visitRange: { min: 4, max: 7 }, benefits: '10% off all services', customerCount: 0 },
            { name: 'Gold', visitRange: { min: 8 }, benefits: 'Free add-on with service', customerCount: 0 },
        ];

        allCustomers.forEach(c => {
            const tier = loyaltyTiers.find(t =>
                c.totalVisits >= t.visitRange.min && (!t.visitRange.max || c.totalVisits <= t.visitRange.max)
            );
            if (tier) tier.customerCount++;
        });

        return {
            servicePreferences,
            recommendations: {
                highValueCustomers,
                reengagementNeeded,
                crossSellingOpportunities,
            },
            loyaltyProgram: loyaltyTiers,
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch customer insights');
    }
};

export const CRMService = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    getPersonalizedOffer,
    sendVisitReminder,
    getDashboardOverview,
    getCustomerInsights,
};