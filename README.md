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
├── docs/                   → Software architecture, system design (Use case, flowchart, activity diagrams, CO/CD Pipeline Schema, etc.), mockup and UI website design 
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

### Entity Relationship & Database Schema Design
#### Database Schema Design
![inkcuba_database_design](https://github.com/user-attachments/assets/21b43c60-6186-44ae-bbd8-24f75628ef8f)

#### Database type
- **Database system:** PostgreSQL (SQL) or MongoDB (NoSQL)

#### Table structure
#### => portfolio
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **portfolio_id** | INTEGER | 🔑 PK, not null, unique, autoincrement |  | |
| **title** | VARCHAR(255) | not null |  | |
| **desc** | TEXT | not null |  | |
| **type** | PORTFOLIO_TYPE | not null |  |individual, group |
| **student_id** | INTEGER | not null | fk_portfolio_student_id_users | |
| **lecturer_id** | INTEGER | not null | fk_portfolio_lecturer_id_users | |
| **status** | PORTFOLIO_STATUS | not null, default: pending |  |pending, approved, rejected |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 

#### => users
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **user_id** | INTEGER | 🔑 PK, not null, unique, autoincrement |  | |
| **name** | VARCHAR(255) | not null |  | |
| **email** | VARCHAR(255) | not null, unique |  | |
| **password** | VARCHAR(255) | not null |  | |
| **role** | USER_ROLE | not null |  |admin, student, lecturer |
| **status** | USER_STATUS | not null, default: active |  |active, inactive, pending |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 

#### => portfolio_members
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **id** | INTEGER | 🔑 PK, not null, unique, autoincrement |  | |
| **portfolio_id** | INTEGER | not null | fk_portfolio_members_portfolio_id_portfolio | |
| **student_id** | INTEGER | not null | fk_portfolio_members_student_id_users | Declare array | 

#### => portfolio_assets
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **asset_id** | INTEGER | 🔑 PK, not null, unique, autoincrement |  | |
| **portfolio_id** | INTEGER | not null | fk_portfolio_assets_portfolio_id_portfolio | |
| **asset_type** | ASSET_TYPE | not null |  |image, video, document, source_code, link |
| **file_path** | VARCHAR(255) | not null |  | |
| **file_name** | VARCHAR(255) | not null |  | |
| **created_at** | TIMESTAMP | not null |  | |
| **uploaded_at** | TIMESTAMP | not null |  | | 

#### => portfolio_feedback
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **feedback_id** | INTEGER | 🔑 PK, not null, unique, autoincrement |  | |
| **portfolio_id** | INTEGER | not null | fk_portfolio_feedback_portfolio_id_portfolio | |
| **lecturer_id** | INTEGER | not null | fk_portfolio_feedback_lecturer_id_users | |
| **feedback_text** | TEXT | not null |  | |
| **status_change** | STATUS_CHANGE | null |  | |
| **created_at** | TIMESTAMP | not null |  | |
| **updated_at** | TIMESTAMP | not null |  | | 

#### => activity_log
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **log_id** | INTEGER | 🔑 PK, not null, unique, autoincrement |  | |
| **user_id** | INTEGER | not null | fk_activity_log_user_id_users | |
| **activity_type** | ACTIVITY_TYPE | not null |  |create, update, delete, others |
| **description** | TEXT | not null |  | |
| **timestamp** | TIMESTAMP | not null |  | | 

#### Relationships
- **portfolio to users**: one_to_many
- **portfolio to users**: one_to_many
- **portfolio_members to portfolio**: one_to_many
- **portfolio_members to users**: many_to_one
- **portfolio_assets to portfolio**: one_to_many
- **portfolio_feedback to portfolio**: one_to_one
- **portfolio_feedback to users**: one_to_many
- **activity_log to users**: one_to_many

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

# Example:
git commit -s -m "feat: login page"
```

_**Before pushing the repo, please update the repo to prevent merge conflicts or push rejections using this command: `git pull`**_

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
- Dafa Ramadhan Syaidina
- M. Haramain Asyi Emirryan Emir
- Wallace Louis Tjang
- Ida Bagus Kerthyayana Manuaba
- Raymond Bahana
