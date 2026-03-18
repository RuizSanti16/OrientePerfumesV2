/* =============================================================
   OrientPerfumes — Admin Data Layer
   CRUD con localStorage · Prefijo: op_admin_db
   ============================================================= */

const DB_KEY = 'op_admin_db';

const DEFAULT_DATA = {
  products: [
    { id: '1', name: 'Black Orchid', brand: 'Tom Ford', category: 'Eau de Parfum',
      description: 'Una fragancia lujosa y sensual con acordes oscuros y ricos.',
      price: 180, stock: 30,
      images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600'],
      featured: true },
    { id: '2', name: 'Guilty Pour Homme', brand: 'Gucci', category: 'Eau de Toilette',
      description: 'Un fougère contemporáneo que desafía las convenciones.',
      price: 95, stock: 75,
      images: ['https://images.unsplash.com/photo-1594035910387-fea081de081b?w=600'],
      featured: false },
    { id: '3', name: 'Libre Eau de Parfum', brand: 'Yves Saint Laurent', category: 'Eau de Parfum',
      description: 'El aroma de la libertad.',
      price: 110, stock: 55,
      images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600'],
      featured: true },
    { id: '4', name: 'Eros', brand: 'Versace', category: 'Eau de Toilette',
      description: 'Una fragancia para el hombre fuerte y apasionado.',
      price: 88, stock: 15,
      images: ['https://images.unsplash.com/photo-1600612253971-1e7b-0e73-6f76-bb61e3aaa17b?w=600'],
      featured: false },
    { id: '5', name: 'Bleu de Chanel', brand: 'Chanel', category: 'Eau de Parfum',
      description: 'Una fragancia audaz y despreocupada.',
      price: 145, stock: 40,
      images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600'],
      featured: true },
  ],
  categories: [
    { id: '1', name: 'Eau de Parfum',   description: 'Alta concentración aromática (15-20%)', image: '' },
    { id: '2', name: 'Eau de Toilette', description: 'Concentración media, ideal para uso diario (8-12%)', image: '' },
    { id: '3', name: 'Cologne',         description: 'Concentración ligera y fresca (2-5%)', image: '' },
    { id: '4', name: 'Gift Sets',       description: 'Sets regalo exclusivos', image: '' },
    { id: '5', name: 'Nicho',           description: 'Fragancias exclusivas de autor', image: '' },
  ],
  brands: [
    { id: '1', name: 'Chanel',             logo: '' },
    { id: '2', name: 'Dior',               logo: '' },
    { id: '3', name: 'Tom Ford',           logo: '' },
    { id: '4', name: 'Gucci',              logo: '' },
    { id: '5', name: 'Yves Saint Laurent', logo: '' },
    { id: '6', name: 'Versace',            logo: '' },
    { id: '7', name: 'Dolce & Gabbana',    logo: '' },
    { id: '8', name: 'Armani',             logo: '' },
  ],
  customers: [
    { id: '1', name: 'Ana García',       email: 'ana@email.com',    phone: '+34 612 345 678', address: 'Madrid, España',    totalPurchases: 3 },
    { id: '2', name: 'Carlos López',     email: 'carlos@email.com', phone: '+34 623 456 789', address: 'Barcelona, España', totalPurchases: 5 },
    { id: '3', name: 'María Rodríguez',  email: 'maria@email.com',  phone: '+34 634 567 890', address: 'Sevilla, España',   totalPurchases: 2 },
    { id: '4', name: 'Pedro Martínez',   email: 'pedro@email.com',  phone: '+34 645 678 901', address: 'Valencia, España',  totalPurchases: 7 },
  ],
  suppliers: [
    { id: '1', name: 'Luxury Fragrances SL', email: 'contacto@luxuryfrg.com',    phone: '+34 91 234 5678', address: 'Madrid, España',    products: 'Chanel, Dior' },
    { id: '2', name: 'Elite Perfumes SA',    email: 'info@eliteperfumes.com',     phone: '+34 93 345 6789', address: 'Barcelona, España', products: 'Tom Ford, Armani' },
    { id: '3', name: 'Orient Luxury BV',     email: 'orders@orientluxury.eu',     phone: '+31 20 456 7890', address: 'Amsterdam, Países Bajos', products: 'Versace, Gucci' },
  ],
  sales: [
    { id: '1', date: '2026-03-17', customerId: '1', customerName: 'Ana García',      items: [{ productId: '1', productName: 'Black Orchid',       qty: 1, price: 180 }], total: 180, status: 'completed' },
    { id: '2', date: '2026-03-16', customerId: '2', customerName: 'Carlos López',    items: [{ productId: '3', productName: 'Libre Eau de Parfum', qty: 1, price: 110 }, { productId: '4', productName: 'Eros', qty: 1, price: 88 }], total: 198, status: 'completed' },
    { id: '3', date: '2026-03-15', customerId: '3', customerName: 'María Rodríguez', items: [{ productId: '5', productName: 'Bleu de Chanel',      qty: 1, price: 145 }], total: 145, status: 'completed' },
  ],
  purchases: [
    { id: '1', date: '2026-03-01', supplierId: '1', supplierName: 'Luxury Fragrances SL', items: [{ productId: '5', productName: 'Bleu de Chanel', qty: 40, unitCost: 95 }], total: 3800, status: 'received' },
    { id: '2', date: '2026-02-20', supplierId: '2', supplierName: 'Elite Perfumes SA',    items: [{ productId: '1', productName: 'Black Orchid',   qty: 30, unitCost: 110 }], total: 3300, status: 'received' },
  ],
  orders: [
    { id: 'ORD-001', date: '2026-03-17', customerName: 'Ana García',      customerEmail: 'ana@email.com',    items: [], total: 290, status: 'pending',    shippingAddress: 'Madrid, España' },
    { id: 'ORD-002', date: '2026-03-16', customerName: 'Carlos López',    customerEmail: 'carlos@email.com', items: [], total: 183, status: 'processing', shippingAddress: 'Barcelona, España' },
    { id: 'ORD-003', date: '2026-03-15', customerName: 'María Rodríguez', customerEmail: 'maria@email.com',  items: [], total: 110, status: 'shipped',    shippingAddress: 'Sevilla, España' },
    { id: 'ORD-004', date: '2026-03-10', customerName: 'Pedro Martínez',  customerEmail: 'pedro@email.com',  items: [], total: 88,  status: 'delivered',  shippingAddress: 'Valencia, España' },
    { id: 'ORD-005', date: '2026-03-08', customerName: 'Laura Sánchez',   customerEmail: 'laura@email.com',  items: [], total: 145, status: 'delivered',  shippingAddress: 'Bilbao, España' },
  ],
  inventory: [
    { id: '1', date: '2026-03-01', productId: '1', productName: 'Black Orchid',       type: 'entrada',   quantity: 30,  reason: 'Compra inicial' },
    { id: '2', date: '2026-03-01', productId: '2', productName: 'Guilty Pour Homme',  type: 'entrada',   quantity: 75,  reason: 'Compra inicial' },
    { id: '3', date: '2026-03-01', productId: '3', productName: 'Libre Eau de Parfum',type: 'entrada',   quantity: 55,  reason: 'Compra inicial' },
    { id: '4', date: '2026-03-01', productId: '4', productName: 'Eros',               type: 'entrada',   quantity: 20,  reason: 'Compra inicial' },
    { id: '5', date: '2026-03-01', productId: '5', productName: 'Bleu de Chanel',     type: 'entrada',   quantity: 40,  reason: 'Compra inicial' },
    { id: '6', date: '2026-03-15', productId: '4', productName: 'Eros',               type: 'salida',    quantity: 5,   reason: 'Ventas' },
    { id: '7', date: '2026-03-17', productId: '1', productName: 'Black Orchid',       type: 'ajuste',    quantity: -2,  reason: 'Ajuste por daño' },
  ],
  adminUsers: [
    { id: '1', email: 'admin@perfumeria.com',   name: 'Administrator',  role: 'admin',   password: 'admin123' },
    { id: '2', email: 'manager@perfumeria.com', name: 'Store Manager',  role: 'manager', password: 'manager123' },
  ],
};

