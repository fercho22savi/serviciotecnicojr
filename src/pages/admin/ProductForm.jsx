import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/config'; // Asegúrate de que la ruta sea correcta
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isNew = productId === 'new';

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    // Añade aquí otros campos que necesites
  });

  useEffect(() => {
    if (!isNew) {
      const fetchProduct = async () => {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log('No such document!');
        }
      };
      fetchProduct();
    }
  }, [productId, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await addDoc(collection(db, 'products'), product);
      } else {
        const docRef = doc(db, 'products', productId);
        await updateDoc(docRef, product);
      }
      navigate('/admin/products'); // Redirige a la lista de productos
    } catch (error) {
      console.error('Error saving product: ', error);
    }
  };

  return (
    <div>
      <h2>{isNew ? 'Crear Producto' : 'Editar Producto'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Aquí irían los campos del formulario */}
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default ProductForm;
