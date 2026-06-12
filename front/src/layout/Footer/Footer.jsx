import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import './Footer.scss';

const Footer = () => {
    return (
        <Box className="footer">
            <Container maxWidth="lg">
                <Typography variant="body2" align="center" className="footer__text">
                    &copy; {new Date().getFullYear()} Albion Helper. Tous droits réservés.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
