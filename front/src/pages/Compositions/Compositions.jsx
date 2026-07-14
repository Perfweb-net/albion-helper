import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

function VisibilityChip({ visibility }) {
    const { t } = useTranslation();
    const VISIBILITY_CONFIG = {
        private:  { label: t('compositions.visibility_private'),  icon: <LockIcon   sx={{ fontSize: 12 }} />, color: '#8b949e' },
        url_only: { label: t('compositions.visibility_url_only'), icon: <LinkIcon   sx={{ fontSize: 12 }} />, color: '#58a6ff' },
        public:   { label: t('compositions.visibility_public'),   icon: <PublicIcon sx={{ fontSize: 12 }} />, color: '#3fb950' },
    };
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
    const { t } = useTranslation();
    const canShare = comp.visibility === 'url_only' || comp.visibility === 'public';

    return (
        <Card sx={{ bgcolor: '#161b22', border: '1px solid #21262d', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { borderColor: 'rgba(201,168,76,0.3)' } }}>
            <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main', mb: 1, lineHeight: 1.3, fontSize: '1rem' }}>
                    {comp.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                    <Chip icon={<GroupsIcon sx={{ fontSize: 12 }} />}
                        label={t('compositions.player_count', { count: comp.players.length })}
                        size="small" sx={{ bgcolor: '#21262d', fontSize: '0.7rem', height: 20 }} />
                    <VisibilityChip visibility={comp.visibility} />
                </Box>
                {showOwner && (
                    <Typography sx={{ fontSize: '0.75rem', color: 'primary.main', mb: 0.5 }}>{t('compositions.by_owner', { owner: comp.owner })}</Typography>
                )}
                <Typography sx={{ fontSize: '0.72rem', color: '#8b949e' }}>
                    {new Date(comp.updatedAt).toLocaleDateString('fr-FR')}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', pt: 0, gap: 0.5 }}>
                {canShare && (
                    <Tooltip title={t('compositions.copy_link')}>
                        <IconButton size="small" onClick={() => onCopyLink(comp)} sx={{ color: '#8b949e', '&:hover': { color: '#58a6ff' } }}>
                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {!showOwner && (
                    <Tooltip title={t('common.delete')}>
                        <IconButton size="small" onClick={() => onDelete(comp)} sx={{ color: '#8b949e', '&:hover': { color: '#f44336' } }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                )}
                {showOwner ? (
                    <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/compositions/share/${comp.shareToken}`)}>
                        {t('compositions.view')}
                    </Button>
                ) : (
                    <Button size="small" variant="outlined" startIcon={<EditIcon />}
                        onClick={() => navigate(`/compositions/${comp.id}`)}>
                        {t('common.edit')}
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}

export default function Compositions() {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
            setError(t('compositions.error_load_mine'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    const loadPublic = useCallback(async () => {
        setPubLoading(true);
        try {
            const res = await api.get('/compositions/public');
            setPublicComps(res.data);
        } catch {
            setError(t('compositions.error_load_gallery'));
        } finally {
            setPubLoading(false);
        }
    }, [t]);

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
            setError(t('compositions.error_create'));
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
            setError(t('compositions.error_delete'));
        } finally {
            setDeleteTarget(null);
        }
    };

    const copyLink = (comp) => {
        navigator.clipboard.writeText(`${window.location.origin}/compositions/share/${comp.shareToken}`);
        setSnack(t('compositions.link_copied'));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <GroupsIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                <Typography variant="h4" className="ah-page-title" sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main', flex: 1 }}>
                    {t('compositions.title')}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)}>
                    {t('compositions.new')}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
            {snack && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSnack('')}>{snack}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #21262d' }}>
                <Tab label={t('compositions.tab_mine', { count: myComps.length })} />
                <Tab label={t('compositions.tab_gallery')} icon={<PublicIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
            </Tabs>

            {/* My compositions */}
            {tab === 0 && (
                loading
                    ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                    : myComps.length === 0
                        ? <Box sx={{ textAlign: 'center', py: 8, color: '#8b949e' }}>
                            <GroupsIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                            <Typography>{t('compositions.empty_mine')}</Typography>
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
                            <Typography>{t('compositions.empty_gallery')}</Typography>
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
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif', color: 'primary.main' }}>{t('compositions.dialog_create_title')}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus fullWidth size="small" label={t('compositions.name_label')} value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
                        sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setCreateDialog(false); setNewName(''); }}>{t('common.cancel')}</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={creating || !newName.trim()}
                        startIcon={creating ? <CircularProgress size={14} color="inherit" /> : null}>
                        {t('compositions.create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
                PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid rgba(201,168,76,0.25)' } }}>
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif' }}>{t('compositions.dialog_delete_title')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('compositions.dialog_delete_confirm', { name: deleteTarget?.name })}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">{t('common.delete')}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
