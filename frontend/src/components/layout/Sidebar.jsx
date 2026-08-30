import { NavLink } from 'react-router-dom';
import { Activity, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { useUiStore } from '../../store/uiStore.js';
import { ROLE_NAV } from '../../routes/roleNav.js';

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const items = ROLE_NAV[user?.role] || [];

  return (
    <aside
      className={`flex h-screen flex-col border-r border-clinical-100 bg-white transition-all dark:border-clinical-800 dark:bg-clinical-900 ${
        sidebarCollapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-2.5 border-b border-clinical-100 px-4 py-5 dark:border-clinical-800">
        <Activity className="h-6 w-6 shrink-0 text-clinical-600 dark:text-clinical-300" />
        {!sidebarCollapsed && (
          <span className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">
            MediCore <span className="text-pulse-400">AI</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-clinical-50 text-clinical-700 dark:bg-clinical-800 dark:text-clinical-100'
                  : 'text-ink-light/70 hover:bg-clinical-50 hover:text-clinical-700 dark:text-ink-dark/70 dark:hover:bg-clinical-800'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center gap-2 border-t border-clinical-100 px-4 py-3 text-xs text-ink-light/60 hover:text-clinical-600 dark:border-clinical-800 dark:text-ink-dark/60"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronsRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronsLeft className="h-4 w-4" /> Collapse
          </>
        )}
      </button>
    </aside>
  );
}
