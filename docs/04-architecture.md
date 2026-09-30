# System Architecture & Design Patterns

## 1. High-Level Architecture Overview

ZYLO is designed as a structured **Modular Monolith** using **NestJS** and **MongoDB**. NestJS provides native dependency injection, decorators, pipes, guards, interceptors, and Swagger integration, while MongoDB with Mongoose provides flexible document modeling, high-throughput writes, indexing, and multi-document ACID transactions via replica sets/sessions.

```mermaid
graph TB
    subgraph ClientLayer ["Client Storefront & Admin Portal (React + TS + Tailwind)"]
        UI[React UI Components & Pages]
        Router[React Router DOM v7]
        AxiosClient[Axios HTTP Client with Interceptors]
        UI --> Router --> AxiosClient
    end

    subgraph APILayer ["NestJS API Layer (TypeScript)"]
        Swagger[Swagger OpenAPI /api/docs]
        GlobalPipes[ValidationPipe & DTO Validation]
        Guards[AuthGuards & RolesGuards]
        Controllers[NestJS Controllers]
        GlobalPipes --> Guards --> Controllers
    end

    subgraph CoreModules ["NestJS Domain Modules (Dependency Injection)"]
        AuthMod[AuthModule & Passport JWT]
        UserMod[UsersModule]
        CatMod[CategoriesModule]
        ProdMod[ProductsModule]
        CartMod[CartModule]
        OrderMod[OrdersModule]
        PayMod[PaymentsModule]
        InvMod[InventoryModule]
    end

    subgraph DataAccessLayer ["Persistence Layer (Mongoose / Models)"]
        Mongoose[Mongoose Connection & ClientSession]
        MongoDB[(MongoDB 7+ Database)]
        Mongoose --> MongoDB
    end

    AxiosClient -->|HTTP / HTTPS REST| GlobalPipes
    Controllers --> CoreModules
    CoreModules --> Mongoose
```

---

## 2. NestJS Architecture Standards & Component Isolation

Every domain in `server/src/modules/` is encapsulated in a dedicated NestJS Module:

```
Request ──► [Guard] ──► [Pipe / DTO] ──► [Controller] ──► [Service] ──► [Model / Schema] ──► MongoDB
Response ◄──────────────────────────────── [Interceptor] ◄── [Service] ◄───────────────────────┘
```

1. **NestJS Module (`*.module.ts`)**:
   - Declares controllers and providers.
   - Imports `MongooseModule.forFeature([{ name: Model.name, schema: ModelSchema }])` to register models.
   - Exports reusable services to other domain modules.

2. **Controller (`*.controller.ts`)**:
   - Decorated with `@Controller('route')` and Swagger decorators (`@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`).
   - Injects domain service via constructor dependency injection.
   - Accepts validated DTOs (`@Body() dto: CreateProductDto`).
   - Delegates business tasks strictly to services.

3. **Service (`*.service.ts`)**:
   - Decorated with `@Injectable()`.
   - Injects Mongoose models (`@InjectModel(Entity.name) private model: Model<EntityDocument>`).
   - Implements business logic, pricing mathematics, state machines, and atomic database sessions.
   - Throws standard NestJS exceptions (`NotFoundException`, `BadRequestException`, `ConflictException`, `ForbiddenException`).

4. **Schema (`schemas/*.schema.ts`)**:
   - Mongoose schema class defining document properties using `@Prop()`, subdocuments, compound indexes (`@Schema({ timestamps: true })`), and virtuals.

5. **DTO (`dto/*.dto.ts`)**:
   - Data Transfer Objects using `class-validator` (`@IsString()`, `@IsNumber()`, `@IsOptional()`) and `@ApiProperty()` for automatic Swagger OpenAPI documentation.

---

## 3. MongoDB Transactional Order Placement Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant CheckoutUI as Checkout (React + Axios)
    participant OrderCtrl as OrdersController
    participant OrderSvc as OrdersService
    participant Session as Mongoose ClientSession
    participant Mongo as MongoDB Database

    Customer->>CheckoutUI: Clicks "Place Order"
    CheckoutUI->>OrderCtrl: POST /api/v1/orders (CreateOrderDto)
    OrderCtrl->>OrderSvc: createOrder(userId, createOrderDto)
    
    rect rgb(240, 248, 255)
        note right of OrderSvc: Start MongoDB Session Transaction
        OrderSvc->>Session: startSession() & startTransaction()
        OrderSvc->>Mongo: Find & atomic decrement stock: findOneAndUpdate({ _id: prodId, stock: { $gte: qty } })
        OrderSvc->>OrderSvc: Recalculate cart totals, apply coupon, verify stock
        
        alt Stock Insufficient
            OrderSvc->>Session: abortTransaction()
            OrderCtrl-->>CheckoutUI: 400 Bad Request ("Insufficient stock for SKU...")
        else Stock Available
            OrderSvc->>Mongo: Insert Order document with session
            OrderSvc->>Mongo: Clear User Cart document with session
            OrderSvc->>Session: commitTransaction()
            OrderSvc-->>OrderCtrl: Order document snapshot
            OrderCtrl-->>CheckoutUI: 201 Created (OrderResponseDto)
            CheckoutUI->>Customer: Navigate to /order-success/:orderId
        end
    end
```

---

## 4. Swagger OpenAPI Documentation
- Swagger is initialized in `main.ts` using `DocumentBuilder`.
- Accessible at `/api/docs`.
- Generates interactive API testing interface and can export `openapi.json` for frontend TypeScript client generation.
