import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';

// Un componente "ficticio" que no obtiene ningún dato.
// Esto es para fines de diagnóstico.

const StatCard = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', borderRadius: 2, height: '100%' }}>
        <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: color, color: 'white', mr: 2}}>
            {icon}
        </Box>
        <Box>
            <Typography color="textSecondary" gutterBottom>{title}</Typography>
            <Typography variant="h5" component="h2" fontWeight="bold">{value}</Typography>
        </Box>
    </Paper>
);

function AdminDashboard() {

    // Este componente ya no tiene useEffect, useState para datos, ni ninguna lógica de obtención.
    // Simplemente renderiza tarjetas estáticas con datos de marcador de posición.

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
             <Typography variant="h6" sx={{mb: 2}}>Panel de Administración (Modo de Diagnóstico)</Typography>
             <Typography sx={{mb: 2}}>Si puedes ver esto, significa que el problema está en la obtención de datos de Firestore.</Typography>
            <Grid container spacing={3}>
                {/* Tarjetas de estadísticas con datos ficticios */}
                <Grid item xs={12} sm={4}><StatCard title="Ingresos Totales" value={`$0.00`} icon={<MonetizationOnIcon />} color="#4caf50" /></Grid>
                <Grid item xs={12} sm={4}><StatCard title="Pedidos Totales" value={0} icon={<ShoppingCartIcon />} color="#2196f3" /></Grid>
                <Grid item xs={12} sm={4}><StatCard title="Clientes Totales" value={0} icon={<PeopleIcon />} color="#f44336" /></Grid>
            </Grid>
        </Box>
    );
}

export default AdminDashboard;
