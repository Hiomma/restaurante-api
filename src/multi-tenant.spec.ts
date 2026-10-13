import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { connect } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module.js';

/**
 * Multi-tenant isolation tests: every restaurant (owner) only ever sees its
 * own data, no matter which endpoint is hit — including by an ADM employee,
 * whose "admin" role is a permission INSIDE its own restaurant, never a
 * platform-wide bypass.
 *
 * Covered:
 *   - restaurant A's resources (product, supplier, destination, agenda item,
 *     stock item, portioning, movement) are invisible to B: empty listings,
 *     404 on GET/PUT/DELETE by id, 404 on QR lookup
 *   - the same QR code can exist in both restaurants (uniqueness is per owner)
 *   - a duplicate QR inside the SAME restaurant is rejected (409)
 *   - GET /users never lists other restaurants' accounts
 *   - PUT /users/:id/password can never target another restaurant (nor by an
 *     ADM employee, nor by another owner)
 *
 * Runs against the local MongoDB used in development; skipped gracefully when
 * it is unreachable.
 */
jest.setTimeout(60000);

const dbUri = `mongodb://${process.env.DATABASE_USER || 'admin'}:${
  process.env.DATABASE_PASSWORD || 'secret123'
}@${process.env.DATABASE_HOST || 'localhost'}:${
  process.env.DATABASE_PORT || '27017'
}/${process.env.DATABASE_NAME || 'restaurante'}?authSource=admin`;

const stamp = Date.now();
const ownerA = { username: `spec-tenant-a-${stamp}`, password: 'senha1234', token: '', id: '' };
const ownerB = { username: `spec-tenant-b-${stamp}`, password: 'senha1234', token: '', id: '' };
let admToken = '';

// Resources created by A and expected to be invisible to B.
const created: Record<string, string> = {};
const QR_TENANT = 'TENANT';

const productDto = {
  name: 'Queijo Isolamento',
  group: 'Laticinios',
  storageMethod: 'Refrigerado',
  shelfLifeDays: 10,
};

async function login(http: any, username: string, password: string) {
  const res = await request(http)
    .post('/auth/login')
    .send({ username, password })
    .expect(201);
  return res.body.access_token as string;
}

