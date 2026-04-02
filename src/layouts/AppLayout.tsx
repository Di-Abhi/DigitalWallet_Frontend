import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Send, Gift, Receipt, User,
  Sun, Moon, Bell, LogOut, Menu, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { useNotifications } from '../store/NotificationContext';
import { authApi } from '../core/api/services';
import { toast } from '../shared/components/Toast';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const userNav: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/transfer', icon: Send, label: 'Send / Transfer' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/profile', icon: User, label: 'Profile / KYC' },
];

const adminNav: NavItem[] = [
  { to: '/admin', icon: Shield, label: 'Admin Panel' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggle } = useTheme();
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (refreshToken) await authApi.logout({ refreshToken });
    } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const navLinks = [...userNav, ...(isAdmin ? adminNav : [])];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base leading-none">PayVault</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Digital Wallet</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100" />
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{user?.fullName}</div>
            <div className="text-xs text-[var(--text-muted)] truncate">{user?.role}</div>
          </div>
        </div>
        <button className="nav-link w-full text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-60 flex-col bg-[var(--bg-card)] border-r border-[var(--border)] shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-[var(--bg-card)] border-r border-[var(--border)] z-50 animate-slide-out">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center gap-3 px-4 shrink-0">
          <button className="btn-ghost p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button className="btn-ghost p-2 rounded-xl" onClick={toggle} title="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button className="btn-ghost p-2 rounded-xl relative" onClick={() => setNotifOpen((v) => !v)}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="notif-dot" />
                  <span className="notif-dot-static" />
                </>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 card shadow-2xl z-50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <span className="font-semibold text-sm">
                    Notifications {unreadCount > 0 && <span className="badge-red ml-1.5">{unreadCount}</span>}
                  </span>
                  <button className="text-xs text-cyan-500 hover:underline" onClick={markAllRead}>Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[var(--text-muted)]">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-[var(--border)] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-cyan-50/50 dark:bg-cyan-950/20' : ''}`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs">{n.title}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">{new Date(n.time).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
