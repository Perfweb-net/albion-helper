import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid2, Paper, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useMapVisuals } from './mapVisuals';

const legendItemSx = {
    padding: 2,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "background.paper",
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: "action.hover",
        transform: 'translateY(-2px)',
        boxShadow: 2
    }
};

// Légende des cartes — partagée entre la page Carte et le tableau de bord.
// `maps` sert à ne montrer que les entrées réellement présentes dans les résultats.
const MapLegend = ({ maps = [], showChestInfo = true, showGatherInfo = false }) => {
    const { t } = useTranslation();
    const { chestTypes, mapTypes, resourceIcons, resourceLabels } = useMapVisuals();

    let filteredMapTypes = mapTypes;
    let filteredChestTypes = chestTypes;
    if (maps.length > 0) {
        const usedTypes = new Set(maps.map(map => map.type));
        filteredMapTypes = Object.fromEntries(Object.entries(mapTypes).filter(([type]) => usedTypes.has(type)));

        const usedChests = new Set();
        maps.forEach(map => {
            (map.zoneInfo?.markers || []).forEach(marker => {
                if (chestTypes[marker.name]) {
                    usedChests.add(marker.name);
                }
            });
        });
        filteredChestTypes = Object.fromEntries(Object.entries(chestTypes).filter(([type]) => usedChests.has(type)));
    }

    return (
        <Paper sx={{ p: 4, mt: 4, borderRadius: 3 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                {t('map.legend')}
            </Typography>
            <Grid2 container spacing={2}>
                {/* Types de tunnels / zones */}
                {Object.entries(filteredMapTypes).map(([type, { icon, info }]) => (
                    <Grid2 size={{xs: 6, sm: 4, md: 3}} key={type}>
                        <Box sx={legendItemSx}>
                            {icon}
                            <Typography variant="body2" sx={{ fontWeight: 500, marginLeft: 1 }}>
                                {info}
                            </Typography>
                        </Box>
                    </Grid2>
                ))}

                {/* Types de coffres */}
                {showChestInfo && Object.entries(filteredChestTypes).map(([type, { color, fontSize, info }]) => {
                    const isBigChest = type.includes("Big");
                    return (
                        <Grid2 size={{xs: 6, sm: 4, md: 3}} key={type}>
                            <Box sx={legendItemSx}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {isBigChest && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                border: `2px solid ${color}`,
                                                animation: 'pulse 2s ease-in-out infinite',
                                            }}
                                        />
                                    )}
                                    <CircleIcon sx={{ color, fontSize, position: 'relative', zIndex: 1 }} />
                                </Box>
                                <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                    {info}
                                </Typography>
                            </Box>
                        </Grid2>
                    );
                })}

                {/* Types de ressources */}
                {showGatherInfo && Object.entries(resourceIcons).map(([type, icon]) => (
                    <Grid2 size={{xs: 6, sm: 4, md: 3}} key={type}>
                        <Box sx={legendItemSx}>
                            {icon}
                            <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                                {resourceLabels[type]}
                            </Typography>
                        </Box>
                    </Grid2>
                ))}
            </Grid2>
        </Paper>
    );
};

export default MapLegend;
