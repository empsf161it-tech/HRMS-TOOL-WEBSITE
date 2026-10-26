# Ellowring Multi-Industry HRMS — Front-End Build

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-5414B8?style=for-the-badge&logo=github)](https://empsf161it-tech.github.io/HRMS-TOOL-WEBSITE/)

> **🌐 Live Deployment on GitHub Pages:**  
> - **Landing Page & Launchpad:** [https://empsf161it-tech.github.io/HRMS-TOOL-WEBSITE/](https://empsf161it-tech.github.io/HRMS-TOOL-WEBSITE/)  
> - **Direct HRMS App Workspace:** [https://empsf161it-tech.github.io/HRMS-TOOL-WEBSITE/app/#/home](https://empsf161it-tech.github.io/HRMS-TOOL-WEBSITE/app/#/home)

Enterprise-grade HRMS, Marketing Website, and Website Control Center built for Indian enterprise regulations, biometric terminals, GPS geo-fencing, and multi-entity operations.

## 🚀 Key Architectural Principles

- **Pure Web Standards**: HTML5, CSS3 (cascade layers, native nesting, container queries, View Transitions API), and ES2023+ JavaScript modules.
- **Zero Build Step**: No Webpack, Vite, Babel, Tailwind, or React dependencies. The app runs straight out of any static web server.
- **Mock REST API Layer**: `assets/js/services/api.js` provides a Promise-based REST contract over IndexedDB and `localStorage`. When ready to integrate with a real backend, only `api.js` needs modifications.
- **Dynamic Site Config & Design System**: Every color, font, button effect, and spacing scale is derived from CSS custom properties and can be customized live through the Theme Playground and Website Control Center.
- **Indian Locale Defaults**: Built-in support for INR (`₹`) with Indian digit grouping (e.g. 1,00,000), Asia/Kolkata timezone, and translations in English, Hindi (हिन्दी), and Tamil (தமிழ்).

## 📂 Project Structure

```
d:/HRMS Tool/
├── app/
│   └── index.html               # HRMS SPA HTML shell with CSP and font loader
├── assets/
│   ├── css/
│   │   ├── app.css              # Main layered stylesheet bundle
│   │   ├── layers.css           # Cascade layers declaration (reset, tokens, base, layout...)
│   │   ├── tokens.css           # Design tokens and semantic status variables
│   │   ├── components/          # Button, display, feedback, forms, overlay, nav, data, pages
│   │   └── themes/              # Light, Dark, High-Contrast elevation and surface tokens
│   ├── images/                  # SVG brand assets and PWA icons
│   └── js/
│       ├── app.js               # Application bootstrap
│       ├── core/                # Theme engine, config store, router, motion, i18n, permissions
│       ├── components/          # Custom element library (eh-*)
│       ├── shell/               # Sidebar, topbar, bottom nav, command palette, notifications
│       ├── services/            # Mock DB (IndexedDB), API layer, stats queries, seed generators
│       └── modules/             # 30 HRMS modules + registry
├── data/
│   ├── default-site-config.json # Factory defaults for themes, branding, buttons and modules
│   └── i18n/                    # en.json, hi.json, ta.json translation dictionaries
├── index.html                   # Root launchpad and entry point
├── manifest.webmanifest         # PWA configuration
└── README.md
```

## 🛠️ Running Locally

Because the project uses standard ES modules and workers, it should be served over HTTP:

```bash
# Using npx serve
npx serve d:/HRMS Tool

# Or using Python 3
python -m http.server 3000 --directory "d:/HRMS Tool"
```

Then open `http://localhost:3000/app/#/home` in your browser.

## 👤 Demo Login Personas

All demo personas share the password: **`Demo@123`**

| Role | Email | Scope |
|------|-------|-------|
| **Super Admin** | `superadmin@ellowring.in` | Global across all companies and branches |
| **HR Admin** | `hr@ellowring.in` | Company-wide HR and personnel management |
| **Branch HR** | `branchhr@ellowring.in` | Branch-specific personnel and attendance |
| **Payroll Admin** | `payroll@ellowring.in` | Salaries, compliance, TDS and registers |
| **Recruiter** | `recruiter@ellowring.in` | ATS pipelines and onboarding |
| **Manager** | `manager@ellowring.in` | Team attendance, leaves and approvals |
| **Employee** | `employee@ellowring.in` | Self-service, punches and payslips |
| **Site Admin** | `siteadmin@ellowring.in` | Website Control Center and theme tokens |

## 🧪 Developer Shortcuts

- **Command Palette**: Press `Ctrl + K` (or `Cmd + K` on Mac) anywhere to search pages, employees, and run actions.
- **Component Library**: Navigate to `#/dev/components` to view all UI components in light and dark mode.
- **Theme Playground**: Navigate to `#/dev/playground` to customize brand colors, density, and API latency.
