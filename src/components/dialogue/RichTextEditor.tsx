import { useEffect, useRef } from "react";
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Mathematics } from "@tiptap/extension-mathematics";

interface RichTextEditorProps {
  valueHtml: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (payload: { markdown: string; html: string; textLength: number }) => void;
  onSubmit: () => void;
}

type EditorUpdatePayload = {
  editor: {
    getJSON(): JSONContent;
    getHTML(): string;
  };
};

type EditorKeyboardEvent = KeyboardEvent;

const SPECIAL_CHARACTERS = [
  { label: "α", value: "α" },
  { label: "β", value: "β" },
  { label: "γ", value: "γ" },
  { label: "Δ", value: "Δ" },
  { label: "λ", value: "λ" },
  { label: "μ", value: "μ" },
  { label: "π", value: "π" },
  { label: "∞", value: "∞" },
  { label: "≈", value: "≈" },
  { label: "≠", value: "≠" },
  { label: "≤", value: "≤" },
  { label: "≥", value: "≥" },
  { label: "→", value: "→" },
  { label: "°", value: "°" }
];

function normalizeHtml(html: string) {
  const trimmed = html.trim();
  return trimmed === "<p></p>" ? "" : trimmed;
}

function escapeMarkdownText(value: string) {
  return value.replace(/([\\`*_{}\[\]()#+\-.!|>])/g, "\\$1");
}

function renderTextNode(node: JSONContent) {
  const rawText = node.text ?? "";
  const marks = node.marks ?? [];

  const codeMark = marks.find((mark) => mark.type === "code");
  if (codeMark) {
    return `\`${rawText.replace(/`/g, "\\`")}\``;
  }

  let result = escapeMarkdownText(rawText);
  for (const mark of marks) {
    if (mark.type === "bold") {
      result = `**${result}**`;
    }
    if (mark.type === "italic") {
      result = `*${result}*`;
    }
    if (mark.type === "strike") {
      result = `~~${result}~~`;
    }
  }

  return result;
}

function renderInline(nodes: JSONContent[] = []) {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return renderTextNode(node);
      }
      if (node.type === "hardBreak") {
        return "  \n";
      }
      if (node.type === "inlineMath") {
        return `$${String(node.attrs?.latex ?? "")}$`;
      }
      return renderBlock(node).trim();
    })
    .join("");
}

function indentLines(value: string, spaces: number) {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => (line ? `${prefix}${line}` : line))
    .join("\n");
}

function renderList(items: JSONContent[] = [], ordered: boolean, start = 1) {
  return (
    items
      .map((item, index) => renderListItem(item, ordered ? `${start + index}. ` : "- "))
      .join("\n")
      .trimEnd() + "\n\n"
  );
}

function renderListItem(node: JSONContent, prefix: string) {
  const children = node.content ?? [];
  const segments: string[] = [];

  for (const child of children) {
    if (child.type === "paragraph") {
      const text = renderInline(child.content ?? []).trim();
      if (text) {
        segments.push(text);
      }
      continue;
    }

    if (child.type === "bulletList") {
      segments.push(`\n${indentLines(renderList(child.content, false).trimEnd(), 2)}`);
      continue;
    }

    if (child.type === "orderedList") {
      segments.push(`\n${indentLines(renderList(child.content, true, Number(child.attrs?.start ?? 1)).trimEnd(), 2)}`);
      continue;
    }

    const block = renderBlock(child).trim();
    if (block) {
      segments.push(block);
    }
  }

  const [first = "", ...rest] = segments;
  const continuation = rest.map((segment) => `\n${indentLines(segment, 2)}`).join("");
  return `${prefix}${first}${continuation}`.trimEnd();
}

