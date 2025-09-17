# IY-CRM

A modern, lightweight Customer Relationship Management (CRM) system built with Node.js, Express, SQLite, and vanilla JavaScript.

## Features

- **Customer Management**: Create, update, and manage customer information
- **Lead Tracking**: Track and convert leads to customers
- **Contact History**: Record and manage customer interactions
- **User Authentication**: Secure JWT-based authentication system
- **REST API**: Full RESTful API for all CRM operations
- **Responsive Web Interface**: Clean, modern UI that works on all devices

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/superegp/IY-CRM.git
cd IY-CRM
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## Usage

### Getting Started

1. **Register a new account**: Visit the application and create a new user account
2. **Login**: Use your credentials to access the CRM dashboard
3. **Manage Customers**: Add, edit, and organize your customer database
4. **Track Leads**: Monitor potential customers and convert them when ready
5. **Record Contacts**: Keep track of all customer interactions

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get specific customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers?search=term` - Search customers

#### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get specific lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/convert` - Convert lead to customer
- `GET /api/leads?status=new` - Filter leads by status

#### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get specific contact
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `GET /api/contacts?customer_id=123` - Get contacts for specific customer

### Authentication

All API endpoints (except auth) require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Project Structure

```
IY-CRM/
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/            # Utility functions
│   └── index.js          # Application entry point
├── public/
│   ├── css/              # Stylesheets
│   ├── js/               # Frontend JavaScript
│   └── index.html        # Main HTML file
├── tests/                # Test files
├── package.json
└── README.md
```

## Database Schema

The application uses SQLite with the following main tables:

- **users**: User accounts and authentication
- **customers**: Customer information and details
- **leads**: Potential customers and lead scoring
- **contacts**: Customer interaction history

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret for JWT token signing
- `DB_PATH`: Path to SQLite database file
- `NODE_ENV`: Environment (development/production)

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.
