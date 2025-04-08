import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/utils/catch-async';
import sendResponse from '../../../shared/utils/send-response';
import { CRMService } from './crm.service';
import paginationPick from '../../../shared/utils/pagination-pick';
import { paginationFields } from '../../../shared/constants/common-constants';

// Get all customers
const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const filters = paginationPick(req.query, ['searchTerm', 'minSpend', 'maxSpend']);
  const paginationOptions = paginationPick(req.query, paginationFields);

  const result = await CRMService.getAllCustomers(filters, paginationOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customers retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

// Get customer by ID
const getCustomerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CRMService.getCustomerById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer retrieved successfully',
    data: result,
  });
});

// Create customer
const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await CRMService.createCustomer(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Customer created successfully',
    data: result,
  });
});

// Update customer
const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CRMService.updateCustomer(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer updated successfully',
    data: result,
  });
});

// Get personalized offer
const getPersonalizedOffer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const offer = await CRMService.getPersonalizedOffer(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personalized offer retrieved successfully',
    data: { offer },
  });
});

// Send visit reminder
const sendVisitReminder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CRMService.sendVisitReminder(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reminder sent successfully',
    data: null,
  });
});

export const CRMController = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getPersonalizedOffer,
  sendVisitReminder,
};