function renderBlock(node: JSONContent): string {
  switch (node.type) {
    case "doc":
      return (node.content ?? []).map(renderBlock).join("").replace(/\n{3,}/g, "\n\n").trimEnd();
    case "paragraph": {
      const text = renderInline(node.content ?? []).trim();
      return text ? `${text}\n\n` : "";
    }
    case "heading": {
      const depth = Math.min(Math.max(Number(node.attrs?.level ?? 1), 1), 6);
      const text = renderInline(node.content ?? []).trim();
      return `${"#".repeat(depth)} ${text}\n\n`;
    }
    case "bulletList":
      return renderList(node.content, false);
    case "orderedList":
      return renderList(node.content, true, Number(node.attrs?.start ?? 1));
    case "blockquote": {
      const content = (node.content ?? [])
        .map(renderBlock)
        .join("")
        .trim()
        .split("\n")
        .map((line) => (line ? `> ${line}` : ">"))
        .join("\n");
      return content ? `${content}\n\n` : "";
    }
    case "codeBlock": {
      const language = typeof node.attrs?.language === "string" ? node.attrs.language : "";
      const code = (node.content ?? []).map((child) => child.text ?? "").join("");
      return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
    }
    case "blockMath":
      return `$$\n${String(node.attrs?.latex ?? "")}\n$$\n\n`;
    case "text":
      return renderTextNode(node);
    case "inlineMath":
      return `$${String(node.attrs?.latex ?? "")}$`;
    default:
      return (node.content ?? []).map(renderBlock).join("");
  }
}

function serializeToMarkdown(document: JSONContent) {
  return renderBlock(document).trim();
}

function ToolbarButton({
  label,
  title,
  isActive = false,
  onClick
}: {
  label: string;
  title: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        isActive
          ? "bg-primary text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  valueHtml,
  disabled = false,
  placeholder = "输入你的思考，按 Enter 发送...",
  onChange,
  onSubmit
}: RichTextEditorProps) {
  const skipSyncRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-2xl bg-slate-950 px-4 py-3 text-slate-50"
          }
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
          strict: "ignore"
        }
      })
    ],
    content: valueHtml || "<p></p>",
      editorProps: {
        attributes: {
          class:
            "tiptap-editor min-h-[7rem] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-within:ring-2 focus-within:ring-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
          "aria-label": "消息输入"
        },
        handleKeyDown: (_view: unknown, event: EditorKeyboardEvent) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
            return true;
          }

        return false;
      }
    },
    onUpdate: ({ editor: nextEditor }: EditorUpdatePayload) => {
      if (skipSyncRef.current) {
        skipSyncRef.current = false;
        return;
      }

      const markdown = serializeToMarkdown(nextEditor.getJSON()).trim();
      const html = normalizeHtml(nextEditor.getHTML());
      onChange({
        markdown,
        html,
        textLength: markdown.length
      });
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = normalizeHtml(editor.getHTML());
    if (currentHtml === valueHtml) {
      return;
    }

    skipSyncRef.current = true;
    editor.commands.setContent(valueHtml || "<p></p>", false);
  }, [editor, valueHtml]);

  const insertInlineMath = () => {
    if (!editor || disabled) {
      return;
    }

    const latex = window.prompt("输入行内公式（LaTeX）", "\\frac{a}{b}");
    if (!latex) {
      return;
    }

    editor.chain().focus().insertInlineMath({ latex }).run();
  };

  const insertBlockMath = () => {
    if (!editor || disabled) {
      return;
    }

    const latex = window.prompt("输入块级公式（LaTeX）", "E = mc^2");
    if (!latex) {
      return;
    }

    editor.chain().focus().insertBlockMath({ latex }).run();
  };

  const insertCharacter = (value: string) => {
    if (!editor || disabled) {
      return;
    }

    editor.chain().focus().insertContent(value).run();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <ToolbarButton label="B" title="加粗" isActive={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolbarButton label="I" title="斜体" isActive={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="• 列表" title="无序列表" isActive={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="1. 列表" title="有序列表" isActive={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="fx" title="插入行内公式" onClick={insertInlineMath} />
        <ToolbarButton label="∑" title="插入块级公式" onClick={insertBlockMath} />
      </div>

      <EditorContent editor={editor} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SPECIAL_CHARACTERS.map((character) => (
          <button
            key={character.label}
            type="button"
            onClick={() => insertCharacter(character.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {character.label}
          </button>
        ))}
      </div>
    </div>
  );
}
