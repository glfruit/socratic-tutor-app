import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    {
      name: '数学',
      description: '数学思维与问题解决',
      knowledgePoints: ['代数', '几何', '微积分', '概率统计', '数论']
    },
    {
      name: '物理',
      description: '自然现象的物理原理',
      knowledgePoints: ['力学', '电磁学', '热学', '光学', '量子物理']
    },
    {
      name: '化学',
      description: '物质的组成、结构与变化',
      knowledgePoints: ['无机化学', '有机化学', '物理化学', '分析化学']
    },
    {
      name: '生物',
      description: '生命科学基础',
      knowledgePoints: ['细胞生物学', '遗传学', '生态学', '进化论']
    },
    {
      name: '计算机科学',
      description: '计算机基础与编程',
      knowledgePoints: ['数据结构', '算法', '操作系统', '计算机网络', '数据库']
    }
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: {
        name: subject.name,
        description: subject.description,
        knowledgePoints: {
          create: subject.knowledgePoints.map(name => ({ name }))
        }
      }
    });
  }

  console.log('Seeded subjects:', subjects.map(s => s.name).join(', '));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
