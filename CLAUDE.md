# Synapse - Knowledge Management System

## Development Server

**Port: 3163** (avoiding port 3000 to prevent conflicts with other services)

```bash
cd frontend
npm run dev
```

The app will be available at: http://localhost:3163

## Project Structure

```
Synapse/
├── frontend/           # Next.js frontend application
│   ├── app/           # App Router pages
│   │   ├── dashboard/ # Dashboard page
│   │   ├── auth/      # Authentication pages
│   │   └── ...
│   ├── components/    # React components
│   │   └── sidebar/   # Floating sidebar with AI features
│   ├── lib/           # Utilities
│   └── public/        # Static assets
└── CLAUDE.md          # This file
```

## Key URLs

- Landing page: http://localhost:3163/
- Dashboard: http://localhost:3163/dashboard
- Sign in: http://localhost:3163/auth/signin

## Demo Credentials

- Email: demo@synapse.app
- Password: demo123

- Email: test@synapse.app
- Password: test123

## Tech Stack

- Next.js 14.2 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js (authentication)
- Lucide React (icons)

## Design System

Based on Figma design with:
- Primary color: #0D6EFD (blue)
- Secondary colors: grayscale from #F8F9FA to #212529
- Success: #198754
- Purple: #6F42C1
- Orange: #FD7E14
- Danger: #DC3545
