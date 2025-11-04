const fs = require('fs').promises;
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'db.json');

let database = {
  categories: [],
  products: [],
  keranjangs: [],
  pesanans: [],
};

let isInitialized = false;

const saveDatabase = async () => {
  await fs.writeFile(DB_PATH, JSON.stringify(database, null, 2), 'utf8');
};

const loadDatabase = async () => {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    database = JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await saveDatabase();
    } else {
      throw error;
    }
  }
};

const init = async () => {
  if (isInitialized) {
    return;
  }

  await loadDatabase();
  isInitialized = true;
};

const nextId = (collectionName) => {
  const collection = database[collectionName];
  if (!collection.length) {
    return 1;
  }

  const maxId = collection.reduce((max, item) => {
    const id = Number(item.id);
    return Number.isNaN(id) ? max : Math.max(max, id);
  }, 0);

  return maxId + 1;
};

const getCategories = () => database.categories;

const getProducts = (categoryName) => {
  if (!categoryName) {
    return database.products;
  }

  return database.products.filter(
    (product) => product.category && product.category.nama === categoryName,
  );
};

const getKeranjangs = (productId) => {
  if (!productId) {
    return database.keranjangs;
  }

  return database.keranjangs.filter(
    (item) => item.product && Number(item.product.id) === Number(productId),
  );
};

const addKeranjang = async (keranjang) => {
  const newKeranjang = {
    ...keranjang,
    id: nextId('keranjangs'),
  };

  database.keranjangs.push(newKeranjang);
  await saveDatabase();
  return newKeranjang;
};

const updateKeranjang = async (id, keranjang) => {
  const index = database.keranjangs.findIndex(
    (item) => Number(item.id) === Number(id),
  );

  if (index === -1) {
    return null;
  }

  database.keranjangs[index] = {
    ...database.keranjangs[index],
    ...keranjang,
    id: database.keranjangs[index].id,
  };

  await saveDatabase();
  return database.keranjangs[index];
};

const deleteKeranjang = async (id) => {
  const originalLength = database.keranjangs.length;
  database.keranjangs = database.keranjangs.filter(
    (item) => Number(item.id) !== Number(id),
  );

  if (database.keranjangs.length === originalLength) {
    return false;
  }

  await saveDatabase();
  return true;
};

const getPesanans = () => database.pesanans;

const addPesanan = async (pesanan) => {
  const newPesanan = {
    ...pesanan,
    id: nextId('pesanans'),
  };

  database.pesanans.push(newPesanan);
  await saveDatabase();
  return newPesanan;
};

const clearKeranjang = async () => {
  database.keranjangs = [];
  await saveDatabase();
};

module.exports = {
  init,
  getCategories,
  getProducts,
  getKeranjangs,
  addKeranjang,
  updateKeranjang,
  deleteKeranjang,
  getPesanans,
  addPesanan,
  clearKeranjang,
};
