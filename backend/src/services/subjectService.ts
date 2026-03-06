import { PrismaLike } from '../config/prisma';

export class SubjectService {
  constructor(private readonly prisma: PrismaLike) {}

  async listSubjects() {
    return this.prisma.subject.findMany({
      include: {
        knowledgePoints: true
      },
      orderBy: { name: 'asc' }
    });
  }
}
