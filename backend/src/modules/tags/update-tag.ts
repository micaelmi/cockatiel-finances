import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function updateTag(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/tags/:id', {
    schema: {
      tags: ['tags'],
      summary: 'Update a tag',
      params: z.object({
        id: z.uuid(),
      }),
      body: z.object({
        name: z.string(),
      }),
      response: {
        200: z.object({
          id: z.uuid(),
          name: z.string(),
          userId: z.string(),
          createdAt: z.date(),
        }),
        404: z.object({ message: z.string() }),
      },
    },
  }, async (request, reply) => {
    const userId = request.userId;
    const { id } = request.params;
    const { name } = request.body;

    const existing = await prisma.tag.findUnique({ where: { id, userId } });
    if (!existing) {
      return reply.status(404).send({ message: 'Tag not found' });
    }

    const tag = await prisma.tag.update({
      where: { id, userId },
      data: { name },
    });

    return tag;
  });
}
