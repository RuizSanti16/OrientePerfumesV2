/* Catálogo de notas olfativas, agrupadas por familia.

   Escribir cada nota a mano en un campo de texto libre llevaba a que
   el mismo ingrediente acabara escrito de tres formas: "Bergamota",
   "bergamota" y "Bergamotta". Con la lista delante se elige en vez de
   teclear, y las notas quedan iguales en todos los perfumes, que es
   lo que hace falta para que algún día se pueda buscar por ellas.

   El campo de texto sigue ahí: esto es una ayuda, no una jaula. Una
   casa de nicho puede usar un ingrediente que no esté en la lista. */

export const FAMILIAS_NOTAS = [
  {
    familia: 'Cítricos',
    color: '#D9C05A',
    notas: [
      'Bergamota', 'Limón', 'Lima', 'Naranja', 'Mandarina', 'Pomelo',
      'Neroli', 'Petitgrain', 'Yuzu', 'Cidra', 'Kumquat', 'Naranja Sanguina',
    ],
  },
  {
    familia: 'Florales',
    color: '#D98FA8',
    notas: [
      'Rosa', 'Rosa Damascena', 'Jazmín', 'Jazmín Sambac', 'Azahar',
      'Flor de Naranjo', 'Ylang-Ylang', 'Lavanda', 'Violeta', 'Iris',
      'Lirio', 'Magnolia', 'Peonía', 'Gardenia', 'Tuberosa', 'Narciso',
      'Mimosa', 'Freesia', 'Geranio', 'Osmanthus', 'Flor de Loto',
    ],
  },
  {
    familia: 'Frutales',
    color: '#D98A5A',
    notas: [
      'Manzana', 'Pera', 'Melocotón', 'Albaricoque', 'Ciruela', 'Cereza',
      'Frambuesa', 'Fresa', 'Mora', 'Grosella Negra', 'Piña', 'Mango',
      'Coco', 'Higo', 'Melón', 'Lichi', 'Uva', 'Dátil',
    ],
  },
  {
    familia: 'Especias',
    color: '#C4664C',
    notas: [
      'Pimienta Negra', 'Pimienta Rosa', 'Cardamomo', 'Canela', 'Clavo',
      'Nuez Moscada', 'Jengibre', 'Azafrán', 'Comino', 'Anís', 'Cilantro',
      'Cúrcuma', 'Pimentón',
    ],
  },
  {
    familia: 'Maderas',
    color: '#A8865A',
    notas: [
      'Sándalo', 'Cedro', 'Oud', 'Agarwood', 'Vetiver', 'Pachulí',
      'Palo Santo', 'Guayaco', 'Abedul', 'Roble', 'Bambú', 'Papiro',
      'Madera de Cachemira', 'Notas Amaderadas',
    ],
  },
  {
    familia: 'Orientales y Resinas',
    color: '#C9A84C',
    notas: [
      'Ámbar', 'Ámbar Gris', 'Incienso', 'Mirra', 'Benjuí', 'Olíbano',
      'Labdanum', 'Opoponaco', 'Elemi', 'Estoraque',
    ],
  },
  {
    familia: 'Dulces y Gourmand',
    color: '#B5835A',
    notas: [
      'Vainilla', 'Vainilla Bourbon', 'Caramelo', 'Chocolate', 'Cacao',
      'Café', 'Miel', 'Praliné', 'Almendra', 'Avellana', 'Regaliz',
      'Azúcar Moreno', 'Malvavisco', 'Ron',
    ],
  },
  {
    familia: 'Almizcles y Animales',
    color: '#9A9180',
    notas: [
      'Almizcle', 'Almizcle Blanco', 'Civeta', 'Castóreo', 'Cuero',
      'Ambroxan', 'Cashmeran', 'Iso E Super',
    ],
  },
  {
    familia: 'Verdes y Aromáticas',
    color: '#8BA87A',
    notas: [
      'Menta', 'Albahaca', 'Romero', 'Salvia', 'Tomillo', 'Hierbabuena',
      'Té Verde', 'Té Negro', 'Hojas de Violeta', 'Hierba Recién Cortada',
      'Galbanum', 'Eucalipto', 'Artemisa',
    ],
  },
  {
    familia: 'Marinas y Frescas',
    color: '#7AA2B5',
    notas: [
      'Notas Marinas', 'Sal Marina', 'Algas', 'Brisa Marina', 'Ozono',
      'Agua de Lluvia', 'Notas Acuáticas', 'Calone',
    ],
  },
];

/* Todas las notas en una sola lista, para buscar y para comprobar si
   algo escrito a mano ya existe en el catálogo. */
export const TODAS_LAS_NOTAS = FAMILIAS_NOTAS.flatMap(f => f.notas);

/** Busca notas por texto, sin distinguir mayúsculas ni tildes. */
export function buscarNotas(texto, limite = 12) {
  const q = quitarTildes(texto.trim().toLowerCase());
  if (!q) return [];
  return TODAS_LAS_NOTAS
    .filter(n => quitarTildes(n.toLowerCase()).includes(q))
    .slice(0, limite);
}

/** La familia a la que pertenece una nota, o null. */
export function familiaDeNota(nota) {
  const n = quitarTildes(String(nota).trim().toLowerCase());
  const f = FAMILIAS_NOTAS.find(fam =>
    fam.notas.some(x => quitarTildes(x.toLowerCase()) === n)
  );
  return f || null;
}

function quitarTildes(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
