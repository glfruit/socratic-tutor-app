import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AIChatPanel } from "@/components/reader/AIChatPanel";
import { ChapterSidebar } from "@/components/reader/ChapterSidebar";
import { ReadingArea } from "@/components/reader/ReadingArea";
import { useReadingStore } from "@/stores/useReadingStore";

export function BookReaderPage() {
  const { documentId = "" } = useParams();
  const { document, currentChapter, messages, selectedText, initializeReader, selectChapter, setSelectedText, sendMessage, isStreaming } =
    useReadingStore((state) => ({
      document: state.document,
      currentChapter: state.currentChapter,
      messages: state.messages,
      selectedText: state.selectedText,
      initializeReader: state.initializeReader,
      selectChapter: state.selectChapter,
      setSelectedText: state.setSelectedText,
      sendMessage: state.sendMessage,
      isStreaming: state.isStreaming
    }));

  useEffect(() => {
    if (documentId) {
      void initializeReader(documentId);
    }
  }, [documentId, initializeReader]);

  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <ChapterSidebar
        chapters={document?.chapters ?? []}
        activeChapterId={currentChapter?.id}
        onSelect={selectChapter}
      />
      <ReadingArea
        chapter={currentChapter}
        selectedText={selectedText}
        onSelectText={setSelectedText}
        onAskAboutSelection={() =>
          void sendMessage("请围绕这段文字提出一个值得继续追问的问题。", {
            selectedText
          })
        }
      />
      <AIChatPanel
        messages={messages}
        isStreaming={isStreaming}
        onSend={(content) =>
          sendMessage(content, selectedText ? { selectedText } : undefined)
        }
      />
    </div>
  );
}
