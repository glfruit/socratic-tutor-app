import { type PropsWithChildren, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/common/Button";

interface AppLayoutProps {
  onLogout: () => void;
}

const navItems = [
  { to: "/home", label: "主页" },
  { to: "/subjects", label: "学科" },
  { to: "/plans", label: "计划" },
  { to: "/library", label: "文档库" },
  { to: "/upload", label: "上传" },
  { to: "/sessions", label: "会话" },
  { to: "/progress", label: "进度" },
  { to: "/settings", label: "设置" }
];

export function AppLayout({ onLogout, children }: PropsWithChildren<AppLayoutProps>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/home" className="text-lg font-semibold text-primary">
            Socratic Tutor
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-primary" : "text-slate-600 dark:text-slate-300"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onLogout} className="hidden sm:inline-flex">
              退出登录
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
              aria-label="菜单"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="mt-1 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              退出登录
            </button>
          </nav>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
