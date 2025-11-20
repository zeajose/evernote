# Evernote AI

A minimalist writing app with AI-powered autocomplete that helps you write faster.

## Features

- **AI Autocomplete**: Get intelligent text suggestions as you write
- **Tab to Accept**: Press Tab to accept suggestions or retry for new ones
- **Auto-Suggest**: Automatically generates suggestions after 3 seconds of inactivity
- **Ghost Text**: Suggestions appear in lighter text for easy distinction
- **Local First**: All your notes are stored locally on your device
- **Minimalist UI**: Clean, distraction-free interface focused on writing

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env.local` (create it if missing):
   ```env
   AI_GATEWAY_API_KEY=your_gateway_api_key_here
   ```
   *Note: This project uses Vercel AI Gateway instead of OpenAI directly. Get your API key from the Vercel dashboard (AI Gateway → API Keys section).*

4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

- Start typing to begin writing
- After 3 seconds of inactivity, AI suggestions will appear automatically
- Press `Tab` to accept the suggestion or generate a new one
- Press `Escape` to dismiss suggestions
- Keep writing naturally - suggestions will adapt to your style

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS + Shadcn/UI
- Vercel AI SDK
- Zustand (State Management)
