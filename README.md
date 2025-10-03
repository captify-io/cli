# create-captify-app

CLI tool to scaffold new Captify plugin applications.

## Usage

### Create a new app

```bash
npx create-captify-app my-app
```

Or with prompts:

```bash
npx create-captify-app
```

You'll be prompted for:
- **App name**: Lowercase with dashes (e.g., `my-captify-app`)
- **Port number**: Development port (default: 3002)
- **Description**: Brief app description

### Upgrade existing app

From your app directory:

```bash
npx create-captify-app upgrade
```

Select which configuration files to update from the latest template.

## What's Included

The CLI creates a minimal Captify plugin app with:

### Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration with basePath
- `tsconfig.json` - TypeScript configuration
- `postcss.config.cjs` - PostCSS with Tailwind v4
- `.gitignore` - Standard Next.js ignore patterns
- `.env.example` - Environment variable template

### Source Files
- `src/config.ts` - App configuration and menu structure
- `src/app/layout.tsx` - Root layout with auth and Captify providers
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles with Tailwind imports

## Architecture

### Plugin Pattern
Apps created with this CLI follow the Captify plugin architecture:

1. **Authentication**: Delegates to platform (port 3000) via cross-origin cookies
2. **AWS Services**: Proxies requests through platform's `/api/captify` endpoint
3. **Independent Deployment**: Each plugin runs on its own port and domain

### Key Features
- ✅ Minimal setup - only essential files for deployment
- ✅ No build artifacts - uses Next.js server-side rendering
- ✅ Tailwind CSS v4 with `@captify-io/core` themes
- ✅ TypeScript support
- ✅ Hash-based routing via `HashRouter`
- ✅ Session management with NextAuth.js

## Development

After creating your app:

```bash
cd my-app
npm install
npm run dev
```

App will run on the configured port (default: 3002).

**Important**: Platform must be running on port 3000 for authentication.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Platform URL (required for auth)
NEXT_PUBLIC_CAPTIFY_URL=http://localhost:3000

# NextAuth config (must match platform)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# AWS config (optional)
COGNITO_IDENTITY_POOL_ID=
BEDROCK_AGENT_ID=
BEDROCK_AGENT_ALIAS_ID=
```

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

Apps are typically deployed to AWS Elastic Beanstalk with Nginx reverse proxy routing by subdomain.

## Upgrade Strategy

The CLI supports selective upgrades:

1. Run `npx create-captify-app upgrade` from app directory
2. Select files to update (preserves custom code)
3. Safe files to upgrade:
   - `next.config.ts`
   - `tsconfig.json`
   - `postcss.config.cjs`
   - `src/app/globals.css`
   - `.gitignore`

**Note**: `package.json`, `src/config.ts`, and page files are NOT upgraded to preserve customizations.

## License

MIT
