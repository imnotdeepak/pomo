# Pomodoro Timer App

A productivity app with Pomodoro timer and Kanban board functionality, built with Next.js and Supabase.

## Features

- 🔐 **Authentication**: Secure signup/login with Supabase
- ⏰ **Pomodoro Timer**: 25-minute focus sessions with 5-minute breaks
- 📋 **Kanban Board**: Task management with drag-and-drop functionality
- 🎨 **Modern UI**: Beautiful glassmorphism design with Tailwind CSS
- 🔒 **Security**: Protected routes and duplicate email prevention

## Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to Settings > API
3. Copy your Project URL and anon/public key
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Database Setup

In your Supabase SQL editor, run this to enable RLS (Row Level Security):

```sql
-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to see only their own data
CREATE POLICY "Users can view own profile" ON auth.users
  FOR SELECT USING (auth.uid() = id);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Homepage**: Visit the homepage to see login/signup options
2. **Authentication**: Create an account or login with existing credentials
3. **Dashboard**: Access the Pomodoro timer and Kanban board
4. **Timer**: Start/stop the 25-minute focus timer with automatic break periods
5. **Kanban Board**: Click "Show Kanban Board" to manage your tasks

## Project Structure

```
src/
├── app/
│   ├── dashboard/     # Protected dashboard page
│   ├── login/         # Login page
│   ├── signup/        # Signup page
│   └── page.tsx       # Homepage
├── components/
│   ├── auth/          # Authentication components
│   ├── PomodoroTimer.tsx
│   └── KanbanBoard.tsx
└── lib/
    ├── supabase.ts    # Client-side Supabase
    └── supabase-server.ts # Server-side Supabase
```

## Security Features

- Protected routes using middleware
- Duplicate email prevention during signup
- Row Level Security (RLS) enabled
- Secure authentication flow
- Automatic session management

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend and authentication
- **React Hooks** - State management
