# Testing Strategy & Quality Assurance in NestJS

## 1. The Testing Pyramid

```
          /\
         /  \        End-to-End Tests (Playwright)
        / E2E\       Critical paths: Registration ➔ Catalog ➔ Checkout
       /------\
      /        \     Integration Tests (NestJS TestModule + Supertest + PostgreSQL)
     /  Integ.  \    API endpoints, Guards, Pipes, Database Transactions
    /------------\
   /              \  Unit Tests (Vitest / Jest)
  /      Unit      \ Services, pricing mathematics, DTO validators, state machine
 /------------------\
```

---

## 2. Test Tooling Selection

| Tier | Tool | Rationale |
|---|---|---|
| **Backend Unit & Integration** | `@nestjs/testing` + Jest / Vitest | Native NestJS testing module with dependency injection mocking |
| **HTTP API Testing** | Supertest | Direct HTTP invocation of `app.getHttpServer()` |
| **Test Database** | PostgreSQL Test Container / Local Test DB | Real relational SQL queries and foreign key constraints |
| **Frontend Unit & Component** | Vitest + React Testing Library | Component assertions, accessibility checks, and hook validation |
| **End-to-End Browser Tests** | Playwright | Multi-browser headless automation of complete customer purchase journey |

---

## 3. NestJS Unit Testing Pattern Example

```typescript
// server/src/modules/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepo: any;

  beforeEach(async () => {
    mockProductRepo = {
      findOne: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepo,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should throw NotFoundException if product is missing', async () => {
    mockProductRepo.findOne.mockResolvedValue(null);
    await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
  });
});
```

---

## 4. NestJS Integration Testing with Supertest

```typescript
// server/test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/register (POST) - Rejects invalid email', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'invalid-email', password: 'Password123!', name: 'John' })
      .expect(400);
  });
});
```

---

## 5. Test Execution Commands

```bash
# Run backend unit tests
npm run test --prefix server

# Run backend integration / e2e tests
npm run test:e2e --prefix server

# Run frontend tests
npm run test --prefix client

# Run Playwright E2E browser tests
npx playwright test
```
