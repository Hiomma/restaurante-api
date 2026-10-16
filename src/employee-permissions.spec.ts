import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { connect } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module.js';

/**
 * Employee permission matrix on the API (mirror of the UI matrix).
 *
 * A logged-in restricted employee (`employeeId` present, role !== 'admin')
 * must be blocked — 403 "Acesso restrito para funcionário" — on the
 * restricted routes, while still being able to do its day-to-day work:
 *
 *   - products / suppliers / movement-destinations: POST, PUT, DELETE → 403, GET free
 *   - employees: every route → 403
 *   - agenda-items: POST, PUT, DELETE → 403, GET free (view only)
 *   - portionings: PUT, DELETE → 403 (POST free — may create a portioning)
 *   - stock-movements: PUT, DELETE → 403 (POST/GET free)
 *   - users: PUT me/password → 403 (nothing else restricted)
 *   - stock-items: nothing restricted (write-off during counting needs PUT/DELETE)
 *
 * The owner and an ADM employee (role='admin') are never affected.
 *
 * Runs against the local MongoDB used in development; skipped gracefully
 * when it is unreachable.
 */
jest.setTimeout(60000);

const dbUri = `mongodb://${process.env.DATABASE_USER || 'admin'}:${
  process.env.DATABASE_PASSWORD || 'secret123'
}@${process.env.DATABASE_HOST || 'localhost'}:${
  process.env.DATABASE_PORT || '27017'
}/${process.env.DATABASE_NAME || 'restaurante'}?authSource=admin`;

const stamp = Date.now();
const owner = { username: `spec-perm-owner-${stamp}`, password: 'senha1234', token: '' };
const empCreds = { username: `spec-perm-emp-${stamp}`, password: 'senha1234' };
const admCreds = { username: `spec-perm-adm-${stamp}`, password: 'senha1234' };
let empToken = '';
let admToken = '';
let empId = '';

const productDto = {
  name: 'Produto Permissão Spec',
  group: 'Laticinios',
  storageMethod: 'Refrigerado',
  shelfLifeDays: 10,
};

const portioningDto = {
  productId: 'p-raw-perm',
  productName: 'Matéria Prima Permissão Spec',
  rawWeightGrams: 1000,
  cleanWeightGrams: 900,
  lossGrams: 100,
  date: '2026-10-16',
  outputs: [
    {
      productId: 'p-final-perm',
      productName: 'Produto Final Permissão Spec',
      portionsCount: 4,
    },
  ],
};

const agendaDto = {
  name: 'Agenda Permissão Spec',
  datePerformed: '2026-10-16',
  expiryDate: '2026-10-23',
};

const stockItemDto = {
  productId: 'p-perm',
  productName: 'Produto Permissão Spec',
  type: 'raw',
  weightGrams: 500,
  manipulationDate: '2026-10-16',
  expiryDate: '2026-10-23',
  qrCode: 'PERM01',
  destination: 'Refrigerador Spec',
};

const movementDto = {
  productId: 'p-perm',
  productName: 'Produto Permissão Spec',
  movementType: 'entry',
  quantity: 1,
  date: '2026-10-16',
};

async function login(http: any, username: string, password: string) {
  const res = await request(http)
    .post('/auth/login')
    .send({ username, password })
    .expect(201);
  return res.body.access_token as string;
}

