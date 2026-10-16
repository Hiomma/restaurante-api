import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { connect } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module.js';

/**
 * Tombstone of a removed label: when a stock item is deleted, a copy is kept
 * so a later QR lookup can answer "this label was already used" instead of
 * "not found".
 *
 * API contract pinned down here:
 *   - DELETE /stock-items/:id records who removed it (resolved by the
 *     controller, same resolution as stock movements) and where it went
 *   - GET /stock-items/qr/:qrCode for a removed label → 410 with
 *     { used: true, message, qrCode, productName, type, weightGrams,
 *       destination, userName, removedAt, reason }
 *   - GET for a code never seen in this restaurant → 404 (as before)
 *   - GET for an active item → 200 (as before)
 *
 * Runs against the local MongoDB used in development; skipped gracefully
 * when it is unreachable.
 */
jest.setTimeout(30000);

const dbUri = `mongodb://${process.env.DATABASE_USER || 'admin'}:${
  process.env.DATABASE_PASSWORD || 'secret123'
}@${process.env.DATABASE_HOST || 'localhost'}:${
  process.env.DATABASE_PORT || '27017'
}/${process.env.DATABASE_NAME || 'restaurante'}?authSource=admin`;

const stamp = Date.now();
const username = `spec-removal-${stamp}`;

const baseItem = {
  productId: 'p-spec-removal',
  productName: 'Etiqueta Baixa Spec',
  type: 'raw',
  weightGrams: 750,
  manipulationDate: '2026-10-16',
  expiryDate: '2026-10-23',
  destination: 'Refrigerador Spec',
};

describe('Stock item removal tombstone API', () => {
  let app: INestApplication;
  let http: any;
  let accessToken: string;
  let mongoUp = true;
  let ownerName = '';
  let removedItemId = '';
  let activeItemId = '';

  beforeAll(async () => {
    try {
      const probe = await connect(dbUri, { serverSelectionTimeoutMS: 2000 });
      await probe.disconnect();
    } catch {
      mongoUp = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB unreachable — skipping stock item removal tombstone tests.');
      return;
    }

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    // Mirror main.ts so validation behaves exactly like production.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    http = app.getHttpServer();

    const register = await request(http)
      .post('/auth/register')
      .send({ name: 'Spec Baixa', username, password: 'senha1234' })
      .expect(201);
    accessToken = register.body.access_token;

    // The actor name comes from the logged user — /users/me must expose it
    // so the tombstone's userName is filled with something meaningful.
    const me = await request(http)
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.name).toBeTruthy();
    ownerName = me.body.name;
  });

  afterAll(async () => {
    if (!mongoUp || !app) return;
    const connection = app.get(getConnectionToken());
    await connection.collection('stockitems').deleteMany({ qrCode: { $regex: '^(USED01|LIVE01)$' } });
    await connection.collection('stockitemremovals').deleteMany({
      qrCode: { $regex: '^(USED01|LIVE01)$' },
    });
    await connection.collection('stockmovements').deleteMany({
      'product.productId': 'p-spec-removal',
    });
    await connection.collection('users').deleteOne({ username });
    await app.close();
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!mongoUp) return;
      await fn();
    });

  const auth = () => ({ Authorization: `Bearer ${accessToken}` });

  itDb('creates an active item with QR USED01', async () => {
    const created = await request(http)
      .post('/stock-items')
      .set(auth())
      .send({ ...baseItem, qrCode: 'USED01' })
      .expect(201);
    removedItemId = created.body._id;
    expect(created.body.qrCode).toBe('USED01');

    // Active labels still resolve with 200.
    await request(http).get('/stock-items/qr/USED01').set(auth()).expect(200);
  });

  itDb('DELETE removes the item (controller resolves the actor)', async () => {
    expect(removedItemId).toBeDefined();
    await request(http).delete(`/stock-items/${removedItemId}`).set(auth()).expect(200);

    await request(http).get(`/stock-items/${removedItemId}`).set(auth()).expect(404);
  });

  itDb('GET of the removed QR answers 410 "already used" with the full tombstone', async () => {
    const res = await request(http).get('/stock-items/qr/USED01').set(auth()).expect(410);

    expect(res.body.used).toBe(true);
    expect(res.body.message).toBe('Etiqueta já baixada');
    expect(res.body.qrCode).toBe('USED01');
    expect(res.body.productName).toBe('Etiqueta Baixa Spec');
    expect(res.body.type).toBe('raw');
    expect(res.body.weightGrams).toBe(750);
    expect(res.body.destination).toBe('Refrigerador Spec');
    expect(res.body.userName).toBe(ownerName);
    expect(res.body.removedAt).toBeDefined();
  });

  itDb('GET of a QR never seen still answers 404', async () => {
    await request(http).get('/stock-items/qr/NEVER404').set(auth()).expect(404);
  });

  itDb('GET of an active label still answers 200', async () => {
    const created = await request(http)
      .post('/stock-items')
      .set(auth())
      .send({ ...baseItem, qrCode: 'LIVE01' })
      .expect(201);
    activeItemId = created.body._id;

    const found = await request(http).get('/stock-items/qr/LIVE01').set(auth()).expect(200);
    expect(found.body.qrCode).toBe('LIVE01');
    expect(found.body._id).toBe(activeItemId);
  });
});
