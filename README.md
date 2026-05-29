# 🚨 RescueSync: Advanced Disaster Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Real-Time Monitoring System for Disaster Management Trainings** — An advanced full-stack platform with AI/ML integration for scheduling, tracking, analytics, real-time alerts, and gamified drills.

## 📌 Overview

RescueSync is a premium, real-time disaster management training and monitoring platform designed to revolutionize how government agencies, NGOs, and communities prepare for emergencies. This comprehensive system bridges the gap between disaster management training and measurable outcomes through real-time coordination, analytics, and performance tracking.

**Core Capabilities:**

- **Real-time Monitoring & Coordination** - Track all disaster management trainings nationwide with live updates and activity logs
- **Comprehensive Analytics & Insights** - Training impact scoring, geographic coverage tracking, and knowledge retention metrics
- **Geographic Coverage Tracking** - Regional performance analysis with state-wise comparisons
- **Training Program Management** - Create, schedule, and track training programs across disaster management categories (Capacity Building, Response, Recovery, Preparedness)
- **Live Dashboards & Reporting** - Real-time KPIs including active trainings, participants, completion rates, and monthly trends
- **Role-Based Access Control** - Multi-user system supporting Admin, Trainer, State Coordinator, and Data Entry roles

## ✨ Key Features

### 📈 Dashboard & Analytics
- Real-time data visualization with Recharts
- Training completion rates and progress tracking
- Performance metrics and leaderboards
- Export reports in CSV/PDF formats

### 📚 Training Modules
- Interactive drills and simulations
- Video tutorials and documentation
- Quizzes and assessments
- Progress tracking and certification

### 🔔 Real-Time Alerts
- Push notifications for emergencies
- SMS/Email integration
- Geolocation-based alerts
- Drill announcements

### 🎮 Gamification
- Points and badges system
- Leaderboards and rankings
- Team challenges
- Achievement unlocks

### 👥 User Management
- Role-based access (Admin, Trainer, Trainee)
- Profile management
- Activity logs
- Attendance tracking

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS, Radix UI (shadcn/ui)
- **State Management:** React Query (TanStack Query)
- **Charts:** Recharts
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Authentication:** JWT + Supabase Auth
- **API:** RESTful + Real-time subscriptions

### Database & Services
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage
- **Analytics:** Custom aggregation pipelines

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Git

### Clone Repository

```bash
git clone <your-repository-url>
cd rescuesync
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Add your Supabase credentials

# Start development server
npm run dev
```

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Add your Supabase and API keys

# Start backend server
npm run dev
```

### Environment Variables

**Frontend `.env`:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
```

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

## 🎯 Usage Example

### Creating a Training Session

```typescript
// frontend/src/services/training.ts
import { supabase } from './supabase';

const createTraining = async (trainingData) => {
  const { data, error } = await supabase
    .from('trainings')
    .insert({
      title: trainingData.title,
      description: trainingData.description,
      scheduled_at: trainingData.date,
      trainer_id: trainingData.trainerId,
      drill_type: trainingData.drillType
    });
  
  return { data, error };
};
```

### Real-time Subscription

```typescript
// Subscribe to training updates
supabase
  .channel('trainings')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'trainings' },
    (payload) => {
      console.log('Training updated:', payload);
      // Update UI
    }
  )
  .subscribe();
```

## 📊 Data Flow Architecture

1. **User Action** → UI triggers event (form submit, dashboard load)
2. **React Query** → Manages API calls and caching
3. **Supabase Client** → Real-time updates via subscriptions
4. **Backend API** → Business logic, JWT verification, data validation
5. **Supabase Database** → Secure data storage and retrieval
6. **Analytics Pipeline** → Server-side aggregations and reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>⭐ RescueSync — Advancing Disaster Preparedness Globally.</b>
</div>