/* ── AdminDB object ─────────────────────────────────────────── */
var AdminDB = {
  _getDB: function () {
    var raw = localStorage.getItem(DB_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  },

  _saveDB: function (db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  init: function () {
    if (!this._getDB()) {
      this._saveDB(JSON.parse(JSON.stringify(DEFAULT_DATA)));
    }
  },

  reset: function () {
    this._saveDB(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  },

  get: function (entity) {
    var db = this._getDB() || DEFAULT_DATA;
    return db[entity] ? JSON.parse(JSON.stringify(db[entity])) : [];
  },

  getOne: function (entity, id) {
    var items = this.get(entity);
    return items.find(function (i) { return String(i.id) === String(id); }) || null;
  },

  create: function (entity, data) {
    var db = this._getDB() || JSON.parse(JSON.stringify(DEFAULT_DATA));
    if (!db[entity]) db[entity] = [];
    var newItem = Object.assign({}, data, { id: String(Date.now()) });
    db[entity].push(newItem);
    this._saveDB(db);
    return newItem;
  },

  update: function (entity, id, data) {
    var db = this._getDB() || JSON.parse(JSON.stringify(DEFAULT_DATA));
    if (!db[entity]) return null;
    var idx = db[entity].findIndex(function (i) { return String(i.id) === String(id); });
    if (idx === -1) return null;
    db[entity][idx] = Object.assign({}, db[entity][idx], data);
    this._saveDB(db);
    return db[entity][idx];
  },

  delete: function (entity, id) {
    var db = this._getDB() || JSON.parse(JSON.stringify(DEFAULT_DATA));
    if (!db[entity]) return;
    db[entity] = db[entity].filter(function (i) { return String(i.id) !== String(id); });
    this._saveDB(db);
  },
};
