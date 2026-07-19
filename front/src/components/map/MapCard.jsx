import React from 'react';
import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useMapVisuals, mobResourceIconSize, tierStyle } from './mapVisuals';

// Carte de résultat d'une zone — rendu unique partagé par la page Carte et la
// recherche du tableau de bord (icône du type de zone, tier, coffres, mobs).
const MapCard = ({ map, showChestInfo = true, showGatherInfo = false }) => {
    const { chestTypes, mapTypes, resourceIcons } = useMapVisuals();
    const { backgroundColor, tierColor } = tierStyle(map);

    const chestCounts = (map.zoneInfo?.markers || []).reduce((acc, marker) => {
        if (chestTypes[marker.name]) {
            acc[marker.name] = (acc[marker.name] || 0) + 1;
        }
        return acc;
    }, {});

    // Détection des mobs géants ou élites par ressource (avec comptage séparé)
    const mobResourceIconsMap = {};
    (map.zoneInfo?.mobs || []).forEach(mob => {
        let resourceType = null;
        let mobType = null;

        if ((mob.name.toLowerCase().includes('giant') || mob.name.toLowerCase().includes('guardian') || mob.name.toLowerCase().includes('BASILISK'))) {
            mobType = 'giant';
        } else if (mob.name.toLowerCase().includes('elite') || mob.name.toLowerCase().includes('veteran')) {
            mobType = 'elite';
        }

        if (mobType) {
            if (mob.name.includes('WOOD') || mob.name.includes('ENT')) {
                resourceType = 'WOOD';
            } else if (mob.name.includes('FIBER') || mob.name.includes('DRYAD')) {
                resourceType = 'FIBER';
            } else if (mob.name.includes('ROCK') || mob.name.includes('ROCKGIANT')) {
                resourceType = 'ROCK';
            } else if (mob.name.includes('ORE') || mob.name.includes('OREGIANT')) {
                resourceType = 'ORE';
            } else if (mob.name.includes('HIDE') || mob.name.includes('BASILISK')) {
                resourceType = 'HIDE';
            }
        }

        if (resourceType && mobType) {
            if (!mobResourceIconsMap[resourceType]) {
                mobResourceIconsMap[resourceType] = {};
            }
            if (!mobResourceIconsMap[resourceType][mobType]) {
                mobResourceIconsMap[resourceType][mobType] = {
                    count: 0,
                    size: mobResourceIconSize[mobType],
                    icon: resourceIcons[resourceType]
                };
            }
            mobResourceIconsMap[resourceType][mobType].count++;
        }
    });
    const mobResourceEntries = Object.entries(mobResourceIconsMap);

    return (
        <Card
            sx={{
                cursor: 'pointer',
                height: '100%',
                backgroundColor: backgroundColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.15)',
                }
            }}
        >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mb: 2 }}>
                    {mapTypes[map.type]?.icon}
                    <Typography variant="h6" fontWeight={600}>
                        {map.name}
                    </Typography>
                </Box>

                {map.tier && (
                    <Chip
                        label={`Tier ${map.tier}`}
                        size="small"
                        color={tierColor}
                        sx={{ mb: 2 }}
                    />
                )}

                {/* Affichage des coffres */}
                {showChestInfo && Object.keys(chestCounts).length > 0 && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}>
                        {Object.entries(chestCounts).map(([type, count], index) => {
                            const isBigChest = type.includes("Big");
                            return (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                                                    border: `2px solid ${chestTypes[type].color}`,
                                                    animation: 'pulse 2s ease-in-out infinite',
                                                }}
                                            />
                                        )}
                                        <CircleIcon sx={{
                                            color: chestTypes[type].color,
                                            fontSize: chestTypes[type].fontSize,
                                            position: 'relative',
                                            zIndex: 1
                                        }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {count}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {/* Affichage des mobs géants/élites de ressource */}
                {showGatherInfo && mobResourceEntries.length > 0 && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}>
                        {mobResourceEntries.map(([type, mobs], idx) => (
                            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {mobs.giant && (
                                    <Chip
                                        icon={React.cloneElement(mobs.giant.icon, { style: { fontSize: mobs.giant.size } })}
                                        label={`x${mobs.giant.count}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                                {mobs.elite && (
                                    <Chip
                                        icon={React.cloneElement(mobs.elite.icon, { style: { fontSize: mobs.elite.size } })}
                                        label={`x${mobs.elite.count}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default MapCard;
