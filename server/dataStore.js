// Data Access Layer
// Contains all SQL queries and database logic
const db = require('./db');

/** 
 * Mapping functions transform SQL results into nested JSON
 * - mapProductRow: Adds category object to products
 * - mapKeranjangRow: Adds full product details to cart items
 * - mapPesananRows: Groups order items into menus array
 */
const mapProductRow = (row) => ({
  id: row.id,
  kode: row.kode,
  nama: row.nama,
  harga: row.harga,
  is_ready: row.is_ready,
  gambar: row.gambar,
  category: {
    id: row.category_id,
    nama: row.category_nama,
  },
});

const mapKeranjangRow = (row) => ({
  id: row.id,
  jumlah: row.jumlah,
  total_harga: row.total_harga,
  keterangan: row.keterangan,
  product: {
    id: row.product_id,
    kode: row.product_kode,
    nama: row.product_nama,
    harga: row.product_harga,
    is_ready: row.product_is_ready,
    gambar: row.product_gambar,
    category: {
      id: row.category_id,
      nama: row.category_nama,
    },
  },
});

const mapPesananRows = (rows) => {
  const pesananMap = new Map();

  rows.forEach((row) => {
    if (!row.pesanan_id) {
      return;
    }

    if (!pesananMap.has(row.pesanan_id)) {
      pesananMap.set(row.pesanan_id, {
        id: row.pesanan_id,
        total_bayar: row.total_bayar,
        created_at: row.created_at,
        menus: [],
      });
    }

    if (row.item_id) {
      const pesanan = pesananMap.get(row.pesanan_id);
      pesanan.menus.push({
        id: row.item_id,
        jumlah: row.item_jumlah,
        total_harga: row.item_total_harga,
        keterangan: row.item_keterangan,
        product: {
          id: row.product_id,
          kode: row.product_kode,
          nama: row.product_nama,
          harga: row.product_harga,
          is_ready: row.product_is_ready,
          gambar: row.product_gambar,
          category: {
            id: row.category_id,
            nama: row.category_nama,
          },
        },
      });
    }
  });

  return Array.from(pesananMap.values());
};

const init = async () => {
  await db.query('SELECT 1');
};

/**
 * CRUD operations for each entity:
 * - Categories: getCategories()
 * - Products: getProducts(categoryName)
 * - Cart: getKeranjangs(), addKeranjang(), updateKeranjang(), deleteKeranjang()
 * - Orders: getPesanans(), addPesanan() (uses transactions)
 */
const getCategories = async () => {
  const { rows } = await db.query(
    'SELECT id, nama FROM categories ORDER BY id ASC',
  );
  return rows;
};

const getProducts = async (categoryName) => {
  const params = [];
  let query = `
    SELECT
      p.id,
      p.kode,
      p.nama,
      p.harga,
      p.is_ready,
      p.gambar,
      c.id AS category_id,
      c.nama AS category_nama
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
  `;

  if (categoryName) {
    params.push(categoryName);
    query += ' WHERE c.nama = $1';
  }

  query += ' ORDER BY p.id ASC';

  const { rows } = await db.query(query, params);
  return rows.map(mapProductRow);
};

const getKeranjangById = async (id) => {
  const { rows } = await db.query(
    `
    SELECT
      k.id,
      k.jumlah,
      k.total_harga,
      k.keterangan,
      p.id AS product_id,
      p.kode AS product_kode,
      p.nama AS product_nama,
      p.harga AS product_harga,
      p.is_ready AS product_is_ready,
      p.gambar AS product_gambar,
      c.id AS category_id,
      c.nama AS category_nama
    FROM keranjangs k
    INNER JOIN products p ON p.id = k.product_id
    INNER JOIN categories c ON c.id = p.category_id
    WHERE k.id = $1
  `,
    [id],
  );

  if (!rows.length) {
    return null;
  }

  return mapKeranjangRow(rows[0]);
};

const getKeranjangs = async (productId) => {
  const params = [];
  let query = `
    SELECT
      k.id,
      k.jumlah,
      k.total_harga,
      k.keterangan,
      p.id AS product_id,
      p.kode AS product_kode,
      p.nama AS product_nama,
      p.harga AS product_harga,
      p.is_ready AS product_is_ready,
      p.gambar AS product_gambar,
      c.id AS category_id,
      c.nama AS category_nama
    FROM keranjangs k
    INNER JOIN products p ON p.id = k.product_id
    INNER JOIN categories c ON c.id = p.category_id
  `;

  if (productId) {
    params.push(productId);
    query += ' WHERE p.id = $1';
  }

  query += ' ORDER BY k.id ASC';

  const { rows } = await db.query(query, params);
  return rows.map(mapKeranjangRow);
};

