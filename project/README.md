# EduBot CMS

A modern content management system for delivering educational content through Telegram, featuring video lessons and interactive quizzes.

## Features

- 🎥 Video Content Management
- 📝 Interactive Quizzes
- 📊 Analytics Dashboard
- 👥 User Management
- ⚡ Real-time Updates
- 🤖 Telegram Bot Integration
- 🎨 Modern Black & White UI
- 📱 Responsive Design

## Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - React Router
  - React Hot Toast

- **Backend:**
  - Supabase
  - PostgreSQL
  - Telegram Bot API
  - Perplexity AI

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Telegram Bot Token
- Perplexity AI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/edubot-cms.git
cd edubot-cms
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
edubot-cms/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable components
│   ├── lib/           # Utilities and services
│   ├── pages/         # Page components
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── supabase/          # Supabase configurations
└── package.json       # Dependencies and scripts
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks

## Deployment

1. Build the project:
```bash
npm run build
# or
yarn build
```

2. Deploy the `dist` directory to your hosting provider.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com)
- [React](https://reactjs.org)
- [Supabase](https://supabase.com)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Perplexity AI](https://perplexity.ai)

## Support

For support, email support@edubot-cms.com or join our Telegram channel.
