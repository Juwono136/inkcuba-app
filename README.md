# Inkcuba Web Application

## Overview
Inkcuba is an application used to collect all portfolios or projects from Binus University International students that have been previously verified by lecturers from the respective courses. This web-based application is continuously developed and used for research and development purposes within the Computer Science program at Binus International.

## Developer Guidelines
### Built using the **MERN Stack**:
- **MongoDB** – Database
- **Express.js** – Backend framework
- **React.js + ViteJS + daisyUI** – Frontend library
- **Node.js** – Runtime environment
- **Redux toolkit + Redux Thunk** – State Management
- **Axios** – API Data Fetching
- **react-hot-toast** - Alert/Notification Message
- **react-icons** - Icon assets for react

### Base Features
- Student portfolio submission and verification
- Lecturer dashboard for validation
- Admin panel for system management
- Responsive UI
- Secure authentication and role-based access

### Folder Structure
```bash
inkcuba/
├── mockup/                 → Mockup and UI website design
├── docs/                   → Software architecture and system design (Use case, flowchart, activity diagrams, CO/CD Pipeline Schema, etc.)
├── client/                 → React frontend
│   ├── node_modules/       → node modules from node packages
│   ├── public/
│   ├── src/
│   │   ├── app/            → to put store.js file that contains the schema for store the state
│   │   ├── assets/         → Images, icons, etc.
│   │   ├── common/         → Common Reusable UI components (e.g., Loader.jsx, ScrollUp.jsx, Date.jsx, NotFound.jsx, etc.)
│   │   ├── components/     → Reusable UI components
│   │   ├── pages/          → Page-level components
│   │   ├── features/       → API calls that contains services and slices
│   │   ├── utils/          → Additional common functions + including data dummy for testing
│   │   └── App.jsx
│   │   └── index.css
│   │   └── main.jsx
│   └── package.json
│   └── vite.config.js
│   └── .gitignore
│
├── server/                 → Node.js + Express backend
│   ├── config/             → DB and environment config
│   ├── controllers/        → Route logic
│   ├── models/             → Mongoose schemas
│   ├── routes/             → API endpoints
│   ├── middleware/         → Auth, error handling
│   └── server.js
│   └── package.json
│   └── .gitignore
│
├── .env                    → Environment variables
├── .gitignore
├── README.md
└── package.json            → Root-level scripts
```

### Setup Instructions
Prerequisites:
- Node.js v20+
- React.js v19+
- MongoDB (Compass (prodcution) + Atlas (developement))
- Git

### Installation Steps:
1. Clone the repository
```bash
git clone https://github.com/Juwono136/inkcuba-app
``` 
2. Install backend dependencies:
```bash
cd server && npm install
```
3. Install frontend dependencies:
```bash
cd ../client && npm install
```

### Environment Setup:
Create a .env file in the server/ folder with:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
...
```

### Run the App:
- Backend: `cd server && npm run dev`
- Frontend: `cd client && npm start`

## Team Collaboration Guidelines
### Branching Strategy:
- `main/master` → Production-ready code
- `dev` → Development integration
- `feature/<feature-name>` → New features
- `bugfix/<issue-name>` → Fixes bugs/error

### Commit Convention:
=> Commit structure format:
```bash
git commit -s -m "<commit comment>"
```

Use Conventional Commit Comments:
- `feat`: for new features
- `fix`: for bug fixes
- `docs`: for documentation updates

### Code Reviews:
- All pull requests will be reviewed
- Use GitHub Issues for task tracking
- Assign reviewers and use labels

### Tools:
- ESLint + Prettier for formatting
- Postman for API testing
- Notions/Plane for task management

## Project Members
- Juwono
