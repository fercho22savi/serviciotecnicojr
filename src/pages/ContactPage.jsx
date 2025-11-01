import React, { useState } from 'react';
import { Container, Typography, Grid, Paper, TextField, Button, Box, CircularProgress, Icon } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error("Por favor, completa todos los campos.");
            return;
        }

        setLoading(true);
        // Simulate a network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Contact Form Data:", formData);
        setLoading(false);
        toast.success("¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.");

        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <Container maxWidth="lg" sx={{ my: 8 }}>
            <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <Grid container spacing={6}>
                    {/* Contact Info Section */}
                    <Grid item xs={12} md={5}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Contáctanos</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            ¿Tienes alguna pregunta o necesitas ayuda? Completa el formulario y nuestro equipo te responderá lo antes posible.
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Icon component={EmailIcon} sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                                <Typography fontWeight="bold">Correo Electrónico</Typography>
                                <Typography variant="body2" color="text.secondary">soporte@mitienda.com</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Icon component={PhoneIcon} sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                                <Typography fontWeight="bold">Teléfono</Typography>
                                <Typography variant="body2" color="text.secondary">+57 300 123 4567</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                             <Icon component={LocationOnIcon} sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                                <Typography fontWeight="bold">Ubicación</Typography>
                                <Typography variant="body2" color="text.secondary">Bogotá, Colombia</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Contact Form Section */}
                    <Grid item xs={12} md={7}>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth required id="name" name="name" label="Nombre Completo" value={formData.name} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth required id="email" name="email" type="email" label="Correo Electrónico" value={formData.email} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth required id="subject" name="subject" label="Asunto" value={formData.subject} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth required id="message" name="message" label="Tu Mensaje" multiline rows={6} value={formData.message} onChange={handleChange} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Mensaje'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default ContactPage;
