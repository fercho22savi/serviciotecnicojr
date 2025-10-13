import React from 'react';
import {
    Box,
    Typography,
    Slider,
    FormControlLabel,
    Switch,
    Paper
} from '@mui/material';

const FilterSidebar = ({ priceRange, onPriceChange, inStockOnly, onInStockChange, maxPrice }) => {

    const handlePriceChange = (event, newValue) => {
        onPriceChange(newValue);
    };

    const handleStockChange = (event) => {
        onInStockChange(event.target.checked);
    };

    // Function to format the slider's value label
    const valuetext = (value) => {
        return `$${value.toLocaleString('es-CO')}`;
    }

    return (
        <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Filtros
            </Typography>
            
            {/* Price Range Filter */}
            <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                    Rango de Precios
                </Typography>
                <Slider
                    value={priceRange}
                    onChange={handlePriceChange}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                    valueLabelFormat={valuetext}
                    min={0}
                    max={maxPrice}
                    step={50000} // Increments of 50,000 COP
                    sx={{ mt: 3 }}
                />
            </Box>

            {/* Stock Filter */}
            <Box sx={{ mt: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={inStockOnly}
                            onChange={handleStockChange}
                            name="inStockOnly"
                        />
                    }
                    label="Mostrar solo en stock"
                />
            </Box>
        </Paper>
    );
};

export default FilterSidebar;
