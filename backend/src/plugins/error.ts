import { FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'Unhandled error');
    const err = error as any;
    const statusCode = err?.statusCode && Number(err.statusCode) >= 400
      ? Number(err.statusCode)
      : 500;
    reply.code(statusCode).send({
      error: statusCode === 500 ? 'Internal Server Error' : (err?.message || 'Bad Request'),
    });
  });
}
