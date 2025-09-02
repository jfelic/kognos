import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@frontegg/nextjs/pages';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'DELETE') {
        // Only allow DELETE methods
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if authenticated
    const session = await getSession(req);
    if (!session || !session.user || !session.user.sub) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Deleting document with id:', req.body);
    const { documentId } = req.body;

    try {
        // Find and verify document ownership
        const user = await prisma.user.findUnique({
            where: { fronteggId: session.user.sub }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const document = await prisma.document.findFirst({
            where: { 
                id: documentId,
                knowledgeBase: { userId: user.id }
            }
        });

        // Early return if document not found
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete the document
        await prisma.document.delete({ where: { id: documentId } });
        res.status(200).json({ message: 'Document deleted successfully' });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }

}

