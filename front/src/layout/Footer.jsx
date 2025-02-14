import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
    return (
        <Box sx={{ bgcolor: '#333', color: 'white', py: 2, mt: 'auto' , position: 'fixed', bottom: 0, width: '100%' }}>
            <Container maxWidth="lg">
                <Typography variant="body2" align="center">
                    &copy; 2025 My Website. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
