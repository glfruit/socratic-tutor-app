import type { PropsWithChildren } from "react";
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
          <Button variant="ghost" onClick={onLogout}>
            退出登录
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
