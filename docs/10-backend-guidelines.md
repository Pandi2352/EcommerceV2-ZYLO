# NestJS Backend Engineering Guidelines

## 1. Architectural Philosophy: NestJS Modular Clean Architecture

Backend code must adhere strictly to the NestJS modular architecture:

```
[Client Request] ──► [Guards] ──► [Validation Pipe] ──► [Controller] ──► [Service] ──► [Mongoose Model] ──► MongoDB
```

| Component | Responsibility | Forbidden Actions |
|---|---|---|
| **Module (`*.module.ts`)** | Bundles providers, imports dependent modules, exports public services | Writing direct endpoint logic |
| **Controller (`*.controller.ts`)**| Route mapping, parameter extraction, Swagger decorators, calling service methods | Querying MongoDB directly, executing calculations |
| **Service (`*.service.ts`)** | Pure business logic, pricing mathematics, database transactions, throwing NestJS exceptions | Touching HTTP request/response objects directly |
| **DTO (`dto/*.dto.ts`)** | Type definition with `class-validator` and Swagger `@ApiProperty()` | Business logic, database queries |
| **Schema (`schemas/*.schema.ts`)**| Mongoose document schema mapping, subdocuments, indexes, property types | Making external HTTP calls |

---

## 2. Controller Pattern with Swagger Decorators

```typescript
// server/src/modules/products/products.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter catalog products' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product details by ID' })
  @ApiResponse({ status: 200, description: 'Product entity details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
```

---

## 3. DTO Validation Pattern with Class-Validator

```typescript
// server/src/modules/products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mechanical Keyboard', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Compact 75% layout keyboard...', description: 'Full description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '99.99', description: 'Base selling price' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: '79.99', description: 'Discounted promotional price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPrice?: number;

  @ApiProperty({ example: 'KB-75-WL', description: 'Unique Stock Keeping Unit' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 50, description: 'Total initial inventory stock' })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Category UUID' })
  @IsUUID()
  categoryId: string;
}
```

---

## 4. Service Layer & MongoDB Transactions

```typescript
// server/src/modules/orders/orders.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Atomic stock deduction
      for (const item of dto.items) {
        const product = await this.productModel.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true },
        );

        if (!product) {
          throw new BadRequestException(`Insufficient stock for item ${item.productId}`);
        }
      }

      // 2. Persist Order document
      const [order] = await this.orderModel.create(
        [
          {
            customer: userId,
            items: dto.items,
            orderStatus: 'PENDING',
            paymentMethod: dto.paymentMethod,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```


---

## 5. Global Validation Pipe in `main.ts`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strips non-whitelisted payload properties
    forbidNonWhitelisted: true,   // Rejects requests with unexpected properties
    transform: true,              // Automatically coerces payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
);
```
