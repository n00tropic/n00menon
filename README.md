# Demo Node Service

A demo Node.js service

## Features

- ✅ TypeScript with strict mode
- ✅ Modern Node.js (v24.10.1+)
- ✅ Vitest for testing with coverage
- ✅ ESLint + Prettier for code quality
- ✅ GitHub Actions CI/CD
  
- ✅ Security scanning (CodeQL, pnpm audit, secret scanning)
  
  
- ✅ SBOM generation and signing
  

## Getting Started

### Prerequisites

- Node.js 24.10.1 or higher
- pnpm (recommended via corepack), or npm/yarn

### Installation

```bash
pnpm install
```

### Development

```bash
# Run in development mode with hot reload
pnpm run dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Build for production
pnpm run build

# Run production build
pnpm start
```

### Code Quality

```bash
# Lint code
pnpm run lint

# Fix lint issues
pnpm run lint:fix

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Type check
pnpm run typecheck
```

## Project Structure

```
.
├── src/           # Source code
├── tests/         # Test files
├── dist/          # Compiled output
├── .github/       # GitHub Actions workflows
└── package.json   # Project configuration
```

## Scripts

- `dev` - Run in development mode with hot reload
- `build` - Compile TypeScript to JavaScript
- `test` - Run tests with coverage
- `test:watch` - Run tests in watch mode
- `start` - Run production build
- `lint` - Check code with ESLint
- `lint:fix` - Fix ESLint issues automatically
- `format` - Format code with Prettier
- `format:check` - Check code formatting
- `typecheck` - Run TypeScript type checking

## CI/CD

This project uses GitHub Actions for continuous integration:

- **CI Pipeline**: Runs on push and pull requests
  - Type checking
  - Linting
  - Format checking
  - Unit tests with coverage
  - Multi-version Node.js testing (18, 20, 21)



- **Security Pipeline**: Runs weekly and on changes
  - Dependency vulnerability scanning (pnpm audit)
  - Static analysis (CodeQL)
  - Secret scanning (TruffleHog)
    

## License

Apache-2.0

## Author

Test Author <test@example.com>
