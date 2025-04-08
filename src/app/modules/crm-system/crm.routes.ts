import express from 'express';
import { CRMController } from './crm.controller';
import validateRequest from '../../../shared/middleware/validation-middleware';
import { crmValidation } from './crm.validation';
import authGuard from '../../../shared/middleware/auth-middleware';
import { ENUM_USER_ROLE } from '../../../shared/enums/users-enum';

const router = express.Router();

router.get('/', authGuard(ENUM_USER_ROLE.ADMIN), CRMController.getAllCustomers);
router.get('/:id', authGuard(ENUM_USER_ROLE.ADMIN), CRMController.getCustomerById);
router.post(
    '/',
    authGuard(ENUM_USER_ROLE.ADMIN),
    validateRequest(crmValidation.createCustomerZodSchema),
    CRMController.createCustomer
);
router.patch(
    '/:id',
    authGuard(ENUM_USER_ROLE.ADMIN),
    validateRequest(crmValidation.updateCustomerZodSchema),
    CRMController.updateCustomer
);
router.get('/:id/offer', authGuard(ENUM_USER_ROLE.ADMIN), CRMController.getPersonalizedOffer);
router.post('/:id/reminder', authGuard(ENUM_USER_ROLE.ADMIN), CRMController.sendVisitReminder);

export const CRMRoutes = router;