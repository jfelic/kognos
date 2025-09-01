import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@frontegg/nextjs/pages';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req);
  
  if (!session || !session.user.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const userId = session.user.sub;

  switch (method) {
    case 'GET':
      try {
        let user = await prisma.user.findUnique({
          where: { fronteggId: userId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              fronteggId: userId,
              email: session.user.email || '',
              name: session.user.name || null,
            },
          });
        }

        const knowledgeBases = await prisma.knowledgeBase.findMany({
          where: { userId: user.id },
          include: {
            documents: true,
            _count: {
              select: { documents: true }
            }
          },
          orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json(knowledgeBases);
      } catch (error) {
        console.error('Error fetching knowledge bases:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: 'Name is required' });
        }

        let user = await prisma.user.findUnique({
          where: { fronteggId: userId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              fronteggId: userId,
              email: session.user.email || '',
              name: session.user.name || null,
            },
          });
        }

        const knowledgeBase = await prisma.knowledgeBase.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            userId: user.id,
          },
          include: {
            _count: {
              select: { documents: true }
            }
          }
        });

        res.status(201).json(knowledgeBase);
      } catch (error) {
        console.error('Error creating knowledge base:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

