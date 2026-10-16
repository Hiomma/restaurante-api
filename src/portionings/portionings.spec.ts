import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { connect } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module.js';

/**
 * Portioning snapshots: a loss report shows the RAW input material, so every
 * portioning stores two snapshots:
 *   - `rawProduct` — the input matière-prima (dto.productId/productName)
 *   - `product`    — the final product (first entry of `outputs` when there
 *                    are outputs, the input product otherwise)
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
const username = `spec-portion-${stamp}`;

describe('Portioning raw product snapshot API', () => {
  let app: INestApplication;
  let http: any;
  let accessToken: string;
  let mongoUp = true;

  beforeAll(async () => {
    try {
      const probe = await connect(dbUri, { serverSelectionTimeoutMS: 2000 });
      await probe.disconnect();
    } catch {
      mongoUp = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB unreachable — skipping portioning rawProduct tests.');
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
      .send({ name: 'Spec Porcionamento', username, password: 'senha1234' })
      .expect(201);
    accessToken = register.body.access_token;
  });

  afterAll(async () => {
    if (!mongoUp || !app) return;
    const connection = app.get(getConnectionToken());
    await connection.collection('portionings').deleteMany({
      'rawProduct.productName': { $in: ['Matéria Prima Spec', 'Matéria Prima Simples Spec'] },
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

  itDb('stores the input raw material in rawProduct and the final product in product', async () => {
    const created = await request(http)
      .post('/portionings')
      .set(auth())
      .send({
        productId: 'raw-portion-spec',
        productName: 'Matéria Prima Spec',
        rawWeightGrams: 1000,
        cleanWeightGrams: 900,
        lossGrams: 100,
        date: '2026-10-16',
        outputs: [
          {
            productId: 'final-portion-spec',
            productName: 'Produto Final Spec',
            portionsCount: 4,
          },
        ],
      })
      .expect(201);

    expect(created.body.rawProduct).toBeDefined();
    expect(created.body.rawProduct.productId).toBe('raw-portion-spec');
    expect(created.body.rawProduct.productName).toBe('Matéria Prima Spec');

    expect(created.body.product).toBeDefined();
    expect(created.body.product.productId).toBe('final-portion-spec');
    expect(created.body.product.productName).toBe('Produto Final Spec');

    expect(created.body.outputs).toHaveLength(1);
    expect(created.body.outputs[0].productName).toBe('Produto Final Spec');
  });

  itDb('records rawProduct even for a portioning without outputs', async () => {
    const created = await request(http)
      .post('/portionings')
      .set(auth())
      .send({
        productId: 'raw-portion-simple',
        productName: 'Matéria Prima Simples Spec',
        rawWeightGrams: 500,
        cleanWeightGrams: 450,
        lossGrams: 50,
        date: '2026-10-16',
      })
      .expect(201);

    expect(created.body.rawProduct).toBeDefined();
    expect(created.body.rawProduct.productName).toBe('Matéria Prima Simples Spec');
    expect(created.body.product.productName).toBe('Matéria Prima Simples Spec');
    expect(created.body.outputs).toHaveLength(0);
  });
});
