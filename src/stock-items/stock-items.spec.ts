import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { connect } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module.js';

/**
 * Regression tests for the receiving-label QR bug.
 *
 * The frontend generates the 6-character QR, shows it on the label preview and
 * then sends that exact code when saving the item. The API contract pinned down
 * here:
 *   - POST /stock-items stores the client-sent `qrCode` verbatim (uppercased),
 *     so the printed label always matches what is in the database
 *   - GET  /stock-items/qr/:qrCode finds the item by that client-sent code
 *   - POST without `qrCode` still falls back to a server-generated 6-char code
 *
 * Runs against the local MongoDB used in development. When MongoDB is not
 * reachable the suite is skipped gracefully instead of failing.
 */
jest.setTimeout(30000);

const dbUri = `mongodb://${process.env.DATABASE_USER || 'admin'}:${
  process.env.DATABASE_PASSWORD || 'secret123'
}@${process.env.DATABASE_HOST || 'localhost'}:${
  process.env.DATABASE_PORT || '27017'
}/${process.env.DATABASE_NAME || 'restaurante'}?authSource=admin`;

const baseItem = {
  productId: 'p-spec-qr',
  productName: 'Queijo Spec',
  type: 'raw',
  weightGrams: 1000,
  manipulationDate: '2026-10-13',
  expiryDate: '2026-10-20',
};

describe('Stock items API (receiving QR regression)', () => {
  let app: INestApplication;
  let http: any;
  let accessToken: string;
  let mongoUp = true;
  let createdItemIds: string[] = [];
  const username = `spec-qr-${Date.now()}`;

  beforeAll(async () => {
    try {
      const probe = await connect(dbUri, { serverSelectionTimeoutMS: 2000 });
      await probe.disconnect();
    } catch {
      mongoUp = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB unreachable — skipping Stock items QR API tests.');
      return;
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    // Mirror main.ts so validation behaves exactly like production.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    http = app.getHttpServer();

    const register = await request(http)
      .post('/auth/register')
      .send({ name: 'Spec QR', username, password: 'senha1234' })
      .expect(201);
    accessToken = register.body.access_token;
  });

  afterAll(async () => {
    if (!mongoUp || !app) return;
    const connection = app.get(getConnectionToken());
    await connection.collection('stockitems').deleteMany({ 'product.productId': 'p-spec-qr' });
    await connection.collection('stockmovements').deleteMany({
      'product.productId': 'p-spec-qr',
    });
    await connection.collection('users').deleteOne({ username });
    await app.close();
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!mongoUp) return;
      await fn();
    });

  itDb('stores the client-sent QR code verbatim instead of generating a new one', async () => {
    const created = await request(http)
      .post('/stock-items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...baseItem, qrCode: 'CLIENT' })
      .expect(201);

    createdItemIds.push(created.body._id);
    // The exact code shown on the label preview is what gets persisted.
    expect(created.body.qrCode).toBe('CLIENT');
  });

  itDb('finds the item by the client-sent QR code (scan lookup)', async () => {
    const found = await request(http)
      .get('/stock-items/qr/CLIENT')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(found.body.qrCode).toBe('CLIENT');
  });

  itDb('uppercases the client-sent QR code so lookups stay case-insensitive', async () => {
    const created = await request(http)
      .post('/stock-items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...baseItem, qrCode: 'abc123' })
      .expect(201);

    createdItemIds.push(created.body._id);
    expect(created.body.qrCode).toBe('ABC123');
  });

  itDb('still generates a 6-character QR when the client sends none', async () => {
    const created = await request(http)
      .post('/stock-items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(baseItem)
      .expect(201);

    createdItemIds.push(created.body._id);
    expect(created.body.qrCode).toMatch(/^[A-Z0-9]{6}$/);
  });
});
