# CollegeConnect - College Recommendation System

A full-stack web application that helps students find colleges matching their academic credentials.

## Features

- User authentication (Register/Login)
- College recommendation based on:
  - MCET Rank
  - Intermediate Marks
  - Desired Course (CSE, ECE, MECH)
- Responsive and modern UI
- Real-time college matching algorithm

## Technology Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Authentication:** bcryptjs for password hashing

## Installation

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - For local MongoDB: `mongodb://localhost:27017/collegeconnect`
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/collegeconnect`

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Database Initialization

The application automatically initializes the database with 12 sample colleges on first run. The sample data includes colleges for CSE, ECE, and MECH courses with various cutoff criteria.

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Recommendations
- `POST /api/recommendations` - Get college recommendations
  - Body: `{ mcet_rank: Number, intermediate_marks: Number, desired_course: String }`

### Utilities
- `GET /api/colleges` - Get all colleges (for testing)

## Usage

1. **Register/Login:** Create an account or login with existing credentials
2. **Enter Details:** Fill in your MCET rank, intermediate marks percentage, and select desired course
3. **Get Recommendations:** Click "Find Colleges" to see matching colleges
4. **View Results:** Browse through recommended colleges with detailed information

## Recommendation Logic

Colleges are matched when:
- Course matches the desired course
- User's MCET rank is better than or equal to the college's cutoff (lower rank = better)
- User's intermediate marks are higher than or equal to the college's cutoff

Results are sorted by MCET rank cutoff (best matches first).

## Project Structure

```
CollegeConnect/
├── app.js                 # Main server file
├── models/
│   ├── User.js           # User schema
│   └── College.js        # College schema
├── public/
│   ├── index.html        # Frontend HTML
│   ├── script.js         # Frontend JavaScript
│   └── style.css         # Styling
├── package.json          # Dependencies
└── README.md            # This file
```

## License

ISC

