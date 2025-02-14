import React, {useState, useEffect} from 'react';
import api from '../api';
import {useNavigate, useParams} from 'react-router-dom';
import {Avatar, Box, Button, Card, CardContent, Divider, Grid2, Typography} from "@mui/material";
import moment from "moment";

const Player = () => {  // Le nom du composant commence par une majuscule
    const [guild, setGuild] = useState('');
    const [members, setMembers] = useState('');
    const [overall, setOverall] = useState('')
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState(false);
    const visibleMembers = expanded ? members : members.slice(0, 3);

    const navigate = useNavigate();
    console.log(useParams());
    const guildId = useParams().guildId;
    console.log(guildId);

    useEffect(() => {
        const getPlayerInfo = async (e) => {
            await api.get("/guild/" + guildId).then(
                (response) => {
                    console.log(response);
                    if (response.data.statut !== "OK") {
                        setError(response.data.message);
                    } else {
                        setGuild(response.data.guild);
                        setMembers(response.data.members);
                        setOverall(response.data.data.overall);
                        setError('');
                    }
                }
            ).catch((error) => console.error('Error fetching player:', error));
        }

        getPlayerInfo();
    }, [guildId]);
    return (
        <>
            {guild && (
                <>
                    <Grid2 container spacing={2}
                           sx={{width: '90%', marginLeft: "5%", alignItems: 'center', marginBottom: 2}}>
                        <Grid2 item size={12}>
                            <Card>
                                <CardContent>
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight={"bold"}>{guild.Name} {"[ " + guild.AllianceTag + " ]" || ""}
                                        </Typography>
                                        <Divider sx={{my: 2}}/>

                                        <Typography
                                            variant="body1"><strong>Crée le
                                            :</strong> {moment(guild.Founded).format('DD/MM/YYYY')}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            onClick={() => navigate(`/player/${guild.FounderId}`)}
                                        ><strong>Créateur:</strong> <u>{guild.FounderName}</u>
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                        ><strong>Membre:</strong> {guild.MemberCount}
                                        </Typography>
                                        <Divider sx={{my: 2}}/>

                                        <Typography
                                            variant="body1"
                                        ><strong>Total fame:</strong> {overall.fame.toLocaleString()}
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                        ><strong>Kill fame:</strong> {guild.killFame.toLocaleString()} <strong>pour</strong> {overall.kills} <strong>Kills</strong>
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                        ><strong>Death fame:</strong> {guild.DeathFame.toLocaleString()} <strong>pour</strong> {overall.deaths} <strong>Deaths</strong>
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                        ><strong>Ratio:</strong> {Math.round(parseInt(guild.killFame) / parseInt(guild.DeathFame) * 100) / 100}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid2>
                        <Grid2 item size={12}>
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        fontWeight={"bold"}
                                        sx={{marginBottom: 2}}
                                    >Liste des membres :
                                    </Typography>

                                    {visibleMembers.map((member) => (
                                        <React.Fragment key={member.Id}>
                                            <Box>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={"bold"}
                                                    onClick={() => navigate(`/player/${member.Id}`)}
                                                >{member.Name}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{my: 2}}/>
                                        </React.Fragment>
                                    ))}

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setExpanded(!expanded)}
                                        sx={{marginTop: 2}}
                                    >{expanded ? 'Masquer' : 'Afficher Tout'}</Button>
                                </CardContent>
                            </Card>
                        </Grid2>
                    </Grid2>
                </>
            )}
        </>
    )
};

export default Player;  // Le nom du composant doit aussi être en majuscule ici