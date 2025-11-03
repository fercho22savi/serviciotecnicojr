
import { useReducer } from 'react';

const initialState = {
    values: {
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: 'CL',
        cardName: '',
        cardNumber: '',
        expDate: '',
        cvv: '',
        saveAddress: false,
        saveCardInfo: false,
    },
    errors: {},
    touched: {},
};

function checkoutReducer(state, action) {
    switch (action.type) {
        case 'SET_FIELD_VALUE':
            return {
                ...state,
                values: {
                    ...state.values,
                    [action.payload.field]: action.payload.value,
                },
            };
        case 'SET_FIELD_TOUCHED':
            return {
                ...state,
                touched: {
                    ...state.touched,
                    [action.payload.field]: true,
                },
            };
        case 'SET_FORM_VALUES':
            return {
                ...state,
                values: { ...state.values, ...action.payload },
            };
        case 'SET_ERRORS':
            return {
                ...state,
                errors: action.payload,
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                errors: {},
            };
        default:
            return state;
    }
}

const validationRules = {
    shipping: {
        firstName: (val) => val.trim() ? null : 'El nombre es requerido',
        lastName: (val) => val.trim() ? null : 'El apellido es requerido',
        address1: (val) => val.trim() ? null : 'La dirección es requerida',
        city: (val) => val.trim() ? null : 'La ciudad es requerida',
        state: (val) => val.trim() ? null : 'La región es requerida',
        zip: (val) => /^[0-9]{7}$/.test(val) ? null : 'El código postal debe tener 7 dígitos',
    },
    payment: {
        cardName: (val) => val.trim() ? null : 'El nombre del titular es requerido',
        cardNumber: (val) => /^[0-9]{16}$/.test(val.replace(/\s/g, '')) ? null : 'El número de tarjeta debe tener 16 dígitos',
        expDate: (val) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(val) ? null : 'La fecha debe estar en formato MM/AA',
        cvv: (val) => /^[0-9]{3,4}$/.test(val) ? null : 'El CVV debe tener 3 o 4 dígitos',
    }
};


export function useCheckoutForm() {
    const [state, dispatch] = useReducer(checkoutReducer, initialState);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        dispatch({
            type: 'SET_FIELD_VALUE',
            payload: { field: name, value: fieldValue },
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        dispatch({ type: 'SET_FIELD_TOUCHED', payload: { field: name } });
    };
    
    const validateStep = (step) => {
        const rules = validationRules[step];
        if (!rules) return true;

        let hasErrors = false;
        const newErrors = {};
        
        for (const field in rules) {
            const error = rules[field](state.values[field]);
            if (error) {
                hasErrors = true;
                newErrors[field] = error;
            }
        }

        dispatch({ type: 'SET_ERRORS', payload: newErrors });
        return !hasErrors;
    };

    const setFormValues = (newValues) => {
        dispatch({ type: 'SET_FORM_VALUES', payload: newValues });
    };
    
    const clearErrors = () => {
        dispatch({ type: 'CLEAR_ERRORS' });
    };

    return {
        ...state,
        handleChange,
        handleBlur,
        validateStep,
        setFormValues,
        clearErrors,
    };
}
