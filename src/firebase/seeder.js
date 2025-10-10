
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './config';

const productsData = [
  // Ventiladores Solares
  {
    name: 'Ventilador Solar de Techo 12V con Panel Solar',
    category: 'Ventiladores Solares',
    price: 350000,
    originalPrice: 420000,
    stock: 15,
    installments: 12,
    images: [
      'https://m.media-amazon.com/images/I/71I2b-2o1QL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71N8-c4e2dL._AC_SL1500_.jpg'
    ],
    description: 'Potente ventilador de techo de 42 pulgadas, ideal para cabañas, fincas o lugares sin acceso a red eléctrica. Incluye panel solar de 25W y control remoto.'
  },
  {
    name: 'Ventilador Solar Portátil para Camping y Exteriores',
    category: 'Ventiladores Solares',
    price: 180000,
    stock: 30,
    installments: 6,
    images: [
      'https://m.media-amazon.com/images/I/71p4+a-4pGL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81B-gJt-z6L._AC_SL1500_.jpg'
    ],
    description: 'Ventilador de 10 pulgadas con batería recargable, panel solar incorporado y puerto USB para cargar dispositivos. Perfecto para llevar a todas partes.'
  },
  // Tarjetas de TV
  {
    name: 'Tarjeta Main Board para TV LG 42LN5700',
    category: 'Repuestos de TV',
    price: 250000,
    stock: 8,
    installments: 12,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_833631-MCO48784262175_012022-O.webp',
    ],
    description: 'Tarjeta principal (main board) original para televisores LG, modelo 42LN5700. Soluciona problemas de encendido, puertos HDMI y software.'
  },
  {
    name: 'Tarjeta T-Con para TV Samsung UN40J5200',
    category: 'Repuestos de TV',
    price: 120000,
    originalPrice: 150000,
    stock: 12,
    installments: 6,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_688195-MCO70634354238_072023-O.webp'
    ],
    description: 'Tarjeta T-Con (Timing Control) para televisores Samsung de 40 pulgadas, modelo UN40J5200. Repuesto para fallas de imagen, líneas verticales o colores distorsionados.'
  },
  // LEDs de TV Samsung
  {
    name: 'Kit Completo de Tiras LED para TV Samsung 55NU7100',
    category: 'Repuestos de TV',
    price: 160000,
    stock: 25,
    installments: 6,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_830386-MCO46898748723_072021-O.webp'
    ],
    description: 'Set completo de tiras LED para retroiluminación de televisores Samsung, modelo 55NU7100. Soluciona problemas de pantalla oscura o zonas sin iluminación.'
  },
   {
    name: 'Regleta LED individual para TV Samsung 32" Serie J',
    category: 'Repuestos de TV',
    price: 45000,
    stock: 50,
    installments: 3,
    images: [
      'https://m.media-amazon.com/images/I/61F9bH9qY2L._AC_SL1500_.jpg'
    ],
    description: 'Regleta de retroiluminación LED individual compatible con varios modelos de televisores Samsung de 32 pulgadas de la serie J (J4000, J5200, etc).'
  }
];

export const seedDatabase = async () => {
  try {
    const productsCollection = collection(db, 'products');
    const snapshot = await getDocs(productsCollection);
    
    if (snapshot.empty) {
      console.log('Base de datos vacía, añadiendo productos de ejemplo...');
      for (const product of productsData) {
        await addDoc(productsCollection, product);
      }
      console.log('¡Productos de ejemplo añadidos con éxito!');
    } else {
      console.log('La base de datos ya contiene productos. No se requiere carga inicial.');
    }
  } catch (error) {
    console.error("Error en la carga inicial de la base de datos: ", error);
  }
};
