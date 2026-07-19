import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTranslation } from 'react-i18next';
import { DONATION_URL } from '../../config/links';
import './Footer.scss';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <Box className="footer">
            <Container maxWidth="lg">
                {DONATION_URL && (
                    <Typography variant="body2" align="center" className="footer__donate" sx={{ mb: 0.5 }}>
                        <Link
                            href={DONATION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
                            aria-label={t('footer.support_aria')}
                        >
                            <FavoriteIcon sx={{ fontSize: 16 }} />
                            {t('footer.support')}
                        </Link>
                    </Typography>
                )}
                <Typography variant="body2" align="center" className="footer__text">
                    &copy; {new Date().getFullYear()} Albion Helper. Tous droits réservés.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
