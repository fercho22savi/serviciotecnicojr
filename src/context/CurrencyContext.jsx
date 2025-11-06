import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

// Fallback exchange rate in case the API call fails
const FALLBACK_EXCHANGE_RATE = 4000;

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('COP');
    const [exchangeRate, setExchangeRate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetching conversion rates from COP to other currencies
                const response = await fetch('https://open.er-api.com/v6/latest/COP');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (data.result === 'success' && data.rates.USD) {
                    setExchangeRate(1 / data.rates.USD); // We get COP per USD, so we invert it
                } else {
                    throw new Error('Invalid data from API');
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate:", err);
                setError(err.message);
                setExchangeRate(FALLBACK_EXCHANGE_RATE); // Use fallback rate on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchExchangeRate();
    }, []);

    const convertToUSD = useCallback((amountInCOP) => {
        if (isLoading || !exchangeRate) {
            // Return a sensible default or loading state if rate not ready
            return 0;
        }
        return amountInCOP / exchangeRate;
    }, [exchangeRate, isLoading]);

    const formatCurrency = (amount, targetCurrency) => {
        const effectiveCurrency = targetCurrency || currency;
        const locale = effectiveCurrency === 'COP' ? 'es-CO' : 'en-US';
        const options = {
            style: 'currency',
            currency: effectiveCurrency,
            minimumFractionDigits: effectiveCurrency === 'USD' ? 2 : 0,
            maximumFractionDigits: effectiveCurrency === 'USD' ? 2 : 0,
        };
        return new Intl.NumberFormat(locale, options).format(amount);
    };

    const value = {
        currency,
        setCurrency,
        exchangeRate,
        isLoadingRate: isLoading,
        rateError: error,
        convertToUSD,
        formatCurrency,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};