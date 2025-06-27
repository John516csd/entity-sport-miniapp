# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat mini-program for Entity Sport built with Taro React framework. The app provides gym membership management, appointment booking, and user profile features.

**Key Framework:** Taro 4.0.9 with React 18, TypeScript, and Less for styling
**State Management:** Zustand (vanilla store pattern)
**Build Tool:** Vite with custom Taro configuration

## Development Commands

**Development (WeChat Mini Program):**
```bash
npm run dev:weapp
```

**Build for Production:**
```bash
npm run build:weapp
```

**Other Platforms:**
- H5: `npm run dev:h5` / `npm run build:h5`
- Alipay: `npm run dev:alipay` / `npm run build:alipay`
- ByteDance: `npm run dev:tt` / `npm run build:tt`

**Linting:**
```bash
npx eslint src/
npx stylelint "src/**/*.less"
```

## Architecture Overview

### Core Structure
- **Pages:** Located in `src/pages/` - main app screens (index, appointment, profile, login)
- **Components:** Reusable UI components in `src/components/`
- **API Layer:** Centralized API calls in `src/api/` with TypeScript types
- **State Management:** Zustand stores in `src/store/` (user, appointment, membership)
- **Utils:** Helper functions in `src/utils/` (date formatting, request handling)

### State Management Pattern
Uses Zustand vanilla stores with custom hooks pattern:
- `src/store/user.ts` - Authentication and user data
- `src/store/appointment.ts` - Booking and scheduling
- `src/store/membership.ts` - VIP and membership status

### API Architecture
- Base request utility in `src/utils/request.ts`
- Typed API functions grouped by domain (auth, user, coach, appointment, membership)
- Response types defined in `src/api/types.ts`

### Component Organization
- Module-specific components in `src/modules/` (e.g., appointment/card-swiper)
- Shared components in `src/components/` with co-located styles (*.module.less)
- Assets organized by feature in `src/assets/`

### Authentication Flow
WeChat login integration with token-based authentication stored in Taro.storage. User state managed through Zustand with persistent login status checking.

## Important Notes

- Uses pnpm as package manager
- WeChat mini-program specific APIs through `@tarojs/taro`
- Custom fonts loaded via `src/styles/kingo-fonts.less`
- Mock data available in `src/mock/` for development
- TypeScript strict mode enabled with global type declarations