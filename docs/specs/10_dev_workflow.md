# 🔄 Development Workflow

## Branching

- `main` — production-ready code
- `feature/*` — feature branches (e.g., `feature/budget-backend`, `feature/auto-savedAmount-input`)
- `refactor/*` — refactoring branches (e.g., `refactor/update-docs`)

## Steps

1. Pick feature from roadmap
2. Create feature branch from `main`
3. Implement with clean architecture
4. Test functionality
5. Push branch and create PR
6. Merge to `main`

## Code Quality — ✅ Implemented

- ESLint (configured for both frontend and backend)
- Consistent commit messages (`feat:`, `fix:`, `refactor:`, `chore:`)

## Code Quality — 🛠️ Planned

- Prettier (not yet configured)
- Unit tests (Jest / Vitest)
- E2E tests (Cypress / Playwright)

## Commits

Follow conventional commit format:

- `feat:` — new features
- `fix:` — bug fixes
- `refactor:` — code restructuring
- `chore:` — tooling, config, docs
