# Conard

**Stop fighting AI coding tools with bad context. Generate perfect .cursorrules and context files from any GitHub repo in 30 seconds.**

**Live URL:** [https://www.contextwizard.ai](https://context-wizard.vercel.app)

**Demo:**

![Demo GIF of Conard]([DEMO_GIF_OR_VIDEO])

Conard is a tool that helps you generate context files for your AI coding tools. It analyzes your GitHub repository and creates a `.cursorrules` file that you can use with tools like Cursor to provide better context to the AI.

## Features

*   **Unlimited Generations:** Create as many context files as you need.
*   **Works with Your Favorite Tools:** Generate context files for Cursor, Windsurf, and other AI coding tools.
*   **Private Repo Support:** Securely connect your private GitHub repositories.
*   **Framework-Aware:** Understands popular frameworks and libraries to create more accurate context.
*   **Easy to Use:** Simple, intuitive interface to get you started in seconds.

## Tech Stack

*   **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend:** [Convex](https://www.convex.dev/)
*   **Authentication:** [Clerk](https://clerk.com/)
*   **Payments:** [Stripe](https://stripe.com/)
*   **AI APIs:** [OpenRouter](https://openrouter.ai/) with automatic fallback to [Google Gemini](https://ai.google.dev/)

## Environment Variables

### Required Variables

*   `OPENROUTER_API_KEY_FREE`: OpenRouter API key for free tier users
*   `OPENROUTER_API_KEY_PRO`: OpenRouter API key for pro tier users
*   `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
*   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
*   `CLERK_SECRET_KEY`: Clerk secret key

### Optional Variables (for Fallback)

*   `GEMINI_API_KEY_FREE`: Google Gemini API key for free tier users (enables fallback)
*   `GEMINI_API_KEY_PRO`: Google Gemini API key for pro tier users (enables fallback)

### API Fallback Mechanism

The application includes an automatic fallback mechanism that switches to Google's Gemini API when OpenRouter encounters:

*   Rate limits (HTTP 429)
*   Credit exhaustion (HTTP 401 with credit/quota errors)
*   Service unavailability (HTTP 503)
*   Server errors (HTTP 5xx)

The fallback is transparent to users and maintains the same user tier (free/pro) for appropriate API key selection. If Gemini API keys are not configured, the application will continue to function but without fallback capability.

## How It Works

1.  **Connect Your GitHub Account:** Securely connect your GitHub account to give Conard access to your repositories.
2.  **Select a Repository:** Choose the repository you want to generate a context file for.
3.  **Generate Context:** Conard will analyze your repository and generate a `.cursorrules` file.
4.  **Download and Use:** Download the generated file and use it with your favorite AI coding tool.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to report a bug or suggest a feature.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3ai.  Commit your changes (`git commit -am 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Create a new Pull Request.
