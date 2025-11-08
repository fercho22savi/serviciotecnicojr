
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './config';

const productsData = [
  // Ventiladores Solares
  {
    name: 'Ventilador Solar de Techo 12V con Panel Solar 25W',
    category: 'Ventiladores Solares',
    price: 350000,
    originalPrice: 420000,
    stock: 15,
    installments: 12,
    images: [
      'https://m.media-amazon.com/images/I/71I2b-2o1QL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71N8-c4e2dL._AC_SL1500_.jpg'
    ],
    description: 'Potente ventilador de techo de 42 pulgadas, ideal para cabañas, fincas o lugares sin acceso a red eléctrica. Incluye panel solar de 25W y control remoto.',
    specifications: {
      voltage: '12V DC',
      panel: '25W Policristalino',
      size: '42 pulgadas',
      control: 'Remoto incluido'
    }
  },
  {
    name: 'Ventilador Solar Portátil para Camping',
    category: 'Ventiladores Solares',
    price: 180000,
    stock: 30,
    installments: 6,
    images: [
      'https://m.media-amazon.com/images/I/71p4+a-4pGL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81B-gJt-z6L._AC_SL1500_.jpg'
    ],
    description: 'Ventilador de 10 pulgadas con batería recargable, panel solar incorporado y puerto USB para cargar dispositivos. Perfecto para llevar a todas partes.',
    specifications: {
      battery: '10000mAh Recargable',
      panel: '5W Integrado',
      size: '10 pulgadas',
      ports: 'USB-A de salida'
    }
  },
  // Repuestos de TV - Tarjetas
  {
    name: 'Tarjeta Main Board para TV LG 42LN5700',
    category: 'Repuestos de TV',
    price: 250000,
    stock: 8,
    installments: 12,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_833631-MCO48784262175_012022-O.webp',
    ],
    description: 'Tarjeta principal (main board) original para televisores LG, modelo 42LN5700. Soluciona problemas de encendido, puertos HDMI y software.',
    specifications: {
      model: 'EAX64797003(1.2)',
      brand: 'LG',
      compatible: '42LN5700, 47LN5700, 50LN5700'
    }
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
    description: 'Tarjeta T-Con (Timing Control) para televisores Samsung de 40 pulgadas, modelo UN40J5200. Repuesto para fallas de imagen, líneas verticales o colores distorsionados.',
    specifications: {
      model: 'V400HJ6-PE1',
      brand: 'Samsung',
      compatible: 'UN40J5200, UN40J520D'
    }
  },
  {
    name: 'Tarjeta de Fuente para TV Sony KDL-40R475A',
    category: 'Repuestos de TV',
    price: 190000,
    stock: 10,
    installments: 12,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_754701-MCO48784180454_012022-O.webp'
    ],
    description: 'Tarjeta de fuente de alimentación para televisores Sony Bravia. Soluciona problemas de encendido o apagados inesperados.',
    specifications: {
      model: 'ACDP-085N02',
      brand: 'Sony',
      compatible: 'KDL-40R475A, KDL-40R477A'
    }
  },
  // Repuestos de TV - LEDs
  {
    name: 'Kit Completo de Tiras LED para TV Samsung 55NU7100',
    category: 'Repuestos de TV',
    price: 160000,
    stock: 25,
    installments: 6,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_830386-MCO46898748723_072021-O.webp'
    ],
    description: 'Set completo de tiras LED para retroiluminación de televisores Samsung, modelo 55NU7100. Soluciona problemas de pantalla oscura o zonas sin iluminación.',
    specifications: {
      strips: '2 tiras de 40 LEDs cada una',
      brand: 'Samsung',
      model: 'AOT_55_NU7100_2X40_3030C'
    }
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
    description: 'Regleta de retroiluminación LED individual compatible con varios modelos de televisores Samsung de 32 pulgadas de la serie J (J4000, J5200, etc).',
    specifications: {
      strips: '1 regleta',
      brand: 'Samsung',
      compatible: 'Serie J (32 pulgadas)'
    }
  },
  {
    name: 'Kit de Tiras LED para TV LG 49UJ6300',
    category: 'Repuestos de TV',
    price: 130000,
    originalPrice: 160000,
    stock: 18,
    installments: 6,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_799339-MCO47895283925_102021-O.webp'
    ],
    description: 'Kit de 4 tiras LED para la retroiluminación de televisores LG de 49 pulgadas, modelo UJ6300.',
    specifications: {
      strips: '4 tiras (2xA, 2xB)',
      brand: 'LG',
      compatible: '49UJ6300, 49LJ5500'
    }
  },
  // Bombillas LED Solares
  {
    name: 'Bombilla Solar LED Portátil con Gancho para Camping',
    category: 'Bombillas Solares',
    price: 55000,
    stock: 40,
    installments: 3,
    images: [
      'https://m.media-amazon.com/images/I/71-Q4q-rBKL._AC_SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71v-x7G1z2L._AC_SL1500_.jpg'
    ],
    description: 'Bombilla LED recargable con panel solar, 5 modos de iluminación y control remoto. Ideal para emergencias, camping o jardines.',
    specifications: {
      power: '12W',
      battery: '3.7V 1200mAh',
      modes: '5 (Alto, Medio, Bajo, SOS, Estroboscópico)'
    }
  },
  {
    name: 'Set de 4 Bombillas Solares para Jardín tipo Estaca',
    category: 'Bombillas Solares',
    price: 110000,
    stock: 22,
    installments: 6,
    images: [
      'https://m.media-amazon.com/images/I/71u1Y-QJqJL._AC_SL1500_.jpg'
    ],
    description: 'Paquete de 4 luces solares tipo estaca para iluminar caminos, patios y jardines. Encendido y apagado automático.',
    specifications: {
      protection: 'IP65 (Resistente al agua)',
      autonomy: '8-10 horas',
      material: 'Acero inoxidable'
    }
  },
  // Controles Remotos
  {
    name: 'Control Remoto Magic para TV LG con Puntero',
    category: 'Accesorios de TV',
    price: 95000,
    originalPrice: 120000,
    stock: 28,
    installments: 6,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_992298-MCO48783688177_012022-O.webp'
    ],
    description: 'Control remoto Magic original para televisores LG Smart TV. Incluye puntero, scroll y comandos de voz para una navegación intuitiva.',
    specifications: {
      model: 'AN-MR19BA',
      brand: 'LG',
      features: 'Puntero, Scroll, Comandos de Voz'
    }
  },
  {
    name: 'Control Remoto One Remote para TV Samsung Smart',
    category: 'Accesorios de TV',
    price: 85000,
    stock: 35,
    installments: 6,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_890334-MCO48783783167_012022-O.webp'
    ],
    description: 'Control remoto inteligente "One Remote" para televisores Samsung. Diseño minimalista y control de múltiples dispositivos.',
    specifications: {
      model: 'BN59-01266A',
      brand: 'Samsung',
      features: 'Control por voz, Diseño metálico'
    }
  },
  // Paneles Solares
  {
    name: 'Panel Solar Monocristalino de 100W',
    category: 'Paneles Solares',
    price: 450000,
    stock: 10,
    installments: 12,
    images: [
      'https://m.media-amazon.com/images/I/81b2P03P90L._AC_SL1500_.jpg'
    ],
    description: 'Panel solar de alta eficiencia de 100W, ideal para sistemas de 12V en caravanas, botes o sistemas de respaldo de energía.',
    specifications: {
      type: 'Monocristalino',
      power: '100W',
      voltage: '18V (nominal)',
      dimensions: '100cm x 67cm x 3cm'
    }
  },
  {
    name: 'Kit Panel Solar 20W con Controlador de Carga',
    category: 'Paneles Solares',
    price: 280000,
    stock: 14,
    installments: 12,
    images: [
      'https://m.media-amazon.com/images/I/81+3tW4wYDL._AC_SL1500_.jpg'
    ],
    description: 'Kit solar básico que incluye un panel de 20W y un controlador de carga de 10A para proteger tu batería. Ideal para pequeños proyectos.',
    specifications: {
      type: 'Policristalino',
      power: '20W',
      controller: '10A PWM'
    }
  },
  // Inversores de Corriente
  {
    name: 'Inversor de Corriente Onda Pura 1000W 12V a 110V',
    category: 'Inversores',
    price: 750000,
    originalPrice: 850000,
    stock: 8,
    installments: 24,
    images: [
      'https://m.media-amazon.com/images/I/71jG+-gNXtL._AC_SL1500_.jpg'
    ],
    description: 'Inversor de onda sinusoidal pura de 1000W continuos y 2000W pico. Convierte 12V DC a 110V AC para alimentar equipos sensibles como laptops y electrodomésticos.',
    specifications: {
      power: '1000W (2000W pico)',
      input: '12V DC',
      output: '110V AC',
      waveform: 'Onda Pura'
    }
  },
  {
    name: 'Inversor de Corriente para Auto 300W 12V a 110V',
    category: 'Inversores',
    price: 150000,
    stock: 20,
    installments: 6,
    images: [
      'https://m.media-amazon.com/images/I/71ZtV5B-p9L._AC_SL1500_.jpg'
    ],
    description: 'Inversor compacto de 300W que se conecta al encendedor del auto. Ideal para cargar portátiles, cámaras y otros dispositivos en la carretera.',
    specifications: {
      power: '300W',
      input: '12V DC',
      output: '110V AC + 2 Puertos USB'
    }
  },
  // Baterías
  {
    name: 'Batería de Gel Ciclo Profundo 100Ah 12V',
    category: 'Baterías',
    price: 980000,
    stock: 5,
    installments: 24,
    images: [
      'https://m.media-amazon.com/images/I/61m-rZJ-gNL._AC_SL1024_.jpg'
    ],
    description: 'Batería de gel de ciclo profundo, 100Ah y 12V. Libre de mantenimiento, ideal para sistemas solares y de respaldo (UPS). Larga vida útil.',
    specifications: {
      type: 'Gel Ciclo Profundo',
      capacity: '100Ah',
      voltage: '12V'
    }
  },
  // Cables y Conectores
  {
    name: 'Par de Conectores MC4 para Panel Solar',
    category: 'Accesorios Solares',
    price: 15000,
    stock: 100,
    installments: 0,
    images: [
      'https://m.media-amazon.com/images/I/61Lz+tL3G3L._AC_SL1500_.jpg'
    ],
    description: 'Conectores MC4 macho/hembra para una conexión segura y a prueba de agua entre paneles solares y cables de extensión.',
    specifications: {
      type: 'MC4',
      rating: 'IP67'
    }
  },
  {
    name: 'Cable de Extensión Solar 10AWG con Conectores MC4 (10 metros)',
    category: 'Accesorios Solares',
    price: 90000,
    stock: 30,
    installments: 3,
    images: [
      'https://m.media-amazon.com/images/I/71N-r6g74jL._AC_SL1500_.jpg'
    ],
    description: 'Cable de extensión de 10 metros, calibre 10AWG, resistente a los rayos UV y a la intemperie, con conectores MC4 preinstalados.',
    specifications: {
      length: '10 metros',
      gauge: '10AWG',
      connectors: 'MC4'
    }
  },
  {
    name: 'Antena Wi-Fi para Smart TV Samsung',
    category: 'Accesorios de TV',
    price: 65000,
    stock: 40,
    installments: 3,
    images: [
      'https://http2.mlstatic.com/D_NQ_NP_622119-MCO48784303362_012022-O.webp'
    ],
    description: 'Módulo de antena Wi-Fi interna para televisores Samsung Smart TV. Soluciona problemas de conexión a internet o señal débil.',
    specifications: {
      brand: 'Samsung',
      compatible: 'Varios modelos (consultar)'
    }
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
