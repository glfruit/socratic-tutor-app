import { SessionStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { SessionService } from '../../src/services/sessionService';
import { createPrismaMock } from '../mocks/factories';

describe('SessionService', () => {
  it('creates session', async () => {
    const prisma = createPrismaMock();
    prisma.session.create.mockResolvedValue({ id: 's1' });
    const service = new SessionService(prisma as any);

    const session = await service.createSession('u1', { subject: 'math', title: 'x', topic: 'a' });
    expect(session.id).toBe('s1');
  });

  it('throws when session not found', async () => {
    const prisma = createPrismaMock();
    prisma.session.findFirst.mockResolvedValue(null);
    const service = new SessionService(prisma as any);

    await expect(service.getSession('u1', 's1')).rejects.toThrow('Session not found');
  });

  it('updates session after ownership check', async () => {
    const prisma = createPrismaMock();
    prisma.session.updateMany.mockResolvedValue({ count: 1 });
    prisma.session.findFirst.mockResolvedValue({ id: 's1', status: SessionStatus.PAUSED });
    const service = new SessionService(prisma as any);

    const session = await service.updateSession('u1', 's1', { status: SessionStatus.PAUSED });
    expect(session.status).toBe(SessionStatus.PAUSED);
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { id: 's1', userId: 'u1' },
      data: { status: SessionStatus.PAUSED }
    });
  });

  it('deletes session and messages in transaction', async () => {
    const prisma = createPrismaMock();
    prisma.session.findFirst.mockResolvedValue({ id: 's1' });
    prisma.message.deleteMany.mockResolvedValue({ count: 2 });
    prisma.session.delete.mockResolvedValue({ id: 's1' });
    prisma.$transaction.mockResolvedValue([]);

    const service = new SessionService(prisma as any);

    await service.deleteSession('u1', 's1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
