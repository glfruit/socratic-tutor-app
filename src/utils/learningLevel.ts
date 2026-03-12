import type { LearningLevel } from "@/types";

export const DEFAULT_LEARNING_LEVEL: LearningLevel = "HIGH_SCHOOL";

export interface LearningLevelOption {
  level: LearningLevel;
  label: string;
  description: string;
  focus: string;
  guidance: string;
  scenarios: string[];
}

export const learningLevelOptions: LearningLevelOption[] = [
  {
    level: "ELEMENTARY",
    label: "小学",
    description: "用更具体的问题帮助建立概念和例子。",
    focus: "先把概念说清，再谈为什么。",
    guidance: "多用生活化类比、一步一步拆分条件，减少抽象跳跃。",
    scenarios: ["概念启蒙", "基础例题", "词义辨析"]
  },
  {
    level: "MIDDLE_SCHOOL",
    label: "初中",
    description: "强调现象解释与关键术语辨析。",
    focus: "连接现象、规则与基本推理。",
    guidance: "围绕原因、条件和常见误区追问，让学生能说出过程而不只报答案。",
    scenarios: ["过程解释", "公式理解", "常见误区澄清"]
  },
  {
    level: "HIGH_SCHOOL",
    label: "高中",
    description: "平衡抽象推理、结构分析和迁移。",
    focus: "兼顾方法框架与题型迁移。",
    guidance: "在关键节点追问依据、边界条件和解题策略，避免只给标准套路。",
    scenarios: ["题型迁移", "论证结构", "综合训练"]
  },
  {
    level: "UNIVERSITY",
    label: "大学",
    description: "追问论证强度、假设边界与方法论。",
    focus: "从结论退回前提，检查方法是否成立。",
    guidance: "鼓励比较不同理论路径，识别隐含假设，并讨论证据足不足够。",
    scenarios: ["理论比较", "方法选择", "案例分析"]
  },
  {
    level: "GRADUATE",
    label: "研究生",
    description: "鼓励批判立场、反例构造和跨文本比较。",
    focus: "把讨论推进到方法批判与研究判断。",
    guidance: "要求给出反例、限制条件和文献视角，强调立场的可辩护性。",
    scenarios: ["研究设计", "批判阅读", "跨文本比较"]
  }
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

export const getLearningLevelOption = (
  level: LearningLevel | string | null | undefined
): LearningLevelOption => {
  const normalizedLevel = (level as LearningLevel | undefined) ?? DEFAULT_LEARNING_LEVEL;

  return (
    learningLevelOptions.find((option) => option.level === normalizedLevel) ??
    learningLevelOptions.find((option) => option.level === DEFAULT_LEARNING_LEVEL)!
  );
};
