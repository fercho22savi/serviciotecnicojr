
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const PaymentMethods = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const fetchPaymentMethods = async () => {
            setLoading(true);
            try {
                const methodsRef = collection(db, 'users', currentUser.uid, 'paymentMethods');
                const snapshot = await getDocs(methodsRef);
                const methods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPaymentMethods(methods);
            } catch (error) {
                console.error("Error fetching payment methods: ", error);
                toast.error(t('paymentMethods.fetch_error'));
            }
            setLoading(false);
        };
        fetchPaymentMethods();
    }, [currentUser, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCard(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        // Basic validation
        if (!newCard.number || !newCard.expiry || !newCard.cvv) {
            toast.error(t('paymentMethods.fill_all_fields'));
            return;
        }

        setLoading(true);
        try {
            const methodsRef = collection(db, 'users', currentUser.uid, 'paymentMethods');
            const docRef = await addDoc(methodsRef, newCard);
            setPaymentMethods(prev => [...prev, { id: docRef.id, ...newCard }]);
            setNewCard({ number: '', expiry: '', cvv: '' });
            toast.success(t('paymentMethods.add_success'));
        } catch (error) {
            console.error("Error adding payment method: ", error);
            toast.error(t('paymentMethods.add_error'));
        }
        setLoading(false);
    };

    const handleDeleteCard = async (id) => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'paymentMethods', id));
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
            toast.success(t('paymentMethods.delete_success'));
        } catch (error) {
            console.error("Error deleting payment method: ", error);
            toast.error(t('paymentMethods.delete_error'));
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('paymentMethods.title')}</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('paymentMethods.add_new')}</h2>
                <form onSubmit={handleAddCard}>
                    <div className="mb-4">
                        <label htmlFor="number" className="block text-sm font-medium text-gray-700">{t('paymentMethods.card_number')}</label>
                        <input type="text" name="number" id="number" value={newCard.number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">{t('paymentMethods.expiry_date')}</label>
                            <input type="text" name="expiry" id="expiry" value={newCard.expiry} onChange={handleInputChange} placeholder="MM/YY" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">{t('paymentMethods.cvv')}</label>
                            <input type="text" name="cvv" id="cvv" value={newCard.cvv} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50">
                        {loading ? t('paymentMethods.saving') : t('paymentMethods.save_card')}
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">{t('paymentMethods.saved_cards')}</h2>
                {loading && <p>{t('paymentMethods.loading')}</p>}
                <div className="space-y-4">
                    {paymentMethods.map(method => (
                        <div key={method.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                            <p>**** **** **** {method.number.slice(-4)}</p>
                            <p>{method.expiry}</p>
                            <button onClick={() => handleDeleteCard(method.id)} disabled={loading} className="text-red-500 hover:text-red-700 disabled:opacity-50">{t('common.delete')}</button>
                        </div>
                    ))}
                    {!loading && paymentMethods.length === 0 && <p>{t('paymentMethods.no_saved_cards')}</p>}
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
