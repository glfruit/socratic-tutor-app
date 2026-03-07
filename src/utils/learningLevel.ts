import type { LearningLevel } from "@/types";

export const DEFAULT_LEARNING_LEVEL: LearningLevel = "HIGH_SCHOOL";

export const learningLevelOptions: Array<{
  level: LearningLevel;
  label: string;
  description: string;
}> = [
  { level: "ELEMENTARY", label: "小学", description: "用更具体的问题帮助建立概念和例子。" },
  { level: "MIDDLE_SCHOOL", label: "初中", description: "强调现象解释与关键术语辨析。" },
  { level: "HIGH_SCHOOL", label: "高中", description: "平衡抽象推理、结构分析和迁移。" },
  { level: "UNIVERSITY", label: "大学", description: "追问论证强度、假设边界与方法论。" },
  { level: "GRADUATE", label: "研究生", description: "鼓励批判立场、反例构造和跨文本比较。" }
];

const learningLevelLabels: Record<LearningLevel, string> = learningLevelOptions.reduce(
  (labels, option) => ({ ...labels, [option.level]: option.label }),
  {} as Record<LearningLevel, string>
);

export const getLearningLevelLabel = (level: LearningLevel | string | null | undefined) => {
  if (!level) {
    return learningLevelLabels[DEFAULT_LEARNING_LEVEL];
  }

  return learningLevelLabels[level as LearningLevel] ?? level;
};
