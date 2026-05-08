# Fondora-X
Live Proof-of-Work Investment Intelligence Platform

## Project Structure

```
fondorax/
├── backend/          # Node.js/Express backend
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication & validation
│   └── server.js     # Main server file
│
└── frontend/         # React frontend
    ├── public/       # Static files
    ├── src/
    │   ├── pages/    # Page components
    │   ├── components/ # Reusable components
    │   ├── styles/   # CSS files
    │   └── App.js    # Main app component
    └── package.json
```

## Features

### For Founders
- ⚡ Live Proof-of-Work Ledger with milestone tracking
- 📁 Pitch Deck upload and AI analysis
- 🎯 Execution score calculation
- 📊 Performance metrics dashboard
- 👤 Profile management

### For Investors
- 📈 Portfolio analytics and tracking
- 🏪 Micro-exit marketplace
- 👥 Founder discovery with execution scores
- 💼 Investment management
- 🔔 Deal alerts and notifications

### For Admins
- 👥 User management and verification
- 💳 Transaction monitoring
- 💰 Revenue analytics
- 🔍 Fraud detection tools
- 📊 System overview

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Validation**: Express Validator

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP**: Axios
- **Charts**: Chart.js & React ChartJS2
- **Styling**: Pure CSS (No Tailwind)

## Installation

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fondorax
JWT_SECRET=your_secret_key_here
```

Start the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Founder Routes
- `POST /api/founder/create-pow` - Create proof of work entry
- `GET /api/founder/my-pow` - Get user's POW entries
- `GET /api/founder/profile` - Get profile
- `PUT /api/founder/profile` - Update profile

### Investor Routes
- `GET /api/investor/portfolio` - Get portfolio
- `GET /api/investor/founders` - List all founders
- `GET /api/investor/founder/:id` - Get founder details
- `POST /api/investor/add-investment` - Add investment

### Marketplace Routes
- `POST /api/marketplace/create-listing` - Create exit listing
- `GET /api/marketplace/listings` - Get all listings
- `GET /api/marketplace/my-listings` - Get user's listings
- `POST /api/marketplace/place-bid/:id` - Place a bid
- `POST /api/marketplace/accept-bid/:id/:bidIndex` - Accept bid

### Pitch Deck Routes
- `POST /api/pitch/upload` - Upload pitch deck
- `GET /api/pitch/my-decks` - Get user's decks
- `GET /api/pitch/analysis/:id` - Get analysis

### Admin Routes
- `GET /api/admin/users` - List all users
- `PUT /api/admin/verify-user/:id` - Verify user
- `PUT /api/admin/verify-pow/:id` - Verify POW entry
- `GET /api/admin/transactions` - Get transactions
- `GET /api/admin/revenue` - Get revenue analytics

## Responsive Design

The application is fully responsive and mobile-optimized:

### Mobile Features
- Collapsible sidebar navigation
- Touch-friendly buttons and inputs
- Responsive grid layouts
- Mobile menu toggle
- Optimized font sizes for small screens

### Breakpoints
- **Desktop**: > 768px
- **Tablet**: 480px - 768px
- **Mobile**: < 480px

## Theming


## Database Models

### User
- Basic user information
- Role-based access (founder, investor, admin)
- Profile information (company, bio, location)
- Verification status

### ProofOfWork
- Founder execution entries
- Execution score calculation
- Verification by admin
- Multiple entry types

### PitchDeck
- Uploaded pitch files
- AI analysis results
- Investment readiness score
- Risk assessment

### Portfolio
- Investor's investments
- ROI tracking
- Risk metrics
- Diversification analysis

### Marketplace
- Exit listings
- Bidding system
- Transaction fees
- Escrow status

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Protected API routes
- Input validation

## Development

### Running in Development

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Building for Production

Backend:
```bash
npm start
```

Frontend:
```bash
npm run build
```

## Future Enhancements

- Blockchain-based proof verification
- Advanced AI/ML analytics
- Real-time notifications (WebSocket)
- Payment gateway integration
- Founder reputation system
- Automated matching algorithms
- Video pitch support
- Advanced portfolio analytics with more charts

## License

MIT License - Feel free to use this project

## Support

For issues or questions, please create an issue in the repository.
