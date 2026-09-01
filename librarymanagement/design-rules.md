# Design Rules & System Tokens

## 1. Color Palette
- **Primary**: `#00B4A8` (`--primary-color`)
- **Primary Dark**: `#008F85` (`--primary-dark`)
- **Primary Light**: `#45D1C7` (`--primary-light`)
- **Background**: `#F4F7F6` (`--bg-color`)
- **Card / Surface**: `#FFFFFF` (`--card-bg`)
- **Text Main**: `#333333` (`--text-main`)
- **Text Muted**: `#777777` (`--text-muted`)
- **Text Inverse**: `#FFFFFF` (`--text-inverse`)
- **Danger / Error**: `#FF4C4C` (`--danger-color`)
- **Warning**: `#FFC107` (`--warning-color`)
- **Success**: `#4CAF50` (`--success-color`)
- **Border**: `#E0E0E0` (`--border-color`)

## 2. Typography
- **Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Headings**:
  - `h1`: 2rem (32px), weight: 700 / 600
  - `h2`: 1.5rem (24px), weight: 600
  - `h3`: 1.15rem (18.4px), weight: 600
  - `body`: 1rem (16px), weight: 400
  - `caption / small`: 0.85rem (13.6px), weight: 500

## 3. Spacing Scale
- `4px` (`0.25rem`)
- `8px` (`0.5rem`)
- `12px` (`0.75rem`)
- `16px` (`1rem`)
- `24px` (`1.5rem`)
- `32px` (`2rem`)
- `48px` (`3rem`)

## 4. Border Radius & Shadows
- **Radius**: `16px` (`--border-radius`), `12px` (inner elements/badges), `8px` (small controls)
- **Shadows**:
  - Base: `0 4px 12px rgba(0, 0, 0, 0.05)`
  - Hover: `0 8px 24px rgba(0, 0, 0, 0.08)`
  - Active: `0 2px 6px rgba(0, 0, 0, 0.04)`

## 5. Responsive Breakpoints
- **Desktop / Laptop (L)**: `> 992px` (2 columns for dashboard charts: `2fr 1fr`)
- **Tablet (M)**: `576px - 992px` (Stacked single column `1fr` for charts, responsive grids)
- **Mobile (S)**: `< 576px` (Stacked single column `1fr`, compact padding and sidebar)

## 6. Security & Environment
- **Secrets Management**: NEVER hardcode API keys, admin credentials, or any sensitive data in source code.
- **Configuration**: Use `application.properties` (or environment variables) for secrets like `app.admin.secret-key` and external API keys (e.g., Brevo).
- **Admin Access**: Admin accounts are created dynamically via secured endpoints (using an admin secret) rather than being seeded with hardcoded credentials.

## 7. Component Guidelines
- **Reusability**: Check `/components` for existing UI elements before creating new ones.
- **Design Tokens**: All styling must use the variables defined above. Do not use ad-hoc hex colors or pixel sizes.
