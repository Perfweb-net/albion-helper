import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Button, Card, CardContent, CardActions,
    IconButton, CircularProgress, Alert, Grid2, Chip, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GroupsIcon from '@mui/icons-material/Groups';
import LockIcon from '@mui/icons-material/Lock';
import LinkIcon from '@mui/icons-material/Link';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api';

const VISIBILITY_CONFIG = {
    private:  { label: 'Privé',    icon: <LockIcon   sx={{ fontSize: 12 }} />, color: '#8b949e' },
    url_only: { label: 'URL only', icon: <LinkIcon   sx={{ fontSize: 12 }} />, color: '#58a6ff' },
    public:   { label: 'Public',   icon: <PublicIcon sx={{ fontSize: 12 }} />, color: '#3fb950' },
};

function VisibilityChip({ visibility }) {
    const cfg = VISIBILITY_CONFIG[visibility] ?? VISIBILITY_CONFIG.private;
    return (
        <Chip
            icon={cfg.icon}
            label={cfg.label}
            size="small"
            sx={{ bgcolor: '#21262d', color: cfg.color, fontSize: '0.7rem', height: 20, '& .MuiChip-icon': { color: cfg.color } }}
        />
    );
}

function CompoCard({ comp, onDelete, onCopyLink, showOwner }) {
    const navigate = useNavigate();
    const canShare = comp.visibility === 'url_only' || comp.visibility === 'public';

    return (
        <Card sx={{ bgcolor: '#161b22', border: '1px solid #21262d', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { borderColor: 'rgba(201,168,76,0.3)' } }}>
            <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', mb: 1, lineHeight: 1.3, fontSize: '1rem' }}>
                    {comp.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                    <Chip icon={<GroupsIcon sx={{ fontSize: 12 }} />}
                        label={`${comp.players.length} joueur${comp.players.length !== 1 ? 's' : ''}`}
                        size="small" sx={{ bgcolor: '#21262d', fontSize: '0.7rem', height: 20 }} />
                    <VisibilityChip visibility={comp.visibility} />
                </Box>
                {showOwner && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#c9a84c', mb: 0.5 }}>par {comp.owner}</Typography>
                )}
                <Typography sx={{ fontSize: '0.72rem', color: '#8b949e' }}>
                    {new Date(comp.updatedAt).toLocaleDateString('fr-FR')}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0, gap: 0.5 }}>
                {canShare && (
                    <Tooltip title="Copier le lien">
                        <IconButton size="small" onClick={() => onCopyLink(comp)} sx={{ color: '#8b949e', '&:hover': { color: '#58a6ff' } }}>
                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {!showOwner && (
                    <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => onDelete(comp)} sx={{ color: '#8b949e', '&:hover': { color: '#f44336' } }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {showOwner ? (
                    <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/compositions/share/${comp.shareToken}`)}>
                        Voir
                    </Button>
                ) : (
                    <Button size="small" variant="outlined" startIcon={<EditIcon />}
                        onClick={() => navigate(`/compositions/${comp.id}`)}>
                        Éditer
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}

export default function Compositions() {
    const navigate = useNavigate();
    const [tab, setTab]                   = useState(0);
    const [myComps, setMyComps]           = useState([]);
    const [publicComps, setPublicComps]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [pubLoading, setPubLoading]     = useState(false);
    const [error, setError]               = useState('');
    const [createDialog, setCreateDialog] = useState(false);
    const [newName, setNewName]           = useState('');
    const [creating, setCreating]         = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [snack, setSnack]               = useState('');

    const loadMine = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/compositions');
            setMyComps(res.data);
        } catch {
            setError('Impossible de charger les compositions');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPublic = useCallback(async () => {
        setPubLoading(true);
        try {
            const res = await api.get('/compositions/public');
            setPublicComps(res.data);
        } catch {
            setError('Impossible de charger la galerie');
        } finally {
            setPubLoading(false);
        }
    }, []);

    useEffect(() => { loadMine(); }, [loadMine]);

    useEffect(() => {
        if (tab === 1 && publicComps.length === 0 && !pubLoading) loadPublic();
    }, [tab, publicComps.length, pubLoading, loadPublic]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await api.post('/compositions', { name: newName.trim(), players: [] });
            setCreateDialog(false);
            setNewName('');
            navigate(`/compositions/${res.data.id}`);
        } catch {
            setError('Erreur lors de la création');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/compositions/${deleteTarget.id}`);
            setMyComps(prev => prev.filter(c => c.id !== deleteTarget.id));
        } catch {
            setError('Erreur lors de la suppression');
        } finally {
            setDeleteTarget(null);
        }
    };

    const copyLink = (comp) => {
        navigator.clipboard.writeText(`${window.location.origin}/compositions/share/${comp.shareToken}`);
        setSnack('Lien copié !');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <GroupsIcon sx={{ fontSize: 36, color: '#c9a84c' }} />
                <Typography variant="h4" sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c', flex: 1 }}>
                    Compositions
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>
                    Nouvelle
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
            {snack && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSnack('')}>{snack}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #21262d' }}>
                <Tab label={`Mes compositions (${myComps.length})`} />
                <Tab label="Galerie publique" icon={<PublicIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            </Tabs>

            {/* My compositions */}
            {tab === 0 && (
                loading
                    ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                    : myComps.length === 0
                        ? <Box sx={{ textAlign: 'center', py: 8, color: '#8b949e' }}>
                            <GroupsIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                            <Typography>Aucune composition. Créez-en une !</Typography>
                          </Box>
                        : <Grid2 container spacing={2.5}>
                            {myComps.map(comp => (
                                <Grid2 key={comp.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <CompoCard comp={comp} onDelete={setDeleteTarget} onCopyLink={copyLink} showOwner={false} />
                                </Grid2>
                            ))}
                          </Grid2>
            )}

            {/* Public gallery */}
            {tab === 1 && (
                pubLoading
                    ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                    : publicComps.length === 0
                        ? <Box sx={{ textAlign: 'center', py: 8, color: '#8b949e' }}>
                            <PublicIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                            <Typography>Aucune composition publique pour l'instant.</Typography>
                          </Box>
                        : <Grid2 container spacing={2.5}>
                            {publicComps.map(comp => (
                                <Grid2 key={comp.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <CompoCard comp={comp} onDelete={() => {}} onCopyLink={copyLink} showOwner={true} />
                                </Grid2>
                            ))}
                          </Grid2>
            )}

            {/* Create dialog */}
            <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid rgba(201,168,76,0.25)' } }}>
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif', color: '#c9a84c' }}>Nouvelle composition</DialogTitle>
                <DialogContent>
                    <TextField autoFocus fullWidth size="small" label="Nom" value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                        sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setCreateDialog(false); setNewName(''); }}>Annuler</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={creating || !newName.trim()}
                        startIcon={creating ? <CircularProgress size={14} color="inherit" /> : null}>
                        Créer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid rgba(201,168,76,0.25)' } }}>
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif' }}>Supprimer ?</DialogTitle>
                <DialogContent>
                    <Typography>Supprimer <strong>{deleteTarget?.name}</strong> ?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Supprimer</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
