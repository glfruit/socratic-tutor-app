import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/services/api";
import { planService } from "@/services/planService";
import type { LearningPlan, LearningPlanStatus } from "@/types";

const statusLabels: Record<LearningPlanStatus, string> = {
  PENDING: "待开始",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消"
};

const statusTone: Record<LearningPlanStatus, string> = {
  PENDING: "bg-[#efe6d4] text-[#6e5a34]",
  IN_PROGRESS: "bg-[#d8e6ea] text-[#1f5566]",
  COMPLETED: "bg-[#dfe8d5] text-[#355238]",
  CANCELLED: "bg-[#e8e1dc] text-[#675f59]"
};

const filterOptions: Array<{ value: "ALL" | LearningPlanStatus; label: string }> = [
  { value: "ALL", label: "全部" },
  { value: "PENDING", label: "待开始" },
  { value: "IN_PROGRESS", label: "进行中" },
  { value: "COMPLETED", label: "已完成" }
];

const formatDate = (value?: string) => {
  if (!value) {
    return "未设期限";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(parsed);
};

export function PlansPage() {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<LearningPlanStatus | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    targetDate: ""
  });

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await planService.list();
      setPlans(data);
      setError(null);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "加载学习计划失败"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const filteredPlans = useMemo(
    () => (filter === "ALL" ? plans : plans.filter((plan) => plan.status === filter)),
    [filter, plans]
  );

  const planStats = useMemo(
    () => ({
      total: plans.length,
      active: plans.filter((plan) => plan.status === "IN_PROGRESS").length,
      completed: plans.filter((plan) => plan.status === "COMPLETED").length
    }),
    [plans]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await planService.create({
        ...formData,
        description: formData.description || undefined,
        targetDate: formData.targetDate || undefined
      });
      setShowForm(false);
      setFormData({ title: "", description: "", subject: "", targetDate: "" });
      setError(null);
      await loadPlans();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "创建学习计划失败"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: LearningPlanStatus) => {
    try {
      await planService.update(id, { status });
      setError(null);
      await loadPlans();
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, "更新学习计划失败"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定删除此学习计划？")) {
      return;
    }

    try {
      await planService.delete(id);
      setError(null);
      await loadPlans();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "删除学习计划失败"));
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[40px] border border-[#d8d0c2] bg-[linear-gradient(135deg,#f4edde_0%,#f9f4ea_45%,#dde7ea_100%)] px-6 py-7 shadow-[0_24px_60px_rgba(54,66,84,0.10)] sm:px-8">
        <div className="absolute right-[-2rem] top-[-2rem] h-24 w-24 rounded-full border border-white/60" />
        <div className="absolute bottom-[-3rem] left-[12%] h-32 w-32 rounded-full border border-[#d9c9ad]/50" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6e59]">Learning Plans</p>
            <h1 className="mt-4 max-w-[12ch] text-[clamp(2.3rem,4.8vw,4.4rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-stone-900">
              把学习目标写成一条可推进的路径。
            </h1>
            <p className="mt-4 max-w-[56ch] text-sm leading-7 text-stone-700">
              这里管理的是学习节奏，而不是待办清单。为每个主题设定目标、期限和状态，再把它带回具体会话里推进。
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/70 bg-[#faf6ef]/85 p-5">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7b66]">Total</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-900">{planStats.total}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7b66]">Active</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-900">{planStats.active}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7b66]">Done</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-900">{planStats.completed}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="mt-2 inline-flex w-fit items-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-[#f7f1e8] transition hover:bg-stone-800"
            >
              {showForm ? "收起新计划" : "新建学习计划"}
            </button>
          </div>
        </div>
      </section>

      {showForm ? (
        <section className="rounded-[32px] border border-[#ddd5c7] bg-[#fbf8f2] p-5 shadow-[0_18px_40px_rgba(69,80,96,0.08)] sm:p-6">
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm text-stone-700">
              <span className="font-medium text-stone-900">计划标题</span>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                className="rounded-2xl border border-[#d7cdbf] bg-[#fffdf8] px-4 py-3 text-stone-900 outline-none transition focus:border-[#8f7a57]"
                placeholder="例如：两周内补齐牛顿力学基础"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              <span className="font-medium text-stone-900">学科</span>
              <input
                type="text"
                value={formData.subject}
                onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                className="rounded-2xl border border-[#d7cdbf] bg-[#fffdf8] px-4 py-3 text-stone-900 outline-none transition focus:border-[#8f7a57]"
                placeholder="数学、物理、英语"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              <span className="font-medium text-stone-900">目标日期</span>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(event) => setFormData({ ...formData, targetDate: event.target.value })}
                className="rounded-2xl border border-[#d7cdbf] bg-[#fffdf8] px-4 py-3 text-stone-900 outline-none transition focus:border-[#8f7a57]"
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-700 lg:col-span-2">
              <span className="font-medium text-stone-900">描述</span>
              <textarea
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                className="min-h-28 rounded-2xl border border-[#d7cdbf] bg-[#fffdf8] px-4 py-3 text-stone-900 outline-none transition focus:border-[#8f7a57]"
                placeholder="写下这次学习想补齐的能力、材料范围或验收标准。"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-fit items-center rounded-full bg-[#2f4f63] px-5 py-2.5 text-sm font-medium text-[#f5f1ea] transition hover:bg-[#274252] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "保存中..." : "保存计划"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === option.value
                ? "bg-stone-900 text-[#f7f1e8]"
                : "bg-[#efe8db] text-stone-700 hover:bg-[#e6ddcf]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </section>

      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

      {loading ? (
        <div className="rounded-[28px] border border-[#ddd5c7] bg-[#fbf8f2] px-5 py-10 text-center text-sm text-stone-600">
          正在加载学习计划...
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#d7cdbf] bg-[#fcfaf6] px-5 py-12 text-center text-sm leading-7 text-stone-600">
          还没有匹配的学习计划。先写下一个目标，再把它推进成一次具体的学习会话。
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredPlans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-[28px] border border-[#ddd5c7] bg-[#fcfaf6] p-5 shadow-[0_16px_36px_rgba(73,84,101,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">{plan.subject}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-900">{plan.title}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[plan.status]}`}>
                  {statusLabels[plan.status]}
                </span>
              </div>

              <p className="mt-4 text-sm text-stone-600">目标日期 · {formatDate(plan.targetDate)}</p>
              <p className="mt-3 min-h-12 text-sm leading-7 text-stone-700">
                {plan.description || "还没有补充说明，可以在学习会话中逐步补全目标边界和完成标准。"}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {plan.status === "PENDING" ? (
                  <button
                    type="button"
                    onClick={() => void handleStatusChange(plan.id, "IN_PROGRESS")}
                    className="rounded-full bg-[#2f4f63] px-4 py-2 text-sm font-medium text-[#f5f1ea] transition hover:bg-[#274252]"
                  >
                    开始推进
                  </button>
                ) : null}
                {plan.status === "IN_PROGRESS" ? (
                  <button
                    type="button"
                    onClick={() => void handleStatusChange(plan.id, "COMPLETED")}
                    className="rounded-full bg-[#566f3d] px-4 py-2 text-sm font-medium text-[#f4f0e8] transition hover:bg-[#4a6134]"
                  >
                    标记完成
                  </button>
                ) : null}
                {plan.status === "COMPLETED" ? (
                  <button
                    type="button"
                    onClick={() => void handleStatusChange(plan.id, "IN_PROGRESS")}
                    className="rounded-full bg-[#efe8db] px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-[#e6ddcf]"
                  >
                    重新打开
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleDelete(plan.id)}
                  className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
