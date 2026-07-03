import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Container, Typography, Card, CardContent, Grid2, CircularProgress,
    Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Chip, Button, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Tooltip, TextField, List, ListItem,
    ListItemText, ListItemSecondaryAction
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RouteIcon from '@mui/icons-material/Route';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteIcon from '@mui/icons-material/Delete';
import ShieldIcon from '@mui/icons-material/Shield';
import SyncIcon from '@mui/icons-material/Sync';
import InventoryIcon from '@mui/icons-material/Inventory';
import TranslateIcon from '@mui/icons-material/Translate';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { availableLanguages, fetchAvailableLanguages } from '../../i18n';
import frTranslation from '../../locales/fr/translation.json';
import api from '../../api';
import LanguageEditor from './LanguageEditor';
import './Admin.scss';

const StatCard = ({ icon, label, value, color }) => (
    <Card className="admin__stat-card">
        <CardContent className="admin__stat-content">
            <Box className="admin__stat-icon" sx={{ color }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h4" className="admin__stat-value">{value ?? '—'}</Typography>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
            </Box>
        </CardContent>
    </Card>
);

const Admin = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [itemCounts, setItemCounts] = useState({ items: 0 });
    const [syncingItems, setSyncingItems] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [langDialog, setLangDialog] = useState(false);
    const [newLangCode, setNewLangCode] = useState('');
    const [langCodeError, setLangCodeError] = useState('');
    const [languages, setLanguages] = useState(availableLanguages);
    const [addingLang, setAddingLang] = useState(false);
    const [editLang, setEditLang] = useState(null);

    const loadLanguages = useCallback(() => {
        fetchAvailableLanguages().then(setLanguages);
    }, []);

    useEffect(() => { loadLanguages(); }, [loadLanguages]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, countsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/items/count'),
            ]);
            setItemCounts(countsRes.data);
            setStats(statsRes.data);
            setUsers(usersRes.data);
        } catch {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleToggleRole = async (user) => {
        const isAdmin = user.roles.includes('ROLE_ADMIN');
        try {
            await api.put(`/admin/users/${user.id}/role`, { admin: !isAdmin });
            setUsers(prev => prev.map(u => u.id === user.id
                ? { ...u, roles: isAdmin ? u.roles.filter(r => r !== 'ROLE_ADMIN') : [...u.roles, 'ROLE_ADMIN'] }
                : u
            ));
        } catch {
            setError(t('common.error'));
        }
    };

    const handleSyncItems = async () => {
        setSyncingItems(true);
        setSyncResult(null);
        try {
            const res = await api.post('/admin/sync-items');
            setSyncResult({ type: 'items', ...res.data });
            setItemCounts(c => ({ ...c, items: res.data.total }));
        } catch { setError(t('common.error')); }
        finally { setSyncingItems(false); }
    };

    const handleDelete = async () => {
        if (!deleteDialog) return;
        try {
            await api.delete(`/admin/users/${deleteDialog.id}`);
            setUsers(prev => prev.filter(u => u.id !== deleteDialog.id));
        } catch (e) {
            setError(e.response?.data?.error || t('common.error'));
        } finally {
            setDeleteDialog(null);
        }
    };

    const emptyValues = (obj) => {
        if (typeof obj !== 'object' || obj === null) return '';
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, emptyValues(v)]));
    };

    const handleDownloadTemplate = (langCode) => {
        const template = emptyValues(frTranslation);
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `translation_${langCode || 'new'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddLanguage = async () => {
        const code = newLangCode.trim().toLowerCase();
        if (!/^[a-z]{2}(-[a-z]{2})?$/i.test(code)) {
            setLangCodeError(t('admin.language_code_invalid'));
            return;
        }
        if (languages.some(l => l.code === code)) {
            setLangCodeError(t('admin.language_already_exists', { code }));
            return;
        }
        setAddingLang(true);
        try {
            // Crée le fichier de langue côté serveur (toutes les clés clonées depuis fr).
            await api.post('/admin/locales', { code });
            setLangDialog(false);
            setNewLangCode('');
            setLangCodeError('');
            loadLanguages();
            setEditLang(code); // ouvre directement l'éditeur pour traduire
        } catch (e) {
            setLangCodeError(e.response?.data?.error || t('common.error'));
        } finally {
            setAddingLang(false);
        }
    };

    if (loading) return (
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
            <CircularProgress />
        </Container>
    );

    return (
        <Container maxWidth="lg" className="admin__container">
            <Box className="admin__header">
                <AdminPanelSettingsIcon className="admin__icon" />
                <Typography variant="h3" className="admin__title">{t('admin.title')}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

            <Typography variant="h5" className="admin__section-title" gutterBottom>
                {t('admin.stats')}
            </Typography>

            <Grid2 container spacing={3} sx={{ mb: 5 }}>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        icon={<PeopleIcon fontSize="large" />}
                        label={t('admin.total_users')}
                        value={stats?.totalUsers}
                        color="#c9a84c"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        icon={<PersonAddIcon fontSize="large" />}
                        label={t('admin.new_today')}
                        value={stats?.newToday}
                        color="#e8c96b"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        icon={<RouteIcon fontSize="large" />}
                        label={t('admin.active_routes')}
                        value={stats?.activeRoutes}
                        color="#c9a84c"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        icon={<RouteIcon fontSize="large" />}
                        label={t('admin.total_routes')}
                        value={stats?.totalRoutes}
                        color="#8b6914"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        icon={<SearchIcon fontSize="large" />}
                        label={t('admin.player_searches')}
                        value={stats?.playerSearches}
                        color="#e8c96b"
                    />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        icon={<GroupsIcon fontSize="large" />}
                        label={t('admin.guild_searches')}
                        value={stats?.guildSearches}
                        color="#9b3b3b"
                    />
                </Grid2>
            </Grid2>

            <Typography variant="h5" className="admin__section-title" gutterBottom>
                {t('admin.items_sync')}
            </Typography>

            <Card sx={{ mb: 5, border: '1px solid rgba(201,168,76,0.2)' }}>
                <CardContent>
                    <Grid2 container spacing={3} alignItems="center">
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <InventoryIcon sx={{ color: '#c9a84c', fontSize: 36 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
                                        {itemCounts.items.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{t('admin.items_in_db')}</Typography>
                                </Box>
                            </Box>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Button
                                    variant="contained"
                                    startIcon={syncingItems ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
                                    onClick={handleSyncItems}
                                    disabled={syncingItems}
                                    fullWidth
                                >
                                    {syncingItems ? t('admin.syncing') : t('admin.sync_items_from_api')}
                                </Button>
                            </Box>
                        </Grid2>
                    </Grid2>

                    {syncResult && (
                        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSyncResult(null)}>
                            {t('admin.sync_result', { inserted: syncResult.inserted, updated: syncResult.updated, total: syncResult.total })}
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Typography variant="h5" className="admin__section-title" gutterBottom>
                {t('admin.language_management')}
            </Typography>

            <Card sx={{ mb: 5, border: '1px solid rgba(201,168,76,0.2)' }}>
                <CardContent>
                    <Grid2 container spacing={3} alignItems="flex-start">
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <TranslateIcon sx={{ color: '#c9a84c', fontSize: 32 }} />
                                <Typography variant="h6" sx={{ fontFamily: 'Cinzel, serif' }}>
                                    {t('admin.available_languages', { count: languages.length })}
                                </Typography>
                            </Box>
                            <List dense disablePadding>
                                {languages.map(lang => (
                                    <ListItem key={lang.code} disableGutters>
                                        <ListItemText
                                            primary={lang.label}
                                            secondary={lang.reference ? `${lang.code} · ${t('admin.reference')}` : lang.code}
                                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                                        />
                                        <ListItemSecondaryAction>
                                            {!lang.reference && (
                                                <Tooltip title={t('admin.edit_translations_tooltip')}>
                                                    <IconButton size="small" onClick={() => setEditLang(lang.code)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title={t('admin.download_translation')}>
                                                <IconButton size="small" onClick={() => handleDownloadTemplate(lang.code)}>
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t('admin.add_language_intro')}
                            </Typography>
                            <Box component="ol" sx={{ pl: 2, m: 0, '& li': { mb: 1, fontSize: '0.85rem', color: 'text.secondary' } }}>
                                <li>{t('admin.add_language_step1_pre')} <strong>{t('admin.add_language')}</strong> {t('admin.add_language_step1_post')}</li>
                                <li>{t('admin.add_language_step2')}</li>
                                <li>{t('admin.add_language_step3')}</li>
                                <li>{t('admin.add_language_step4')}</li>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => setLangDialog(true)}
                                sx={{ mt: 2 }}
                            >
                                {t('admin.add_language')}
                            </Button>
                        </Grid2>
                    </Grid2>
                </CardContent>
            </Card>

            <Typography variant="h5" className="admin__section-title" gutterBottom>
                {t('admin.users')}
            </Typography>

            <TableContainer component={Paper} className="admin__table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>{t('admin.username')}</TableCell>
                            <TableCell>{t('admin.role')}</TableCell>
                            <TableCell align="right">{t('admin.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => {
                            const isAdmin = user.roles.includes('ROLE_ADMIN');
                            return (
                                <TableRow key={user.id} className="admin__table-row">
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>
                                        {isAdmin
                                            ? <Chip label="Admin" color="warning" size="small" icon={<ShieldIcon />} />
                                            : <Chip label="User" size="small" variant="outlined" />
                                        }
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={isAdmin ? t('admin.remove_admin') : t('admin.make_admin')}>
                                            <IconButton
                                                onClick={() => handleToggleRole(user)}
                                                color={isAdmin ? 'warning' : 'default'}
                                                size="small"
                                            >
                                                <ShieldIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('admin.delete_user')}>
                                            <IconButton
                                                onClick={() => setDeleteDialog(user)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif' }}>{t('admin.confirm_delete')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('admin.confirm_delete_user_pre')} <strong>{deleteDialog?.username}</strong> {t('admin.confirm_delete_user_post')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>{t('common.cancel')}</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">{t('common.delete')}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={langDialog} onClose={() => { setLangDialog(false); setNewLangCode(''); setLangCodeError(''); }} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Cinzel, serif' }}>{t('admin.add_language')}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {t('admin.add_language_dialog_hint')}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        label={t('admin.language_code_label')}
                        placeholder={t('admin.language_code_placeholder')}
                        value={newLangCode}
                        onChange={e => { setNewLangCode(e.target.value); setLangCodeError(''); }}
                        error={!!langCodeError}
                        helperText={langCodeError}
                        fullWidth
                        size="small"
                        onKeyDown={e => e.key === 'Enter' && handleAddLanguage()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setLangDialog(false); setNewLangCode(''); setLangCodeError(''); }}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleAddLanguage}
                        variant="contained"
                        disabled={addingLang}
                        startIcon={addingLang ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                    >
                        {t('admin.add_language')}
                    </Button>
                </DialogActions>
            </Dialog>

            <LanguageEditor
                open={!!editLang}
                langCode={editLang}
                onClose={() => setEditLang(null)}
                onSaved={loadLanguages}
            />
        </Container>
    );
};

export default Admin;
