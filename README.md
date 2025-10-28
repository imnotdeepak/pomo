# Pomodoro Timer App

A productivity app with Pomodoro timer and Kanban board functionality, built with Next.js and Supabase.

## Features

- 🔐 **Authentication**: Secure signup/login with Supabase
- ⏰ **Pomodoro Timer**: 25-minute focus sessions with 5-minute breaks
- 📋 **Kanban Board**: Task management with drag-and-drop functionality
- 🎨 **Modern UI**: Beautiful glassmorphism design with Tailwind CSS
- 🔒 **Security**: Protected routes and duplicate email prevention

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