describe('Employee permission matrix API', () => {
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
      console.warn('MongoDB unreachable — skipping employee permission matrix tests.');
      return;
    }

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Mirror main.ts so validation behaves exactly like production.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();

    // Registrado com nome para o JWT já carregar `name` (fonte do ator).
    const register = await request(http)
      .post('/auth/register')
      .send({ name: 'Spec Permissões', username: owner.username, password: owner.password })
      .expect(201);
    owner.token = register.body.access_token;
    const ownerAuth = { Authorization: `Bearer ${owner.token}` };

    const emp = await request(http)
      .post('/employees')
      .set(ownerAuth)
      .send({
        name: 'Funcionário Spec',
        username: empCreds.username,
        password: empCreds.password,
        role: 'employee',
      })
      .expect(201);
    empId = emp.body._id;

    await request(http)
      .post('/employees')
      .set(ownerAuth)
      .send({
        name: 'ADM Spec',
        username: admCreds.username,
        password: admCreds.password,
        role: 'admin',
      })
      .expect(201);

    empToken = await login(http, empCreds.username, empCreds.password);
    admToken = await login(http, admCreds.username, admCreds.password);
  });

  afterAll(async () => {
    if (!mongoUp || !app) return;
    const connection = app.get(getConnectionToken());
    await connection.collection('products').deleteMany({ name: productDto.name });
    await connection.collection('portionings').deleteMany({
      'rawProduct.productName': portioningDto.productName,
    });
    await connection.collection('agendaitems').deleteMany({ name: agendaDto.name });
    await connection.collection('stockitems').deleteMany({ qrCode: 'PERM01' });
    await connection.collection('stockitemremovals').deleteMany({ qrCode: 'PERM01' });
    await connection.collection('stockmovements').deleteMany({
      'product.productName': movementDto.productName,
    });
    await connection.collection('suppliers').deleteMany({ name: 'Fornecedor Permissão Spec' });
    await connection.collection('movementdestinations').deleteMany({
      name: 'Destino Permissão Spec',
    });
    await connection.collection('employees').deleteMany({ username: { $regex: '^spec-perm-' } });
    await connection.collection('users').deleteMany({ username: { $regex: '^spec-perm-' } });
    await app.close();
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!mongoUp) return;
      await fn();
    });

  const authEmp = () => ({ Authorization: `Bearer ${empToken}` });
  const authAdm = () => ({ Authorization: `Bearer ${admToken}` });
  const authOwner = () => ({ Authorization: `Bearer ${owner.token}` });

  itDb('restricted employee can list products (GET /products → 200)', async () => {
    await request(http).get('/products').set(authEmp()).expect(200);
  });

  itDb('restricted employee cannot create products (POST → 403)', async () => {
    await request(http).post('/products').set(authEmp()).send(productDto).expect(403);
    // The owner is never blocked.
    await request(http).post('/products').set(authOwner()).send(productDto).expect(201);
  });

  itDb('restricted employee can create a portioning (201) but not delete it (403)', async () => {
    const created = await request(http)
      .post('/portionings')
      .set(authEmp())
      .send(portioningDto)
      .expect(201);

    await request(http)
      .delete(`/portionings/${created.body._id}`)
      .set(authEmp())
      .expect(403);

    // Still there for the owner (the 403 was the guard, not a 404).
    await request(http)
      .get(`/portionings/${created.body._id}`)
      .set(authOwner())
      .expect(200);
  });

  itDb('restricted employee can create an agenda item (201) but not update it (403)', async () => {
    const created = await request(http)
      .post('/agenda-items')
      .set(authEmp())
      .send(agendaDto)
      .expect(201);

    await request(http)
      .put(`/agenda-items/${created.body._id}`)
      .set(authEmp())
      .send({ status: 'em_andamento' })
      .expect(403);

    // Viewing the agenda stays free.
    await request(http).get('/agenda-items').set(authEmp()).expect(200);
  });

  itDb('restricted employee cannot access employees (GET list → 403, GET :id → 403)', async () => {
    expect(empId).toBeDefined();
    await request(http).get('/employees').set(authEmp()).expect(403);
    await request(http).get(`/employees/${empId}`).set(authEmp()).expect(403);
  });

  itDb('restricted employee cannot change password (PUT /users/me/password → 403)', async () => {
    await request(http)
      .put('/users/me/password')
      .set(authEmp())
      .send({ currentPassword: empCreds.password, newPassword: 'senha9999' })
      .expect(403);

    // The password was not touched.
    await login(http, empCreds.username, empCreds.password);
  });

  itDb('restricted employee can register stock movements (POST → 201)', async () => {
    await request(http).post('/stock-movements').set(authEmp()).send(movementDto).expect(201);
  });

  itDb('restricted employee can write off a stock item (DELETE → 200)', async () => {
    const created = await request(http)
      .post('/stock-items')
      .set(authOwner())
      .send(stockItemDto)
      .expect(201);

    await request(http)
      .delete(`/stock-items/${created.body._id}`)
      .set(authEmp())
      .expect(200);

    // Gone for everyone afterwards (the baixa really happened).
    await request(http).get(`/stock-items/${created.body._id}`).set(authOwner()).expect(404);
  });

  itDb('restricted employee cannot create suppliers or movement destinations (403)', async () => {
    await request(http)
      .post('/suppliers')
      .set(authEmp())
      .send({ name: 'Fornecedor Permissão Spec' })
      .expect(403);
    await request(http)
      .post('/movement-destinations')
      .set(authEmp())
      .send({ name: 'Destino Permissão Spec', type: 'move' })
      .expect(403);
  });

  itDb('ADM employee is not affected (POST /products → 201)', async () => {
    const created = await request(http)
      .post('/products')
      .set(authAdm())
      .send({ ...productDto, name: 'Produto ADM Permissão Spec' })
      .expect(201);
    expect(created.body._id).toBeDefined();

    // ADM also keeps full read access to the employee list.
    await request(http).get('/employees').set(authAdm()).expect(200);

    const connection = app.get(getConnectionToken());
    await connection.collection('products').deleteMany({ name: 'Produto ADM Permissão Spec' });
  });
});
