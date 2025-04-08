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
 *         _id:
 *           type: string
 *           description: Unique identifier for the customer
 *         name:
 *           type: string
 *           description: Customer's full name
 *         lastVisit:
 *           type: string
 *           format: date
 *           description: Date of the customer's last visit (ISO 8601 format)
 *         preferredService:
 *           type: string
 *           description: Customer's preferred service
 *         totalVisits:
 *           type: number
 *           description: Total number of visits by the customer
 *         lifetimeSpend:
 *           type: number
 *           description: Total amount spent by the customer in dollars
 *         email:
 *           type: string
 *           format: email
 *           description: Customer's email address (optional)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the customer was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the customer was last updated
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 'Unauthorized'
 *     BadRequestError:
 *       description: Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 'Validation failed'
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 'Customer not found'
 *
 * tags:
 *   - name: CRM
 *     description: Customer Relationship Management operations
 *
 * /crm:
 *   get:
 *     summary: Get all customers
 *     description: Retrieves a paginated list of customers with optional filters
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search customers by name or preferred service (case-insensitive)
 *       - in: query
 *         name: minSpend
 *         schema:
 *           type: number
 *         description: Filter customers with lifetime spend greater than or equal to this value
 *       - in: query
 *         name: maxSpend
 *         schema:
 *           type: number
 *         description: Filter customers with lifetime spend less than or equal to this value
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of customers per page
 *     responses:
 *       200:
 *         description: Successfully retrieved list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Customers retrieved successfully'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                       example: 1
 *                     limit:
 *                       type: number
 *                       example: 10
 *                     total:
 *                       type: number
 *                       example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Failed to fetch customers'
 *
 *   post:
 *     summary: Create a new customer
 *     description: Adds a new customer to the CRM system
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
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Customer created successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Failed to create customer'
 *
 * /crm/{id}:
 *   get:
 *     summary: Get customer by ID
 *     description: Retrieves details of a specific customer
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the customer
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Customer retrieved successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json 500:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: 'Failed to fetch customer'
 *
 *   patch:
 *     summary: Update customer
 *     description: Updates details of an existing customer
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the customer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Customer's full name (optional)
 *               lastVisit:
 *                 type: string
 *                 format: date
 *                 description: Date of last visit (optional)
 *               preferredService:
 *                 type: string
 *                 description: Customer's preferred service (optional)
 *               totalVisits:
 *                 type: number
 *                 description: Total number of visits (optional)
 *               lifetimeSpend:
 *                 type: number
 *                 description: Total spend in dollars (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer's email (optional)
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Customer updated successfully'
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Failed to update customer'
 *
 * /crm/{id}/offer:
 *   get:
 *     summary: Get personalized offer
 *     description: Retrieves a personalized offer for a customer based on spending habits
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the customer
 *       - in: query
 *         name: useAI
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Toggle between rule-based (false) and AI-inspired (true) offer logic
 *     responses:
 *       200:
 *         description: Personalized offer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Personalized offer retrieved successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     offer:
 *                       type: string
 *                       example: '20% discount on your next Acrylic Set - High Spender Special!'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Failed to generate offer'
 *
 * /crm/{id}/reminder:
 *   post:
 *     summary: Send visit reminder
 *     description: Sends an email reminder to a customer if they haven’t visited in over 30 days
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the customer
 *     responses:
 *       200:
 *         description: Reminder sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Visit reminder sent successfully'
 *                 data:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Failed to send visit reminder'
 */