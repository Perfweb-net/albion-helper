import React, { useState } from 'react';
import {
    Box, Card, Chip, Collapse, Divider, IconButton, Typography, Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import ShieldIcon from '@mui/icons-material/Shield';
import { useTranslation } from 'react-i18next';
import EquipmentLoadout from './EquipmentLoadout';
import { fmtFame, fmtDate } from './albionFormat';
import { useAccentColors } from '../../hooks/useAccentColors';

const PlayerLine = ({ player, color, t }) => (
    <Box>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color }}>
            {player?.name || '?'}
            {player?.itemPower ? (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {player.itemPower} {t('pvp.ip')}
                </Typography>
            ) : null}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {player?.guildName ? `[${player.allianceTag ? player.allianceTag + ' ' : ''}${player.guildName}]` : t('pvp.no_guild')}
        </Typography>
    </Box>
);

/**
 * Carte d'un event PvP. `perspective` = 'kill' (vert) ou 'death' (rouge)
 * colore l'issue du point de vue du joueur consulté.
 */
const KillEventCard = ({ event, perspective = 'kill' }) => {
    const { t } = useTranslation();
    const accents = useAccentColors();
    const [open, setOpen] = useState(false);
    const win = perspective === 'kill';

    return (
        <Card variant="outlined" sx={{ borderLeft: `4px solid ${win ? accents.green : accents.red}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, flexWrap: 'wrap' }}>
                <Chip
                    size="small"
                    label={win ? t('pvp.kill') : t('pvp.death')}
                    sx={{ fontWeight: 700, bgcolor: win ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color: win ? accents.green : accents.red }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 220 }}>
                    <PlayerLine player={event.killer} color={accents.green} t={t} />
                    <Typography variant="caption" color="text.secondary">{t('pvp.killed')}</Typography>
                    <PlayerLine player={event.victim} color={accents.red} t={t} />
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip size="small" variant="outlined" icon={<ShieldIcon sx={{ fontSize: 14 }} />} label={`${fmtFame(event.fame)} ${t('pvp.fame')}`} />
                    {event.groupSize > 1 && (
                        <Chip size="small" variant="outlined" icon={<GroupsIcon sx={{ fontSize: 14 }} />} label={`${event.groupSize}`} />
                    )}
                    <Typography variant="caption" color="text.secondary">{fmtDate(event.timestamp)}</Typography>
                    <IconButton size="small" onClick={() => setOpen(o => !o)} aria-label={t('pvp.event_details')}
                        sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                        <ExpandMoreIcon />
                    </IconButton>
                </Stack>
            </Box>

            <Collapse in={open} unmountOnExit>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: accents.green, fontWeight: 700 }}>{t('pvp.killer_equipment')}</Typography>
                        <Box sx={{ mt: 0.5 }}><EquipmentLoadout equipment={event.killer?.equipment} /></Box>
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{ color: accents.red, fontWeight: 700 }}>{t('pvp.victim_equipment')}</Typography>
                        <Box sx={{ mt: 0.5 }}><EquipmentLoadout equipment={event.victim?.equipment} /></Box>
                    </Box>
                </Box>
                {event.participants?.length > 1 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                {t('pvp.team', { count: event.participants.length })}
                            </Typography>
                            <Stack sx={{ mt: 1 }} spacing={0.5}>
                                {event.participants.map((p, i) => (
                                    <Box key={p.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>{p.name}</Typography>
                                        <EquipmentLoadout equipment={p.equipment} size={28} />
                                        <Typography variant="caption" color="text.secondary">
                                            {fmtFame(p.damageDone)} {t('pvp.dmg')} · {fmtFame(p.healingDone)} {t('pvp.heal')}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </>
                )}
            </Collapse>
        </Card>
    );
};

export default KillEventCard;
