# Print Management Software - Full Stack Application

A comprehensive printing software web application with Customer and Admin departments, inspired by cleanprint.in.

## Technology Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS

## Project Structure

```
printing-software/
├── frontend/                    # Next.js application
│   ├── app/                    # App router pages
│   │   ├── customer/          # Customer department pages
│   │   ├── admin/             # Admin department pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── lib/                   # API and utility functions
│   └── package.json
├── backend/                    # Node.js Express API
│   ├── routes/                # API route handlers
│   ├── config/                # Database configuration
│   ├── middleware/            # Auth middleware
│   ├── migrations/            # Database migrations
│   └── server.js              # Entry point
└── README.md                  # This file
```

## Features

### Customer Department
✅ **Home Page** - Dashboard with featured products and categories  
✅ **Login/Register** - Authentication system  
✅ **Category** - Hierarchical subcategories  
✅ **Product Catalog** - Browse products with add to cart functionality  
✅ **Shopping Cart** - Add, update, and remove items  
✅ **Add Money** - Wallet top-up with UPI/Card/Net Banking  
✅ **My Orders** - View all orders with status  
✅ **Order Details** - Detailed view of individual orders  
✅ **Complaint Management** - Submit and track complaints  
✅ **Price List** - View all products with pricing  
✅ **Profile** - Edit profile and change password  
✅ **Logout** - Secure logout

### Admin Department
✅ **Dashboard** - Statistics and overview  
✅ **Login/Register** - Admin authentication  
✅ **Category Management** - Add/Edit/Delete categories and subcategories
✅ **Product Listing** - Add/Edit/Delete products  
✅ **Orders Management** - View and update order status  
✅ **Orders Progress** - Track order progress with visual indicators  
✅ **Transactions** - View all payment transactions with filters  
✅ **Customer List** - Manage and view customer details  
✅ **Complaint List** - Respond to and manage complaints  
✅ **Price Listing** - Update product prices  
✅ **Logout** - Secure logout

## Step-by-Step Setup Guide

### Prerequisites

Before starting, ensure you have:
- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **PostgreSQL** installed and running ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- A code editor (VS Code recommended)

### Step 1: Database Setup

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download installer from postgresql.org
   - macOS: `brew install postgresql` or download installer
   - Linux: `sudo apt-get install postgresql` (Ubuntu/Debian)

2. **Start PostgreSQL service**
   ```bash
   # macOS/Linux
   brew services start postgresql
   # or
   sudo service postgresql start
   
   # Windows: Start from Services
   ```

3. **Create database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE printing_software;
   
   # Exit
   \q
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Or create .env manually with:
   ```

4. **Configure environment variables**
   
   Create `backend/.env` file with:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=printing_software
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
   JWT_EXPIRE=7d
   ```
   
   **Important**: Replace `your_postgres_password` with your actual PostgreSQL password.

5. **Run database migrations**
   ```bash
   npm run migrate
   ```
   
   This will create all necessary tables. You should see: `✅ Database migration completed successfully!`

6. **Create default admin user**
   ```bash
   npm run create-admin
   ```
   
   This creates a default admin account:
   - Email: `admin@printing.com`
   - Password: `admin123`

7. **Start backend server**
   ```bash
   npm run dev
   ```
   
   Backend will run on `http://localhost:5000`
   
   You should see:
   ```
   🚀 Server running on http://localhost:5000
   ✅ Database connected successfully
   ```

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create `frontend/.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start frontend development server**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:3000`

### Step 4: Access the Application

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Default Admin Credentials** (created during migration):
   - Email: `admin@printing.com`
   - Password: `admin123`
   
   **⚠️ Important**: Change this password immediately in production!

3. **Create Customer Account**:
   - Navigate to `/customer/register`
   - Fill in the registration form
   - Login with your credentials

## Usage Guide

### For Customers:

1. **Register/Login**: Create an account or login
2. **Browse Categories**: Navigate through product categories
3. **Add to Cart**: Select products and add them to cart
4. **Add Money**: Top up wallet using UPI or other methods
5. **Place Order**: Checkout from cart using wallet balance
6. **Track Orders**: View order status and details
7. **Submit Complaints**: Register complaints related to orders
8. **Manage Profile**: Update personal information and password

### For Admins:

1. **Login**: Use admin credentials to login
2. **Dashboard**: View statistics and recent orders
3. **Manage Categories**: Add/edit/delete categories and subcategories
4. **Manage Products**: Add/edit/delete products
5. **Process Orders**: Update order status (pending → confirmed → in_production → completed)
6. **Track Progress**: Monitor orders in progress
7. **View Transactions**: See all payment transactions
8. **Manage Customers**: View customer list and details
9. **Handle Complaints**: Respond to customer complaints
10. **Update Pricing**: Modify product prices

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get cart items (Customer)
- `POST /api/cart` - Add to cart (Customer)
- `PUT /api/cart/:id` - Update cart item (Customer)
- `DELETE /api/cart/:id` - Remove from cart (Customer)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order (Customer)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Wallet
- `GET /api/wallet` - Get wallet balance (Customer)
- `POST /api/wallet/add-money` - Add money to wallet (Customer)

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint (Customer)
- `PUT /api/complaints/:id/status` - Update complaint status (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats (Admin)

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check database credentials in `.env` file
- Ensure database `printing_software` exists

### Port Already in Use
- Backend (5000): Change `PORT` in `backend/.env`
- Frontend (3000): Next.js will automatically use next available port

### CORS Issues
- Ensure backend is running before frontend
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### Migration Errors
- Drop and recreate database: `DROP DATABASE printing_software; CREATE DATABASE printing_software;`
- Run migration again: `npm run migrate`

## Production Deployment

1. **Build frontend**: `cd frontend && npm run build`
2. **Set production environment variables**
3. **Use process manager** (PM2) for backend
4. **Configure reverse proxy** (Nginx) for frontend
5. **Enable HTTPS** with SSL certificates
6. **Update JWT_SECRET** to a strong random string
7. **Configure PostgreSQL** for production security

## Support

For issues or questions, please refer to the codebase or create an issue in the repository.

## License

This project is created for educational and commercial use.

