import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../utils/appError';

export interface ParsedChapter {
  title: string;
  content: string;
  orderIndex: number;
  startPage?: number;
  endPage?: number;
}

export interface ParsedDocument {
  title: string;
  chapters: ParsedChapter[];
}

interface ParsingDependencies {
  readFile?: (filePath: string, encoding: BufferEncoding) => Promise<string>;
  readBuffer?: (filePath: string) => Promise<Buffer>;
  pdfParse?: (buffer: Buffer) => Promise<{ text: string }>;
  extractDocxText?: (filePath: string) => Promise<string>;
  parseEpub?: (filePath: string) => Promise<ParsedChapter[]>;
}

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export class ParsingService {
  constructor(private readonly deps: ParsingDependencies = {}) {}

  async parseFile(filePath: string, originalName: string): Promise<ParsedDocument> {
    const extension = path.extname(originalName).toLowerCase();

    switch (extension) {
      case '.txt':
        return this.parseTxt(filePath, originalName);
      case '.pdf':
        return this.parsePdf(filePath, originalName);
      case '.docx':
        return this.parseDocx(filePath, originalName);
      case '.epub':
        return this.parseEpub(filePath, originalName);
      default:
        throw new AppError('Unsupported file type', 400);
    }
  }

  chunkText(content: string, options: ChunkOptions = {}) {
    const chunkSize = options.chunkSize ?? 1000;
    const overlap = options.overlap ?? 120;
    const chunks: Array<{ content: string; orderIndex: number; tokenCount: number }> = [];

    let start = 0;
    let orderIndex = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const slice = content.slice(start, end).trim();
      if (slice) {
        chunks.push({
          content: slice,
          orderIndex,
          tokenCount: Math.ceil(slice.length / 4)
        });
        orderIndex += 1;
      }

      if (end >= content.length) {
        break;
      }

      start = Math.max(0, end - overlap);
    }

    return chunks;
  }

  private async parseTxt(filePath: string, originalName: string): Promise<ParsedDocument> {
    const fileReader = this.deps.readFile ?? readFile;
    const content = await fileReader(filePath, 'utf8');
    return {
      title: path.basename(originalName, path.extname(originalName)),
      chapters: [
        {
          title: 'Content',
          content,
          orderIndex: 0
        }
      ]
    };
  }

  private async parsePdf(filePath: string, originalName: string): Promise<ParsedDocument> {
    const pdfParse =
      this.deps.pdfParse ??
      (require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>);
    const bufferReader = this.deps.readBuffer ?? readFile;
    const buffer = await bufferReader(filePath);
    const parsed = await pdfParse(buffer);

    return {
      title: path.basename(originalName, path.extname(originalName)),
      chapters: [
        {
          title: 'PDF Content',
          content: parsed.text,
          orderIndex: 0
        }
      ]
    };
  }

  private async parseDocx(filePath: string, originalName: string): Promise<ParsedDocument> {
    const content = this.deps.extractDocxText
      ? await this.deps.extractDocxText(filePath)
      : await (async () => {
          const mammoth = require('mammoth') as {
            extractRawText: (input: { path: string }) => Promise<{ value: string }>;
          };
          const parsed = await mammoth.extractRawText({ path: filePath });
          return parsed.value;
        })();

    return {
      title: path.basename(originalName, path.extname(originalName)),
      chapters: [
        {
          title: 'DOCX Content',
          content,
          orderIndex: 0
        }
      ]
    };
  }

  private async parseEpub(filePath: string, originalName: string): Promise<ParsedDocument> {
    const chapters = this.deps.parseEpub
      ? await this.deps.parseEpub(filePath)
      : await (async () => {
          const { EPUB } = require('epub2') as { EPUB: new (filePath: string) => any };

          return new Promise<ParsedChapter[]>((resolve, reject) => {
            const epub = new EPUB(filePath);
            epub.on('error', reject);
            epub.on('end', async () => {
              try {
                const chapterList = Array.isArray(epub.flow) ? epub.flow : [];
                const results: ParsedChapter[] = [];

                for (let index = 0; index < chapterList.length; index += 1) {
                  const chapter = chapterList[index];
                  const content = await new Promise<string>((resolveChapter, rejectChapter) => {
                    epub.getChapter(chapter.id, (error: Error | null, text: string) => {
                      if (error) {
                        rejectChapter(error);
                        return;
                      }
                      resolveChapter(text.replace(/<[^>]+>/g, ' '));
                    });
                  });

                  results.push({
                    title: chapter.title ?? `Chapter ${index + 1}`,
                    content,
                    orderIndex: index
                  });
                }

                resolve(results);
              } catch (error) {
                reject(error);
              }
            });
            epub.parse();
          });
        })();

    return {
      title: path.basename(originalName, path.extname(originalName)),
      chapters:
        chapters.length > 0
          ? chapters
          : [
              {
                title: 'EPUB Content',
                content: '',
                orderIndex: 0
              }
            ]
    };
  }
}
