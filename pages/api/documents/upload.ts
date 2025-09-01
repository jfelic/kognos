import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@frontegg/nextjs/pages';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req);
  
  if (!session || !session.user || !session.user.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.sub;

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      maxFiles: 1,
    });

    const [fields, files] = await form.parse(req);
    
    const knowledgeBaseId = fields.knowledgeBaseId?.[0];
    const uploadedFile = files.file?.[0];

    if (!knowledgeBaseId || typeof knowledgeBaseId !== 'string') {
      return res.status(400).json({ error: 'Knowledge base ID is required' });
    }

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['.pdf', '.txt'];
    const fileExtension = path.extname(uploadedFile.originalFilename || '').toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({ error: 'Only PDF and TXT files are allowed' });
    }

    // Check if user owns the knowledge base
    const user = await prisma.user.findUnique({
      where: { fronteggId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: { 
        id: knowledgeBaseId,
        userId: user.id 
      }
    });

    if (!knowledgeBase) {
      return res.status(404).json({ error: 'Knowledge base not found or access denied' });
    }

    // Read file content (for now, just to validate it's readable)
    const fileContent = fs.readFileSync(uploadedFile.filepath);
    
    // Create document record in database
    const document = await prisma.document.create({
      data: {
        filename: uploadedFile.originalFilename || 'unknown',
        originalText: '', // Will be populated in Phase 2B
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimetype || 'application/octet-stream',
        knowledgeBaseId: knowledgeBaseId,
      },
    });

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    res.status(201).json({
      document: {
        id: document.id,
        filename: document.filename,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        createdAt: document.createdAt,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}