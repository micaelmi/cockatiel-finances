import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@clerk/backend';
import { env } from './env';

// Augment Fastify's request type so `request.userId` is available everywhere
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

/**
 * Fastify plugin that verifies the Clerk JWT from the Authorization header
 * and attaches `request.userId` to every request in the registered scope.
 *
 * Usage: register this plugin on any Fastify instance that should be protected.
 * Routes outside this scope (e.g. webhooks, health) are unaffected.
 */
export const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest('userId', '');

  app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });
      request.userId = payload.sub;
    } catch (error) {
      return reply.status(401).send({ message: 'Invalid or expired token' });
    }
  });
});
