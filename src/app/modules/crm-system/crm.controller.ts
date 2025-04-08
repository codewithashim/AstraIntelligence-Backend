import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/utils/catch-async';
import sendResponse from '../../../shared/utils/send-response';
import { CRMService } from './crm.service';
import paginationPick from '../../../shared/utils/pagination-pick';
import { paginationFields } from '../../../shared/constants/common-constants';
import { ICustomer, ICustomerInsights } from './crm-interface';

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const filters = paginationPick(req.query, ['searchTerm', 'minSpend', 'maxSpend']);
  const paginationOptions = paginationPick(req.query, paginationFields);

  const result = await CRMService.getAllCustomers(filters, paginationOptions);

  sendResponse<ICustomer[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customers retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getCustomerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CRMService.getCustomerById(id);

  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer retrieved successfully',
    data: result,
  });
});

const createCustomer = catchAsync(async (req: Request, res: Response) => {
  const customerData = req.body;
  const result = await CRMService.createCustomer(customerData);

  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Customer created successfully',
    data: result,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const result = await CRMService.updateCustomer(id, updatedData);

  sendResponse<ICustomer>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer updated successfully',
    data: result,
  });
});

const getPersonalizedOffer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const useAI = req.query.useAI === 'true';
  const offer = await CRMService.getPersonalizedOffer(id, useAI);

  sendResponse<{ offer: string }>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personalized offer retrieved successfully',
    data: { offer },
  });
});

const sendVisitReminder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await CRMService.sendVisitReminder(id);

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Visit reminder sent successfully',
    data: null,
  });
});

const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await CRMService.getDashboardOverview();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard overview retrieved successfully',
    data: result,
  });
});

const getCustomerInsights = catchAsync(async (req: Request, res: Response) => {
  const result = await CRMService.getCustomerInsights();

  sendResponse<ICustomerInsights>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer insights retrieved successfully',
    data: result,
  });
});

export const CRMController = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getPersonalizedOffer,
  sendVisitReminder,
  getDashboardOverview,
  getCustomerInsights,
};