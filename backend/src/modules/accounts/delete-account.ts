import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function deleteAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/accounts/:id', {
    schema: {
      tags: ['accounts'],
      summary: 'Delete an account',
      params: z.object({
        id: z.uuid(),
      }),
      response: {
        204: z.null(),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;

    const existing = await prisma.account.findUnique({ where: { id, userId } });
    if (!existing) {
      return reply.status(404).send({ message: 'Account not found' });
    }

    await prisma.account.delete({
      where: { id, userId },
    });

    return reply.status(204).send(null);
  });
}
