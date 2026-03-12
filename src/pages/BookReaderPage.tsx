import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AIChatPanel } from "@/components/reader/AIChatPanel";
import { ChapterSidebar } from "@/components/reader/ChapterSidebar";
import { ProgressBar } from "@/components/reader/ProgressBar";
import { ReadingArea } from "@/components/reader/ReadingArea";
import { useReadingStore } from "@/stores/useReadingStore";

export function BookReaderPage() {
  const { documentId = "" } = useParams();
  const { document, session, currentChapter, messages, selectedText, initializeReader, selectChapter, updateChapterCompletion, setSelectedText, sendMessage, isStreaming, isLoading, progressState, error } =
    useReadingStore((state) => ({
      document: state.document,
      session: state.session,
      currentChapter: state.currentChapter,
      messages: state.messages,
      selectedText: state.selectedText,
      initializeReader: state.initializeReader,
      selectChapter: state.selectChapter,
      updateChapterCompletion: state.updateChapterCompletion,
      setSelectedText: state.setSelectedText,
      sendMessage: state.sendMessage,
      isStreaming: state.isStreaming,
      isLoading: state.isLoading,
      progressState: state.progressState,
      error: state.error
    }));

  useEffect(() => {
    if (documentId) {
      void initializeReader(documentId);
    }
  }, [documentId, initializeReader]);

  return (
    <div className="space-y-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <section className="relative overflow-hidden rounded-[34px] border border-[#d8d2c4] bg-[linear-gradient(135deg,#efe5d5_0%,#f8f3ea_36%,#dbe6ef_100%)] px-5 py-6 shadow-[0_24px_60px_rgba(44,52,67,0.10)] sm:px-7 lg:px-8 lg:py-7">
        <div className="absolute right-[-3rem] top-[-2rem] h-28 w-28 rounded-full border border-white/55 sm:h-36 sm:w-36" />
        <div className="absolute bottom-[-4rem] left-[12%] h-36 w-36 rounded-full border border-[#cfbea2]/45 sm:h-44 sm:w-44" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7b6e59]">Reading Session</p>
            <h1 className="mt-3 max-w-[12ch] font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-stone-950">
              {document?.title ?? "载入阅读内容中"}
            </h1>
            <p className="mt-4 max-w-[62ch] text-sm leading-7 text-stone-700 sm:text-base sm:leading-8">
              把章节、证据与追问放进同一条阅读轨迹。先读，再标记，再围绕文本本身发问，而不是跳出书外找现成答案。
            </p>
          </div>

          <div className="grid gap-3 rounded-[26px] border border-white/70 bg-[#f8f4ec]/85 p-4 backdrop-blur-sm sm:grid-cols-3 lg:min-w-[24rem] lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">章节数</p>
              <p className="mt-2 text-2xl font-semibold text-stone-950">{document?.chapters.length ?? 0}</p>
            </div>
            <div className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">当前章节</p>
              <p className="mt-2 text-base font-semibold text-stone-950">{currentChapter ? currentChapter.orderIndex + 1 : "--"}</p>
            </div>
            <div className="rounded-[20px] border border-white/70 bg-white/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">对话轮次</p>
              <p className="mt-2 text-2xl font-semibold text-stone-950">{messages.length}</p>
            </div>
          </div>
        </div>
      </section>

      <ProgressBar
        chapters={document?.chapters ?? []}
        activeChapterId={currentChapter?.id}
        progress={session?.progress ?? document?.progress ?? 0}
        syncStatus={progressState}
        onSelectChapter={(chapterId) => void selectChapter(chapterId)}
      />

      {error ? (
        <section className="rounded-[24px] border border-[#e4c7c4] bg-[#f9ecea] px-5 py-4 text-sm text-[#8a4942]">
          {error}
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px] xl:items-start">
        <ChapterSidebar
          chapters={document?.chapters ?? []}
          activeChapterId={currentChapter?.id}
          onSelect={(chapterId) => void selectChapter(chapterId)}
        />
        <ReadingArea
          chapter={currentChapter}
          totalChapters={document?.chapters.length ?? 0}
          isLoading={isLoading}
          selectedText={selectedText}
          onSelectText={setSelectedText}
          onReadingProgress={updateChapterCompletion}
          onAskAboutSelection={() =>
            void sendMessage("请围绕这段文字提出一个值得继续追问的问题。", {
              selectedText
            })
          }
        />
        <AIChatPanel
          documentTitle={document?.title}
          currentChapterTitle={currentChapter?.title}
          messages={messages}
          isStreaming={isStreaming}
          onSend={(content) =>
            sendMessage(content, selectedText ? { selectedText } : undefined)
          }
        />
      </div>
    </div>
  );
}
