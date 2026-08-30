import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

/**
 * Wraps every authenticated route. The Topbar title is static for this
 * foundation phase ("MediCore AI"); per-page dynamic titles are a natural
 * refinement once Phase 17+ builds real page content.
 */
export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-light dark:bg-surface-dark">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title="MediCore AI" />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
