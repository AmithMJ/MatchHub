# MatchHub: Weekly Tournament Registration System

MatchHub is a high-performance, mobile-first registration system for local sports tournaments. Built with FastAPI and React, it offers a premium sports UI experience for organizers and players.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Query, React Hook Form.
- **Backend**: FastAPI (Python), SQLAlchemy, MySQL, JWT Authentication.
- **Database**: MySQL.

## Getting Started

### Backend Setup
1. Navigate to `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Configure `.env` with your MySQL credentials.
4. Run the server: `uvicorn app.main:app --reload`.

### Frontend Setup
1. Navigate to `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## Key Features
- **Organizer Dashboard**: Real-time stats and management tools.
- **Team Management**: CRUD operations for teams with logo uploads.
- **Player Registration**: Multi-step registration flow with payment verification.
- **Payment Verification**: Simple workflow for organizers to approve/reject player payments via screenshots.
- **Mobile First**: Optimized for touch interaction and mobile usage.

## Deployment Instructions
- **Frontend**: Deploy to Vercel/Netlify. Set `VITE_API_URL` to your backend URL.
- **Backend**: Deploy to Render/Railway. Ensure MySQL database is accessible.
- **Static Files**: Currently set to local `uploads` folder. For production, integrate with S3 or Cloudinary.
