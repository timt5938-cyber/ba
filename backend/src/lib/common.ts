import { FastifyRequest } from 'fastify';

export const getUserId = (request: FastifyRequest): string => {
  const userId = String((request.user as any)?.sub || '');
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
};

export const parsePeriodDays = (period: string | undefined): number => {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  if (period === '3m') return 90;
  if (period === 'all') return 3650;
  return 30;
};
