declare module "react-markdown" {
  import type { ComponentType, ReactNode } from "react";

  const ReactMarkdown: ComponentType<{
    children?: string;
    components?: Record<string, ComponentType<any> | ((props: any) => ReactNode)>;
  }>;

  export default ReactMarkdown;
}

declare module "katex" {
  const katex: {
    renderToString(
      expression: string,
      options?: {
        displayMode?: boolean;
        throwOnError?: boolean;
        strict?: "ignore" | string | boolean;
      }
    ): string;
  };

  export default katex;
}

declare module "@tiptap/react" {
  import type { JSX } from "react";

  export interface JSONContent {
    type?: string;
    text?: string;
    attrs?: Record<string, unknown>;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    content?: JSONContent[];
  }

  export interface Editor {
    getHTML(): string;
    getJSON(): JSONContent;
    setEditable(editable: boolean): void;
    isActive(name: string): boolean;
    chain(): {
      focus(): any;
      toggleBold(): any;
      toggleItalic(): any;
      toggleBulletList(): any;
      toggleOrderedList(): any;
      insertInlineMath(args: { latex: string }): any;
      insertBlockMath(args: { latex: string }): any;
      insertContent(value: string): any;
      run(): boolean;
    };
    commands: {
      setContent(content: string, emitUpdate?: boolean): void;
    };
  }

  export function useEditor(options: Record<string, unknown>): Editor | null;
  export const EditorContent: (props: { editor: Editor | null }) => JSX.Element;
}

declare module "@tiptap/starter-kit" {
  const StarterKit: {
    configure(options?: Record<string, unknown>): unknown;
  };

  export default StarterKit;
}

declare module "@tiptap/extension-placeholder" {
  export const Placeholder: {
    configure(options?: Record<string, unknown>): unknown;
  };
}

declare module "@tiptap/extension-mathematics" {
  export const Mathematics: {
    configure(options?: Record<string, unknown>): unknown;
  };
}

declare module "katex/dist/katex.min.css";
