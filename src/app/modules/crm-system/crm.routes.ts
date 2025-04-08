import express from 'express';
import { CRMController } from './crm.controller';
import validateRequest from '../../../shared/middleware/validation-middleware';
import { crmValidation } from './crm.validation';
import authGuard from '../../../shared/middleware/auth-middleware';
import { ENUM_USER_ROLE } from '../../../shared/enums/users-enum';

const router = express.Router();

/**
 * @route GET /api/crm
 * @description Retrieves all customers with optional filtering and pagination
 * @access Private (Admin or User)
 */
router.get(
  '/',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getAllCustomers
);

/**
 * @route GET /api/crm/:id
 * @description Retrieves a single customer by ID
 * @access Private (Admin or User)
 */
router.get(
  '/:id',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getCustomerById
);

/**
 * @route POST /api/crm
 * @description Creates a new customer
 * @access Private (Admin or User)
 */
router.post(
  '/',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  validateRequest(crmValidation.createCustomerZodSchema),
  CRMController.createCustomer
);

/**
 * @route PATCH /api/crm/:id
 * @description Updates an existing customer by ID
 * @access Private (Admin or User)
 */
router.patch(
  '/:id',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  validateRequest(crmValidation.updateCustomerZodSchema),
  CRMController.updateCustomer
);

/**
 * @route GET /api/crm/:id/offer
 * @description Retrieves a personalized offer for a customer
 * @access Private (Admin or User)
 */
router.get(
  '/:id/offer',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getPersonalizedOffer
);

/**
 * @route POST /api/crm/:id/reminder
 * @description Sends a visit reminder to a customer
 * @access Private (Admin or User)
 */
router.post(
  '/:id/reminder',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.sendVisitReminder
);

export const CRMRoutes = router;