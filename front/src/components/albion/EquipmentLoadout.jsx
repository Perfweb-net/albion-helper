import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { QUALITY_COLORS, QUALITY_LABELS, tierFromType } from './albionFormat';

const SLOT_ORDER = ['MainHand', 'OffHand', 'Head', 'Armor', 'Shoes', 'Cape', 'Bag', 'Mount', 'Potion', 'Food'];

const ItemIcon = ({ slot, item, size, slotLabels, t }) => {
    const quality = item?.quality || 1;
    const border = QUALITY_COLORS[quality] || 'transparent';
    if (!item) {
        return (
            <Box sx={{
                width: size, height: size, borderRadius: 1,
                border: '1px dashed rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.03)',
            }} />
        );
    }
    return (
        <Tooltip title={`${slotLabels[slot]} — ${item.type} ${tierFromType(item.type)} (${t('pvp.quality')} ${QUALITY_LABELS[quality]})`}>
            <Box sx={{
                width: size, height: size, borderRadius: 1, position: 'relative',
                border: `2px solid ${border === 'transparent' ? 'rgba(255,255,255,0.15)' : border}`,
                backgroundColor: 'rgba(0,0,0,0.25)',
                backgroundImage: `url(https://render.albiononline.com/v1/item/${encodeURIComponent(item.type)}.png?quality=${quality})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
                {item.count > 1 && (
                    <Box sx={{
                        position: 'absolute', bottom: 0, right: 1, fontSize: 9, fontWeight: 700,
                        color: '#fff', textShadow: '0 0 3px #000', lineHeight: 1,
                    }}>{item.count}</Box>
                )}
            </Box>
        </Tooltip>
    );
};

/**
 * Affiche l'équipement d'un joueur (slots vides inclus pour garder l'alignement).
 * @param {object} equipment  { MainHand:{type,quality,count}, ... }
 * @param {number} size       taille d'icône en px (défaut 40)
 */
const EquipmentLoadout = ({ equipment = {}, size = 40 }) => {
    const { t } = useTranslation();
    const slotLabels = {
        MainHand: t('pvp.slot_main_hand'),
        OffHand: t('pvp.slot_off_hand'),
        Head: t('pvp.slot_head'),
        Armor: t('pvp.slot_armor'),
        Shoes: t('pvp.slot_shoes'),
        Cape: t('pvp.slot_cape'),
        Bag: t('pvp.slot_bag'),
        Mount: t('pvp.slot_mount'),
        Potion: t('pvp.slot_potion'),
        Food: t('pvp.slot_food'),
    };
    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {SLOT_ORDER.map(slot => (
                <ItemIcon key={slot} slot={slot} item={equipment[slot]} size={size} slotLabels={slotLabels} t={t} />
            ))}
        </Box>
    );
};

export default EquipmentLoadout;
