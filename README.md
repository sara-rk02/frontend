# Investment Dashboard Frontend

A modern Next.js frontend for the USDT Investment Portal, featuring a beautiful dashboard with real-time charts, admin panel, and responsive design.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark mode support
- 📊 **Interactive Charts** - Real-time data visualization with Chart.js
- 👥 **Role-based Access** - Separate dashboards for investors and admins
- 🔐 **Authentication** - Secure login system with role management
- 📱 **Mobile Responsive** - Optimized for all device sizes
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ⚡ **Fast Performance** - Built with Next.js 15 and optimized for speed

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

**Admin Account:**
- Email: admin@example.com
- Password: password123

**Investor Account:**
- Email: investor@example.com  
- Password: password123

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── dashboard/         # Investor dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
└── styles/               # Global styles
```

## Features Overview

### Investor Dashboard
- Investment overview with key metrics
- Interactive charts showing profit trends
- Recent payouts and profit history
- Real-time data updates

### Admin Panel
- Platform overview with statistics
- Investor management
- Add new investors
- View and manage all accounts

### Authentication
- Role-based login (Admin/Investor)
- Secure session management
- Automatic role-based redirects

## API Integration

The frontend is designed to work with the Flask backend API. Update the API endpoints in the components to connect to your backend:

- `/api/auth/login` - User authentication
- `/api/admin/register` - Register new investors
- `/api/chart_data` - Chart data updates

## Customization

### Themes
The app supports light and dark themes. Theme preferences are stored in localStorage and persist across sessions.

### Styling
All styles use Tailwind CSS with custom configurations in `tailwind.config.ts`. The design system includes:
- Custom color palette
- Responsive breakpoints
- Dark mode variants
- Custom animations

## Deployment

Build the application for production:

```bash
npm run build
npm start
```

The app will be available at `http://localhost:3000` by default.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the USDT Investment Portal system.
# frontend
# frontend
