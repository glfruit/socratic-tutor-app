import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

interface FormState {
  email: string;
  password: string;
}

const initialState: FormState = { email: "", password: "" };

export function LoginPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const validate = () => {
    if (!form.email.includes("@")) {
      return "请输入有效邮箱";
    }
    if (form.password.length < 8) {
      return "密码至少8位";
    }
    return "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await authService.login(form);
      login(result);
      navigate(from, { replace: true });
    } catch {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900">欢迎回来</h1>
        <p className="mt-1 text-sm text-slate-500">登录后继续你的苏格拉底学习之旅</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <Input
            label="邮箱"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="name@example.com"
          />
          <Input
            label="密码"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            helperText="不少于8位"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" type="submit" isLoading={loading}>
            登录
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          没有账号？
          <Link to="/auth/register" className="ml-1 font-medium text-primary">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
