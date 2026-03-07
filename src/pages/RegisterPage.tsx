import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";

interface RegisterState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const initialState: RegisterState = {
  name: "",
  email: "",
  password: "",
  role: "STUDENT"
};

export function RegisterPage() {
  const [form, setForm] = useState<RegisterState>(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      setError("姓名至少2个字符");
      return;
    }
    if (!form.email.includes("@")) {
      setError("请输入有效邮箱");
      return;
    }
    if (form.password.length < 8) {
      setError("密码至少8位");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await authService.register(form);
      login(result);
      navigate("/home", { replace: true });
    } catch {
      setError("注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-slate-900">创建账号</h1>
        <p className="mt-1 text-sm text-slate-500">选择身份并开始思考式学习</p>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <Input
            label="姓名"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="邮箱"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Input
            label="密码"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-semibold text-slate-700">
              角色
            </label>
            <select
              id="role"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="STUDENT">学生</option>
              <option value="TEACHER">教师</option>
              <option value="ADMIN">管理员</option>
            </select>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" type="submit" isLoading={loading}>
            注册
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          已有账号？
          <Link to="/auth/login" className="ml-1 font-medium text-primary">
            去登录
          </Link>
        </p>
      </div>
    </div>
  );
}
