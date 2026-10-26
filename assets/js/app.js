/* Purpose: main application bootstrap - initialises storage, config, theme, i18n, session, mounts the shell, starts the router and boots real-time events. */
import { initComponents } from './components/index.js';
import { db } from './services/mock-db.js';
import { configStore } from './core/config-store.js';
import { applyTheme } from './core/theme-engine.js';
import { applyMotion } from './core/motion-engine.js';
import { initI18n } from './core/i18n.js';
import { restoreSession } from './core/auth.js';
import { mountShell } from './shell/shell.js';
import { router } from './core/router.js';
import { startRealtimeSimulator } from './services/realtime-sim.js';

async function bootstrap() {
  try {
    // 1. Initialize component library & delegated behaviours
    initComponents();

    // 2. Initialize database (IndexedDB seeding)
    await db.init();

    // 3. Initialize config store & apply runtime theme
    await configStore.init();
    applyTheme(configStore.config);
    applyMotion(configStore.config);
    configStore.subscribe((cfg) => {
      applyTheme(cfg);
      applyMotion(cfg);
    });

    // 4. Initialize i18n
    await initI18n(configStore.config.locale?.language || 'en');

    // 5. Restore user auth session
    await restoreSession();

    // 6. Mount application shell
    const shell = mountShell(document.body);

    // 7. Start router
    router.start(shell.outlet, shell.announcer);

    // 8. Start background event simulator
    startRealtimeSimulator();

    // 9. Dismiss splash screen
    const splash = document.getElementById('splash');
    if (splash) {
      splash.setAttribute('data-done', '');
      setTimeout(() => splash.remove(), 450);
    }
  } catch (err) {
    console.error('Fatal bootstrap error:', err);
    const splash = document.getElementById('splash');
    if (splash) {
      splash.innerHTML = `<div style="padding:2rem;text-align:center;font-family:system-ui">
        <h2>Initialization Failed</h2>
        <p style="color:#dc2626">${err.message}</p>
        <button onclick="location.reload()" style="margin-top:1rem;padding:0.5rem 1rem">Retry</button>
      </div>`;
    }
  }
}

// Start immediately or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
