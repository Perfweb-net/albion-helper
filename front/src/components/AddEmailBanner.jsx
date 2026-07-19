import React, {useEffect, useState} from 'react';
import api from '../authApi';
import {Alert, Box, Button, TextField} from '@mui/material';

// Comptes créés avant la v3.2.0 (sans e-mail) : propose d'ajouter une adresse.
// Elle n'est active qu'après le clic sur le lien de confirmation reçu par mail.
const AddEmailBanner = () => {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Promise.resolve : tolère un client HTTP simulé (tests) ou une erreur réseau
        Promise.resolve()
            .then(() => api.get('/me'))
            .then((res) => {
                if (res && res.data && !res.data.email && !res.data.pendingEmail) {
                    setVisible(true);
                }
            })
            .catch(() => {});
    }, []);

    if (!visible) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/profile/email', { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.error || "Impossible d'enregistrer cette adresse.");
        }
    };

    if (sent) {
        return (
            <Alert severity="success" role="status" aria-live="polite" sx={{ mb: 3 }}>
                E-mail de confirmation envoyé à <strong>{email}</strong> — cliquez sur le lien
                qu'il contient pour activer la récupération de votre compte.
            </Alert>
        );
    }

    return (
        <Alert severity="info" sx={{ mb: 3 }}>
            <Box component="form" onSubmit={handleSubmit}
                 sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flexBasis: '100%' }}>
                    Votre compte n'a pas d'adresse e-mail : ajoutez-en une pour pouvoir
                    récupérer votre compte en cas de mot de passe oublié.
                </Box>
                <TextField
                    label="Adresse e-mail"
                    type="email"
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputProps={{ 'aria-label': 'Saisissez votre adresse e-mail' }}
                />
                <Button type="submit" variant="contained" size="small"
                        aria-label="Ajouter cette adresse e-mail à mon compte">
                    Ajouter
                </Button>
                {error && <Box role="alert" sx={{ color: 'error.main', flexBasis: '100%' }}>{error}</Box>}
            </Box>
        </Alert>
    );
};

export default AddEmailBanner;
