import express from 'express';
import { UserRoutes } from '../modules/users/users.routes';
import { healthCheck } from '../modules/health/health.controller';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CRMRoutes } from '../modules/crm-system/crm.routes';
const router = express.Router();

const moduleRoutes = [
    {
        path: '/health',
        route: healthCheck,
    },
    {
        path: '/users',
        route: UserRoutes,
    },
    {
        path: '/auth',
        route: AuthRoutes,
    },
    {
        path: '/crm',
        route: CRMRoutes,
    }
     
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
