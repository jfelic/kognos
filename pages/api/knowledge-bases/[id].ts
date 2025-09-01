import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@frontegg/nextjs/pages';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req);
  
  if (!session || !session.user || !session.user.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const { id } = req.query;
  const userId = session.user.sub;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Knowledge base ID is required' });
  }

  const user = await prisma.user.findUnique({
    where: { fronteggId: userId },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (method) {
    case 'GET':
      try {
        const knowledgeBase = await prisma.knowledgeBase.findFirst({
          where: { 
            id,
            userId: user.id 
          },
          include: {
            documents: {
              orderBy: { createdAt: 'desc' }
            },
            _count: {
              select: { documents: true }
            }
          }
        });

        if (!knowledgeBase) {
          return res.status(404).json({ error: 'Knowledge base not found' });
        }

        res.status(200).json(knowledgeBase);
      } catch (error) {
        console.error('Error fetching knowledge base:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const existingKnowledgeBase = await prisma.knowledgeBase.findFirst({
          where: { 
            id,
            userId: user.id 
          }
        });

        if (!existingKnowledgeBase) {
          return res.status(404).json({ error: 'Knowledge base not found' });
        }

        const updatedKnowledgeBase = await prisma.knowledgeBase.update({
          where: { id },
          data: {
            name: name.trim(),
            description: description?.trim() || null,
          },
          include: {
            _count: {
              select: { documents: true }
            }
          }
        });

        res.status(200).json(updatedKnowledgeBase);
      } catch (error) {
        console.error('Error updating knowledge base:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'DELETE':
      try {
        const existingKnowledgeBase = await prisma.knowledgeBase.findFirst({
          where: { 
            id,
            userId: user.id 
          }
        });

        if (!existingKnowledgeBase) {
          return res.status(404).json({ error: 'Knowledge base not found' });
        }

        await prisma.knowledgeBase.delete({
          where: { id }
        });

        res.status(204).end();
      } catch (error) {
        console.error('Error deleting knowledge base:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}