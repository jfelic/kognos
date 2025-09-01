import { GetServerSideProps } from 'next';
import { getSession } from '@frontegg/nextjs/pages';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Upload as UploadIcon,
  Description as DocumentIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  _count: {
    documents: number;
  };
}

interface Document {
  id: string;
  filename: string;
  fileSize: number | null;
  createdAt: string;
}

export default function KnowledgeBaseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const { data: knowledgeBase, isLoading, error } = useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: async () => {
      const response = await fetch(`/api/knowledge-bases/${id}`);
      if (!response.ok) throw new Error('Failed to fetch knowledge base');
      return response.json() as Promise<KnowledgeBase>;
    },
    enabled: !!id
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await fetch(`/api/knowledge-bases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update knowledge base');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
      setEditDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/knowledge-bases/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete knowledge base');
    },
    onSuccess: () => {
      router.push('/dashboard');
    }
  });

  const handleEdit = () => {
    if (knowledgeBase) {
      setFormData({
        name: knowledgeBase.name,
        description: knowledgeBase.description || ''
      });
      setEditDialogOpen(true);
    }
    setMenuAnchorEl(null);
  };

  const handleUpdate = () => {
    if (formData.name.trim()) {
      updateMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !knowledgeBase) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Failed to load knowledge base. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {knowledgeBase.name}
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="inherit"
            onClick={() => router.push('/dashboard')}
            sx={{ textDecoration: 'none' }}
          >
            Knowledge Bases
          </Link>
          <Typography color="text.primary">{knowledgeBase.name}</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {knowledgeBase.name}
          </Typography>
          {knowledgeBase.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {knowledgeBase.description}
            </Typography>
          )}
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<DocumentIcon />}
              label={`${knowledgeBase._count.documents} documents`}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Created {new Date(knowledgeBase.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => {
              alert('Document upload will be implemented in Phase 2!');
            }}
          >
            Upload Document
          </Button>
        </Box>

        {knowledgeBase.documents.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No documents yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your first document to start building your knowledge base
              </Typography>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => {
                  alert('Document upload will be implemented in Phase 2!');
                }}
              >
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {knowledgeBase.documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DocumentIcon color="action" />
                    <Box>
                      <Typography variant="subtitle1">{doc.filename}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB • ` : ''}
                        Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => { setDeleteDialogOpen(true); setMenuAnchorEl(null); }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Knowledge Base</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdate}
              variant="contained"
              disabled={!formData.name.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Knowledge Base</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete &quot;{knowledgeBase.name}&quot;? This action cannot be undone and will permanently delete all documents and data associated with this knowledge base.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context.req);
  
  if (!session) {
    return {
      redirect: {
        destination: '/account/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};