import type { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/common/Button";

interface AppLayoutProps {
  onLogout: () => void;
}

const navItems = [
  { to: "/dashboard", label: "仪表盘" },
  { to: "/subjects", label: "学科" },
  { to: "/sessions", label: "会话" },
  { to: "/progress", label: "进度" }
];

export function AppLayout({ onLogout, children }: PropsWithChildren<AppLayoutProps>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-lg font-semibold text-primary">
            Socratic Tutor
          </Link>
          <nav className="hidden gap-4 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-primary" : "text-slate-600"}`
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
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