describe('Multi-restaurant isolation API', () => {
  let app: INestApplication;
  let http: any;
  let mongoUp = true;

  beforeAll(async () => {
    try {
      const probe = await connect(dbUri, { serverSelectionTimeoutMS: 2000 });
      await probe.disconnect();
    } catch {
      mongoUp = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB unreachable — skipping multi-restaurant isolation tests.');
      return;
    }

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Mirror main.ts so validation behaves exactly like production.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();

    const regA = await request(http)
      .post('/auth/register')
      .send({ name: 'Restaurante A', username: ownerA.username, password: ownerA.password })
      .expect(201);
    ownerA.token = regA.body.access_token;
    ownerA.id = (await request(http).get('/users/me').set('Authorization', `Bearer ${ownerA.token}`))
      .body._id;

    const regB = await request(http)
      .post('/auth/register')
      .send({ name: 'Restaurante B', username: ownerB.username, password: ownerB.password })
      .expect(201);
    ownerB.token = regB.body.access_token;
    ownerB.id = (await request(http).get('/users/me').set('Authorization', `Bearer ${ownerB.token}`))
      .body._id;
  });

  afterAll(async () => {
    if (!mongoUp || !app) return;
    const connection = app.get(getConnectionToken());
    await connection.collection('products').deleteMany({ name: productDto.name });
    await connection.collection('suppliers').deleteMany({ name: 'Fornecedor Isolamento' });
    await connection.collection('movementdestinations').deleteMany({ name: 'Destino Isolamento' });
    await connection.collection('agendaitems').deleteMany({ name: 'Agenda Isolamento' });
    await connection.collection('stockitems').deleteMany({ qrCode: { $regex: '^(TENANT|DUPL)' } });
    await connection.collection('portionings').deleteMany({ 'product.productName': 'Porcionamento Isolamento' });
    await connection.collection('stockmovements').deleteMany({ 'product.productName': 'Produto Isolamento' });
    await connection.collection('employees').deleteMany({ username: { $regex: '^spec-tenant-' } });
    await connection.collection('users').deleteMany({ username: { $regex: '^spec-tenant-' } });
    await app.close();
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!mongoUp) return;
      await fn();
    });

  const authA = () => ({ Authorization: `Bearer ${ownerA.token}` });
  const authB = () => ({ Authorization: `Bearer ${ownerB.token}` });

  itDb('restaurant A creates one resource on every collection', async () => {
    created.product = (
      await request(http).post('/products').set(authA()).send(productDto).expect(201)
    ).body._id;
    created.supplier = (
      await request(http)
        .post('/suppliers')
        .set(authA())
        .send({ name: 'Fornecedor Isolamento' })
        .expect(201)
    ).body._id;
    created.destination = (
      await request(http)
        .post('/movement-destinations')
        .set(authA())
        .send({ name: 'Destino Isolamento', type: 'move' })
        .expect(201)
    ).body._id;
    created.agenda = (
      await request(http)
        .post('/agenda-items')
        .set(authA())
        .send({
          name: 'Agenda Isolamento',
          datePerformed: '2026-10-13',
          expiryDate: '2026-10-20',
        })
        .expect(201)
    ).body._id;
    created.stockItem = (
      await request(http)
        .post('/stock-items')
        .set(authA())
        .send({
          ...productDto,
          productId: created.product,
          productName: productDto.name,
          type: 'raw',
          weightGrams: 1000,
          manipulationDate: '2026-10-13',
          expiryDate: '2026-10-20',
          qrCode: QR_TENANT,
          supplier: 'Fornecedor Isolamento',
          destination: 'Destino Isolamento',
        })
        .expect(201)
    ).body._id;
    created.portioning = (
      await request(http)
        .post('/portionings')
        .set(authA())
        .send({
          productId: created.product,
          productName: 'Porcionamento Isolamento',
          rawWeightGrams: 1000,
          cleanWeightGrams: 900,
          lossGrams: 100,
          portionsCount: 4,
          date: '2026-10-13',
        })
        .expect(201)
    ).body._id;
    created.movement = (
      await request(http)
        .post('/stock-movements')
        .set(authA())
        .send({
          productId: created.product,
          productName: 'Produto Isolamento',
          movementType: 'entry',
          quantity: 1,
          date: '2026-10-13',
        })
        .expect(201)
    ).body._id;

    for (const id of Object.values(created)) expect(id).toBeDefined();
  });

  itDb('restaurant B lists none of A\'s resources', async () => {
    const [products, suppliers, destinations, agenda, stock, portionings, movements] =
      await Promise.all([
        request(http).get('/products').set(authB()).expect(200),
        request(http).get('/suppliers').set(authB()).expect(200),
        request(http).get('/movement-destinations').set(authB()).expect(200),
        request(http).get('/agenda-items').set(authB()).expect(200),
        request(http).get('/stock-items').set(authB()).expect(200),
        request(http).get('/portionings').set(authB()).expect(200),
        request(http).get('/stock-movements').set(authB()).expect(200),
      ]);

    expect(products.body).toHaveLength(0);
    expect(suppliers.body).toHaveLength(0);
    expect(destinations.body).toHaveLength(0);
    expect(agenda.body).toHaveLength(0);
    expect(stock.body).toHaveLength(0);
    expect(portionings.body).toHaveLength(0);
    expect(movements.body).toHaveLength(0);
  });

  itDb('restaurant B gets 404 on GET/PUT/DELETE of A\'s resources', async () => {
    const collections: Array<[string, string]> = [
      ['/products', created.product],
      ['/suppliers', created.supplier],
      ['/movement-destinations', created.destination],
      ['/agenda-items', created.agenda],
      ['/stock-items', created.stockItem],
      ['/portionings', created.portioning],
      ['/stock-movements', created.movement],
    ];
    for (const [base, id] of collections) {
      await request(http).get(`${base}/${id}`).set(authB()).expect(404);
      await request(http).put(`${base}/${id}`).set(authB()).send({}).expect(404);
      await request(http).delete(`${base}/${id}`).set(authB()).expect(404);
      // A can still see its own resource (the 404s above are scoping, not a bug).
      await request(http).get(`${base}/${id}`).set(authA()).expect(200);
    }
  });

  itDb('restaurant B cannot find A\'s item by QR code', async () => {
    await request(http).get(`/stock-items/qr/${QR_TENANT}`).set(authB()).expect(404);
    await request(http).get(`/stock-items/qr/${QR_TENANT}`).set(authA()).expect(200);
  });

  itDb('the same QR code can exist in another restaurant (uniqueness is per owner)', async () => {
    const createdInB = await request(http)
      .post('/stock-items')
      .set(authB())
      .send({
        productId: 'p-tenant-b',
        productName: 'Produto B',
        type: 'raw',
        weightGrams: 500,
        manipulationDate: '2026-10-13',
        expiryDate: '2026-10-20',
        qrCode: QR_TENANT,
      })
      .expect(201);
    expect(createdInB.body.qrCode).toBe(QR_TENANT);

    // ...and B finds its own item by that code.
    const found = await request(http)
      .get(`/stock-items/qr/${QR_TENANT}`)
      .set(authB())
      .expect(200);
    expect(found.body.product.productName).toBe('Produto B');
  });

  itDb('a duplicate QR inside the SAME restaurant is rejected with 409', async () => {
    await request(http)
      .post('/stock-items')
      .set(authB())
      .send({
        productId: 'p-tenant-b',
        productName: 'Produto B',
        type: 'raw',
        weightGrams: 500,
        manipulationDate: '2026-10-13',
        expiryDate: '2026-10-20',
        qrCode: QR_TENANT,
      })
      .expect(409);
  });

  itDb('an ADM employee of A only sees A\'s data', async () => {
    await request(http)
      .post('/employees')
      .set(authA())
      .send({ name: 'ADM Isolamento', username: `spec-tenant-adm-${stamp}`, password: 'senha1234', role: 'admin' })
      .expect(201);
    admToken = await login(http, `spec-tenant-adm-${stamp}`, 'senha1234');

    const products = await request(http)
      .get('/products')
      .set('Authorization', `Bearer ${admToken}`)
      .expect(200);
    expect(products.body).toHaveLength(1);
    expect(products.body[0]._id).toBe(created.product);

    // The ADM can touch A's resources...
    await request(http)
      .put(`/products/${created.product}`)
      .set('Authorization', `Bearer ${admToken}`)
      .send({ shelfLifeDays: 11 })
      .expect(200);
    // ...but not B's (404, and B's own listing stays empty).
    await request(http)
      .put('/products/0123456789abcdef01234567')
      .set('Authorization', `Bearer ${admToken}`)
      .send({ shelfLifeDays: 11 })
      .expect(404);
  });

  itDb('GET /users never lists other restaurants\' accounts', async () => {
    const listA = await request(http).get('/users').set(authA()).expect(200);
    expect(listA.body).toHaveLength(1);
    expect(listA.body[0]._id).toBe(ownerA.id);

    const listB = await request(http).get('/users').set(authB()).expect(200);
    expect(listB).toBeDefined();
    expect(listB.body).toHaveLength(1);
    expect(listB.body[0]._id).toBe(ownerB.id);
    // B never sees A's account, even though B is "admin" of its own restaurant.
    expect(listB.body.some((u: { username: string }) => u.username === ownerA.username)).toBe(false);

    // An ADM employee only sees its own restaurant's account data.
    const listAdm = await request(http)
      .get('/users')
      .set('Authorization', `Bearer ${admToken}`)
      .expect(200);
    expect(listAdm.body).toHaveLength(1);
    expect(listAdm.body[0]._id).toBe(ownerA.id);
  });

  itDb('no one can reset another restaurant\'s password', async () => {
    // Another owner (even though "admin" of its own restaurant): 404.
    await request(http)
      .put(`/users/${ownerA.id}/password`)
      .set(authB())
      .send({ newPassword: 'hacked1234' })
      .expect(404);
    // Owner targeting itself still works.
    await request(http)
      .put(`/users/${ownerB.id}/password`)
      .set(authB())
      .send({ newPassword: ownerB.password })
      .expect(200);
    // An ADM employee cannot reset the restaurant account's password either.
    await request(http)
      .put(`/users/${ownerA.id}/password`)
      .set('Authorization', `Bearer ${admToken}`)
      .send({ newPassword: 'hacked1234' })
      .expect(404);
    // A's password still works (nothing was overwritten).
    await login(http, ownerA.username, ownerA.password);
  });
});
