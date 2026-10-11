import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { connect } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module.js';

/**
 * Regression tests for BUG 1 (destination creation/listing on Movimentações → Destinos).
 *
 * The frontend bug was that the Destinos sub-tabs had no `value` props, so a numeric
 * type reached the API. The API contract these tests pin down:
 *   - POST /movement-destinations persists `type` exactly as sent ('move' | 'writeoff')
 *   - GET  /movement-destinations returns the persisted destination with its type
 *   - POST with a type outside the allowed set is rejected with 400
 *   - the endpoint requires authentication (401 without a token)
 *
 * Runs against the local MongoDB used in development. When MongoDB is not reachable
 * the suite is skipped gracefully (each test returns early) instead of failing.
 */
jest.setTimeout(30000);

const dbUri = `mongodb://${process.env.DATABASE_USER || 'admin'}:${
  process.env.DATABASE_PASSWORD || 'secret123'
}@${process.env.DATABASE_HOST || 'localhost'}:${
  process.env.DATABASE_PORT || '27017'
}/${process.env.DATABASE_NAME || 'restaurante'}?authSource=admin`;

describe('Movement destinations API (BUG 1 regression)', () => {
  let app: INestApplication;
  let http: any;
  let accessToken: string;
  let mongoUp = true;
  let createdDestinationId: string;
  const username = `spec-dest-${Date.now()}`;

  beforeAll(async () => {
    // Graceful skip: probe MongoDB with a short timeout before booting the app.
    try {
      const probe = await connect(dbUri, { serverSelectionTimeoutMS: 2000 });
      await probe.disconnect();
    } catch {
      mongoUp = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB unreachable — skipping Movement destinations API tests.');
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
      .send({ name: 'Spec Destinos', username, password: 'senha1234' })
      .expect(201);
    accessToken = register.body.access_token;
  });

  afterAll(async () => {
    if (!mongoUp || !app) return;
    // Remove the documents created by this spec so the dev database stays clean.
    const connection = app.get(getConnectionToken());
    await connection.collection('movementdestinations').deleteMany({ name: /^Câmara Spec/ });
    await connection.collection('users').deleteOne({ username });
    await app.close();
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!mongoUp) return;
      await fn();
    });

  itDb('creates a move destination and persists its type', async () => {
    const created = await request(http)
      .post('/movement-destinations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Câmara Spec', type: 'move' })
      .expect(201);

    expect(created.body.type).toBe('move');
    expect(created.body.name).toBe('Câmara Spec');
    expect(created.body.owner).toBeDefined();
    createdDestinationId = created.body._id;
  });

  itDb('lists the created destination with its persisted type', async () => {
    expect(createdDestinationId).toBeDefined();

    const list = await request(http)
      .get('/movement-destinations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(list.body)).toBe(true);
    const found = list.body.find(
      (d: { _id: string }) => d._id === createdDestinationId,
    );
    expect(found).toBeDefined();
    expect(found.type).toBe('move');
  });

  itDb('rejects an invalid destination type with 400', async () => {
    await request(http)
      .post('/movement-destinations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Tipo Inválido', type: 'invalid-type' })
      .expect(400);

    // A non-string (e.g. the numeric sub-tab value produced by the old frontend bug)
    // must also be rejected instead of being persisted.
    await request(http)
      .post('/movement-destinations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Tipo Numérico', type: 1 })
      .expect(400);
  });

  itDb('rejects unauthenticated requests with 401', async () => {
    await request(http)
      .get('/movement-destinations')
      .expect(401);

    await request(http)
      .post('/movement-destinations')
      .send({ name: 'Sem Token', type: 'move' })
      .expect(401);
  });
});
