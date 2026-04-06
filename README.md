# AI DevOps Agent (HackAuth0FrontEnd)

A small Next.js (App Router) frontend that provides an AI-powered DevOps agent UI. It supports GitHub-based workflows (PR reviews, creating issues) and uses Auth0 for authentication. The frontend talks to a back-end API (expected at `NEXT_PUBLIC_API_URL`) which performs the actual GitHub and AI work.

Live demo: https://hackauth0frontend.onrender.com/

## Features

- Login via Auth0 (GitHub connection configured in the app)
- Run automated PR reviews and post reviews to GitHub
- Create GitHub issues from a description
- Shows connected provider credentials and lets users revoke them

## Tech stack

- Next.js 16 (App Router)
- React 19
- Auth0 React SDK (`@auth0/auth0-react`)
- Tailwind CSS (configured in the project)

## Quickstart — run locally

Requirements:
- Node 18+ (recommended)

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Available npm scripts (from `package.json`):

- `dev` — runs the Next.js dev server (`next dev`)
- `build` — builds the production app (`next build`)
- `start` — starts the production server (`next start`)
- `lint` — runs eslint

## Configuration

- Backend API: The frontend reads `NEXT_PUBLIC_API_URL` in `app/page.js` and falls back to `http://127.0.0.1:5004` if not set. Example:

```bash
export NEXT_PUBLIC_API_URL="http://127.0.0.1:5004"
```

- Auth0: The app currently initializes `Auth0Provider` in `app/layout.js`. The file contains `domain` and `clientId` values; to use your own Auth0 tenant, replace those values or refactor to read from environment variables. The provider is configured with:

	- audience: `https://my-api` (the backend must accept this audience)
	- scope: `openid profile email offline_access`

Make sure your Auth0 application allows the GitHub connection if you want users to sign in with GitHub.

## How the frontend talks to the backend

The UI calls endpoints like `/agent/credentials`, `/github/review`, and `/github/issue` (see `app/page.js`). Those requests include an access token obtained via `getAccessTokenSilently`. Your backend must validate Auth0 access tokens issued for the same audience (`https://my-api`).

## Deployment

This project was deployed to Render (or another host). Live demo:

https://hackauth0frontend.onrender.com/

If you deploy elsewhere (Vercel, Render, etc.), ensure the Auth0 redirect URL is configured in your Auth0 application and the backend audience is correct.

## Contributing

Contributions and feedback are welcome. Please open an issue or a pull request.

## License

This project is licensed under the terms in the LICENSE file.
