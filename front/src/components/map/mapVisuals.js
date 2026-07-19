import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import DomainIcon from '@mui/icons-material/Domain';
import ParkIcon from '@mui/icons-material/Park';
import GrassIcon from '@mui/icons-material/Grass';
import LandscapeIcon from '@mui/icons-material/Landscape';
import DiamondIcon from '@mui/icons-material/Diamond';
import PetsIcon from '@mui/icons-material/Pets';
import Crown from '../svg/Crown';
import Portal from '../svg/Portal';
import Tunnel from '../svg/Tunnel';

// Référentiel visuel des cartes (types de zones, coffres, ressources) partagé
// entre la page Carte et la recherche du tableau de bord : un seul endroit à
// maintenir, les deux écrans affichent exactement la même chose.
export const useMapVisuals = () => {
    const { t } = useTranslation();

    const chestTypes = useMemo(() => ({
        "Big Avalonian Chest": { color: "gold", fontSize: "large", info: t('map.legend_chest_big_gold') },
        "Avalonian Chest": { color: "gold", fontSize: "small", info: t('map.legend_chest_gold') },
        "Big Group Chest": { color: "blue", fontSize: "large", info: t('map.legend_chest_blue') },
        "Big Solo Chest": { color: "green", fontSize: "large", info: t('map.legend_chest_big_green') },
        "Solo Chest": { color: "green", fontSize: "small", info: t('map.legend_chest_green') }
    }), [t]);

    const mapTypes = useMemo(() => ({
        "TUNNEL_ROYAL": { icon: <Crown/>, info: t('map.legend_royal') },
        "TUNNEL_ROYAL_RED": { icon: <Crown color="red"/>, info: t('map.legend_royal_red') },

        "TUNNEL_DEEP_RAID": { icon: <GroupsIcon sx={{ color: "gold", fontSize: "large", background: "grey", padding: "3px" }}/>, info: t('map.legend_portal_gold') },
        "TUNNEL_DEEP": { icon: <Portal/>, info: t('map.legend_portal_back') },

        "TUNNEL_LOW": { icon: <Tunnel color="green" width={20} height={20}/>, info: t('map.legend_ava_low') },
        "TUNNEL_MEDIUM": { icon: <Tunnel color="blue" width={20} height={20}/>, info: t('map.legend_ava_medium') },
        "TUNNEL_HIGH": { icon: <Tunnel color="gold" width={20} height={20}/>, info: t('map.legend_ava_high') },

        "TUNNEL_BLACK_LOW": { icon: <HomeIcon sx={{ color: "green", fontSize: "large" }}/>, info: t('map.legend_bz_low') },
        "TUNNEL_BLACK_MEDIUM": { icon: <HomeIcon sx={{ color: "blue", fontSize: "large" }}/>, info: t('map.legend_bz_medium') },
        "TUNNEL_BLACK_HIGH": { icon: <HomeIcon sx={{ color: "gold", fontSize: "large" }}/>, info: t('map.legend_bz_high') },

        "TUNNEL_HIDEOUT": { icon: <DomainIcon sx={{ color: "green", fontSize: "large" }}/>, info: t('map.legend_ho') },
        "TUNNEL_HIDEOUT_DEEP": { icon: <DomainIcon sx={{ color: "gold", fontSize: "large" }}/>, info: t('map.legend_ho_deep') },
    }), [t]);

    const resourceIcons = useMemo(() => ({
        WOOD: <ParkIcon sx={{ color: "saddlebrown" }} />,
        FIBER: <GrassIcon sx={{ color: "green" }} />,
        ROCK: <LandscapeIcon sx={{ color: "grey" }} />,
        ORE: <DiamondIcon sx={{ color: "orange" }} />,
        HIDE: <PetsIcon sx={{ color: "peru" }} />,
    }), []);

    const resourceLabels = useMemo(() => ({
        WOOD: t('map.resource_wood'),
        FIBER: t('map.resource_fiber'),
        ROCK: t('map.resource_rock'),
        ORE: t('map.resource_ore'),
        HIDE: t('map.resource_hide'),
    }), [t]);

    return { chestTypes, mapTypes, resourceIcons, resourceLabels };
};

// Tailles d'icônes pour les mobs de ressources (géants / élites)
export const mobResourceIconSize = { giant: 48, elite: 24 };

// Fond et couleur du chip de tier — même logique sur les deux écrans
export const tierStyle = (map) => {
    let backgroundColor = "transparent";
    let tierColor = "default";
    if (map.name.includes("-")) {
        if (map.tier === 4) { backgroundColor = "#f0f0f0"; tierColor = "default"; }
        if (map.tier === 6) { backgroundColor = "#e0f7ff"; tierColor = "info"; }
        if (map.tier === 8) { backgroundColor = "#fff5cc"; tierColor = "warning"; }
    }
    return { backgroundColor, tierColor };
};
