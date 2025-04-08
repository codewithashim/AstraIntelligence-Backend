import express from 'express';
import { CRMController } from './crm.controller';
import validateRequest from '../../../shared/middleware/validation-middleware';
import { crmValidation } from './crm.validation';
import authGuard from '../../../shared/middleware/auth-middleware';
import { ENUM_USER_ROLE } from '../../../shared/enums/users-enum';

const router = express.Router();

router.get(
  '/',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getAllCustomers
);

router.get(
  '/:id',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getCustomerById
);

router.post(
  '/',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  validateRequest(crmValidation.createCustomerZodSchema),
  CRMController.createCustomer
);

router.patch(
  '/:id',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  validateRequest(crmValidation.updateCustomerZodSchema),
  CRMController.updateCustomer
);

router.get(
  '/:id/offer',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getPersonalizedOffer
);

router.post(
  '/:id/reminder',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.sendVisitReminder
);

router.get(
  '/dashboard/overview',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getDashboardOverview
);

router.get(
  '/insights',
  authGuard(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  CRMController.getCustomerInsights
);

export const CRMRoutes = router;