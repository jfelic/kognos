import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Input,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DocumentUploadProps {
  knowledgeBaseId: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ knowledgeBaseId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('knowledgeBaseId', knowledgeBaseId);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', knowledgeBaseId] });
      setSelectedFile(null);
      setError(null);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    const allowedExtensions = ['.pdf', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  };

  return (
    <Box sx={{ p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload Document
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          inputProps={{
            accept: '.pdf,.txt',
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </Typography>
          {!isValidFileType(selectedFile) && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Only PDF and TXT files are supported
            </Alert>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {uploadMutation.isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Document uploaded successfully!
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={uploadMutation.isPending ? <CircularProgress size={20} /> : <UploadIcon />}
        onClick={handleUpload}
        disabled={!selectedFile || !isValidFileType(selectedFile) || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
      </Button>
    </Box>
  );
};

export default DocumentUpload;