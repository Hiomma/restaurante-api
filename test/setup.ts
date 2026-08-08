import 'reflect-metadata';
import 'jest-mock-extended';

// @ts-ignore
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    model: jest.fn(),
    Schema: actual.Schema,
    Document: actual.Document,
    SchemaTypes: actual.SchemaTypes,
    modelNames: () => [],
    deleteModel: jest.fn(),
    connect: jest.fn(),
    connection: {},
  };
});
