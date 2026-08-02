/* =============================================================
   theme.js — Paleta del panel de administración.

   El panel usaba azules, morados y verdes vivos que no encajaban con
   la identidad de la tienda: dorado sobre negro. Se sustituyen por una
   escala cálida de metales y maderas, en la línea de las notas que
   vende la marca (ámbar, sándalo, oud).

   Los tres últimos conservan su significado —correcto, aviso, alerta—
   porque comunican estado y no son decorativos; simplemente se apagan
   para convivir con el resto.
============================================================= */

export const PALETA = {
  oro:       '#C9A84C',   // dorado de marca
  champan:   '#DCC68B',   // oro pálido
  bronce:    '#B98D55',   // sándalo / madera
  salvia:    '#9AAB80',   // todo correcto
  ambar:     '#E0A458',   // requiere atención
  terracota: '#C4664C',   // alerta
};

/* Mismos tonos en rgba, para fondos y bordes translúcidos. */
export const PALETA_RGB = {
  oro:       '201,168,76',
  champan:   '220,198,139',
  bronce:    '185,141,85',
  salvia:    '154,171,128',
  ambar:     '224,164,88',
  terracota: '196,102,76',
};