const addKeranjang = async (keranjang) => {
  const { jumlah, total_harga, product, keterangan = null } = keranjang;

  const { rows } = await db.query(
    `
    INSERT INTO keranjangs (jumlah, total_harga, keterangan, product_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `,
    [jumlah, total_harga, keterangan, product.id],
  );

  return getKeranjangById(rows[0].id);
};

const updateKeranjang = async (id, keranjang) => {
  const { jumlah, total_harga, product, keterangan = null } = keranjang;

  const result = await db.query(
    `
    UPDATE keranjangs
    SET jumlah = $1,
        total_harga = $2,
        keterangan = $3,
        product_id = $4
    WHERE id = $5
    RETURNING id
  `,
    [jumlah, total_harga, keterangan, product.id, id],
  );

  if (!result.rows.length) {
    return null;
  }

  return getKeranjangById(result.rows[0].id);
};

const deleteKeranjang = async (id) => {
  const { rowCount } = await db.query('DELETE FROM keranjangs WHERE id = $1', [
    id,
  ]);

  return rowCount > 0;
};

const getPesananById = async (id) => {
  const { rows } = await db.query(
    `
    SELECT
      pe.id AS pesanan_id,
      pe.total_bayar,
      pe.created_at,
      pi.id AS item_id,
      pi.jumlah AS item_jumlah,
      pi.total_harga AS item_total_harga,
      pi.keterangan AS item_keterangan,
      p.id AS product_id,
      p.kode AS product_kode,
      p.nama AS product_nama,
      p.harga AS product_harga,
      p.is_ready AS product_is_ready,
      p.gambar AS product_gambar,
      c.id AS category_id,
      c.nama AS category_nama
    FROM pesanans pe
    LEFT JOIN pesanan_items pi ON pi.pesanan_id = pe.id
    LEFT JOIN products p ON p.id = pi.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE pe.id = $1
    ORDER BY pe.id DESC, pi.id ASC
  `,
    [id],
  );

  if (!rows.length) {
    return null;
  }

  return mapPesananRows(rows)[0];
};

const getPesanans = async () => {
  const { rows } = await db.query(
    `
    SELECT
      pe.id AS pesanan_id,
      pe.total_bayar,
      pe.created_at,
      pi.id AS item_id,
      pi.jumlah AS item_jumlah,
      pi.total_harga AS item_total_harga,
      pi.keterangan AS item_keterangan,
      p.id AS product_id,
      p.kode AS product_kode,
      p.nama AS product_nama,
      p.harga AS product_harga,
      p.is_ready AS product_is_ready,
      p.gambar AS product_gambar,
      c.id AS category_id,
      c.nama AS category_nama
    FROM pesanans pe
    LEFT JOIN pesanan_items pi ON pi.pesanan_id = pe.id
    LEFT JOIN products p ON p.id = pi.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    ORDER BY pe.id DESC, pi.id ASC
  `,
  );

  return mapPesananRows(rows);
};

// Transaction handling: The addPesanan function uses BEGIN/COMMIT/ROLLBACK 
// to ensure order + items are created atomically
const addPesanan = async (pesanan) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const pesananResult = await client.query(
      'INSERT INTO pesanans (total_bayar) VALUES ($1) RETURNING id',
      [pesanan.total_bayar],
    );

    const pesananId = pesananResult.rows[0].id;

    if (Array.isArray(pesanan.menus)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const menu of pesanan.menus) {
        // eslint-disable-next-line no-await-in-loop
        await client.query(
          `
          INSERT INTO pesanan_items
            (pesanan_id, product_id, jumlah, total_harga, keterangan)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [
            pesananId,
            menu.product.id,
            menu.jumlah,
            menu.total_harga,
            menu.keterangan || null,
          ],
        );
      }
    }

    await client.query('COMMIT');

    return getPesananById(pesananId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const clearKeranjang = async () => {
  await db.query('DELETE FROM keranjangs');
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
