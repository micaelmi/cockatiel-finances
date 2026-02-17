import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';

export async function listTags(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/tags', {
    schema: {
      tags: ['tags'],
      summary: 'List all tags for a user',
      response: {
        200: z.array(z.object({
          id: z.uuid(),
          name: z.string(),
          userId: z.string(),
          createdAt: z.coerce.date(),
        })),
      },
    },
  }, async (request) => {
    const userId = request.userId;

    const tags = await prisma.tag.findMany({
      where: { userId },
    });

    return tags;
  });
}
