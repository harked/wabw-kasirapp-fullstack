const Hapi = require('@hapi/hapi');
const Boom = require('@hapi/boom');
const {
  init: initStore,
  getCategories,
  getProducts,
  getKeranjangs,
  addKeranjang,
  updateKeranjang,
  deleteKeranjang,
  getPesanans,
  addPesanan,
} = require('./dataStore');

const createServer = async () => {
  await initStore();

  const server = Hapi.server({
    port: process.env.PORT || 3004,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route([
    {
      method: 'GET',
      path: '/categories',
      handler: () => getCategories(),
    },
    {
      method: 'GET',
      path: '/products',
      handler: (request) => {
        const categoryName =
          request.query['category.nama'] || request.query.categoryNama;
        return getProducts(categoryName);
      },
    },
    {
      method: 'GET',
      path: '/keranjangs',
      handler: (request) => {
        const productId =
          request.query['product.id'] || request.query.productId;
        return getKeranjangs(productId);
      },
    },
    {
      method: 'POST',
      path: '/keranjangs',
      handler: async (request, h) => {
        const payload = request.payload;

        if (!payload || !payload.product) {
          throw Boom.badRequest('Payload keranjang tidak valid.');
        }

        const newKeranjang = await addKeranjang(payload);
        return h.response(newKeranjang).code(201);
      },
    },
    {
      method: 'PUT',
      path: '/keranjangs/{id}',
      handler: async (request) => {
        const updated = await updateKeranjang(request.params.id, request.payload);

        if (!updated) {
          throw Boom.notFound('Keranjang tidak ditemukan.');
        }

        return updated;
      },
    },
    {
      method: 'DELETE',
      path: '/keranjangs/{id}',
      handler: async (request, h) => {
        const deleted = await deleteKeranjang(request.params.id);

        if (!deleted) {
          throw Boom.notFound('Keranjang tidak ditemukan.');
        }

        return h.response().code(204);
      },
    },
    {
      method: 'GET',
      path: '/pesanans',
      handler: () => getPesanans(),
    },
    {
      method: 'POST',
      path: '/pesanans',
      handler: async (request, h) => {
        const payload = request.payload;

        if (!payload || typeof payload.total_bayar === 'undefined') {
          throw Boom.badRequest('Payload pesanan tidak valid.');
        }

        const newPesanan = await addPesanan(payload);
        return h.response(newPesanan).code(201);
      },
    },
  ]);

  return server;
};

const startServer = async () => {
  const server = await createServer();
  await server.start();
  console.log(`Hapi server berjalan di ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };
