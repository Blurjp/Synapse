# Synapse

> **Where ideas connect.**

AI-powered learning and creation platform - Connecting knowledge, insights, and creativity

## 🎯 Project Overview

Synapse is an AI platform that seamlessly connects learning with creation. It's not just a content management tool, but an intelligent creative partner that understands how you think.

### Core Features

- 📥 **Save Anything** - Capture content from anywhere (PDF, web, video, audio, etc.)
- 🧠 **AI Insights** - Learn from your interactions, generate personalized insights
- ✏️ **Editable Generation** - AI-generated content is fully editable
- 🔗 **Connected Space** - Unified workspace, seamlessly connecting learning and creation

### Target Users

- **Creators** - Organize scattered ideas into meaningful work
- **Researchers** - Extract key insights from massive sources
- **Students** - Transform complex materials into clear understanding

## 📚 Documentation

- [Design Document](./docs/DESIGN.md) - Complete technical design and architecture
- [API Documentation](./docs/API.md) - API interface documentation (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deployment and operations guide (coming soon)

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State**: Redux Toolkit + React Query
- **Editor**: TipTap

### Backend
- **Runtime**: Python 3.11+ / Node.js 20+
- **Framework**: FastAPI
- **Database**: PostgreSQL 16 + pgvector
- **Cache**: Redis 7
- **AI**: OpenAI API + LangChain

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Storage**: Cloudflare R2
- **Vector DB**: Pinecone

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 16
- Redis 7

### Installation

```bash
# Clone the repository
git clone https://github.com/Blurjp/Synapse.git
cd Synapse

# Frontend setup
cd frontend
npm install

# Backend setup
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create database
createdb synapse
psql -d synapse -c "CREATE USER synapse WITH PASSWORD 'synapse';"
psql -d synapse -c "GRANT ALL PRIVILEGES ON DATABASE synapse TO synapse;"
```

### Configuration

```bash
# Frontend environment variables
cp frontend/.env.example frontend/.env.local

# Backend environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

### Running

```bash
# Start frontend (http://localhost:3000)
cd frontend
npm run dev

# Start backend (http://localhost:8000)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📁 Project Structure

```
Synapse/
├── frontend/          # Next.js frontend application
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utility functions
│   └── types/         # TypeScript types
│
├── backend/           # FastAPI backend application
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── models/    # Database models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── services/  # Business logic
│   │   └── utils/     # Utility functions
│   └── tests/         # Tests
│
├── docs/              # Documentation
│   ├── DESIGN.md      # Design document
│   ├── API.md         # API documentation
│   └── DEPLOYMENT.md  # Deployment guide
│
└── README.md          # This file
```

## 🗺️ Roadmap

### Phase 1: MVP (4-6 weeks)
- [ ] Basic architecture setup
- [ ] User authentication system
- [ ] Source management (upload, import)
- [ ] Highlights and notes
- [ ] AI summary generation
- [ ] Basic editor

### Phase 2: AI Enhancement (3-4 weeks)
- [ ] Vector embeddings and semantic search
- [ ] Concept extraction and question generation
- [ ] Knowledge graph visualization
- [ ] AI-driven insights

### Phase 3: Collaboration & Extension (3-4 weeks)
- [ ] Real-time collaborative editing
- [ ] Browser Extension
- [ ] iOS App
- [ ] Public API

### Phase 4: Optimization & Launch (2-3 weeks)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] Official launch

See [Design Document](./docs/DESIGN.md#开发路线图) for details

## 🤝 Contributing

Project is in early development stage, external contributions not accepted yet.

## 📄 License

MIT License - See [LICENSE](./LICENSE) file

## 🔗 Links

- **GitHub**: https://github.com/Blurjp/Synapse
- **Design Document**: [docs/DESIGN.md](./docs/DESIGN.md)
- **Original Inspiration**: https://youmind.com

## 📧 Contact

- **GitHub Issues**: https://github.com/Blurjp/Synapse/issues

---

**Built with ❤️ by OpenClaw Agent**
