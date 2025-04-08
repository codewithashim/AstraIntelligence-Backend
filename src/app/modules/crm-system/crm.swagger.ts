/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       required:
 *         - name
 *         - lastVisit
 *         - preferredService
 *         - totalVisits
 *         - lifetimeSpend
 *       properties:
 *         name:
 *           type: string
 *           description: Customer's full name
 *         lastVisit:
 *           type: string
 *           format: date
 *           description: Date of last visit
 *         preferredService:
 *           type: string
 *           description: Customer's preferred service
 *         totalVisits:
 *           type: number
 *           description: Total number of visits
 *         lifetimeSpend:
 *           type: number
 *           description: Total spend in dollars
 *         email:
 *           type: string
 *           format: email
 *           description: Customer's email (optional)
 *
 * tags:
 *   name: CRM
 *   description: Customer Relationship Management operations
 *
 * /crm:
 *   get:
 *     summary: Get all customers
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search by name or service
 *       - in: query
 *         name: minSpend
 *         schema:
 *           type: number
 *         description: Minimum lifetime spend filter
 *       - in: query
 *         name: maxSpend
 *         schema:
 *           type: number
 *         description: Maximum lifetime spend filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   post:
 *     summary: Create a new customer
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       201:
 *         description: Customer created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *
 * /crm/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *
 *   patch:
 *     summary: Update customer
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *
 * /crm/{id}/offer:
 *   get:
 *     summary: Get personalized offer
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Personalized offer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 offer:
 *                   type: string
 *       404:
 *         description: Customer not found
 *
 * /crm/{id}/reminder:
 *   post:
 *     summary: Send visit reminder
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Reminder sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email not available or reminder not needed
 */