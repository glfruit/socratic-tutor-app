import { describe, expect, it } from 'vitest';
import { ParsingService } from '../../src/services/parsingService';

describe('ParsingService', () => {
  it('parses plain text files into a single chapter', async () => {
    const service = new ParsingService({
      readFile: async () => 'Chapter 1\nSocratic dialogue starts here.'
    });

    const parsed = await service.parseFile('/tmp/book.txt', 'book.txt');

    expect(parsed.title).toBe('book');
    expect(parsed.chapters).toHaveLength(1);
    expect(parsed.chapters[0]?.content).toContain('Socratic dialogue');
  });

  it('chunks content into bounded sections with overlap', () => {
    const service = new ParsingService();
    const chunks = service.chunkText('abcdefghij', { chunkSize: 4, overlap: 1 });

    expect(chunks.map((chunk) => chunk.content)).toEqual(['abcd', 'defg', 'ghij']);
    expect(chunks[1]?.orderIndex).toBe(1);
  });

  it('rejects unsupported file extensions', async () => {
    const service = new ParsingService();

    await expect(service.parseFile('/tmp/book.md', 'book.md')).rejects.toThrow(
      'Unsupported file type'
    );
  });

  it('parses pdf, docx, and epub content through injected adapters', async () => {
    const service = new ParsingService({
      readBuffer: async () => Buffer.from('pdf'),
      pdfParse: async () => ({ text: 'PDF body' }),
      extractDocxText: async () => 'DOCX body',
      parseEpub: async () => [
        { title: 'Chapter 1', content: 'EPUB body', orderIndex: 0 }
      ]
    });

    const pdf = await service.parseFile('/tmp/book.pdf', 'book.pdf');
    const docx = await service.parseFile('/tmp/book.docx', 'book.docx');
    const epub = await service.parseFile('/tmp/book.epub', 'book.epub');

    expect(pdf.chapters[0]?.content).toBe('PDF body');
    expect(docx.chapters[0]?.content).toBe('DOCX body');
    expect(epub.chapters[0]?.title).toBe('Chapter 1');
  });
});
