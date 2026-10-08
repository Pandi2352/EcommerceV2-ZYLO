import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CouponsService } from '../coupons/coupons.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const FREE_SHIPPING_THRESHOLD = 50.0;
const STANDARD_SHIPPING_FEE = 5.99;
const ESTIMATED_TAX_RATE = 0.08;

export interface PopulatedCartItem {
  id: string;
  productId: string;
  productSlug: string;
  name: string;
  brandName?: string;
  image: string;
  variantSku?: string | null;
  variantTitle?: string | null;
  price: number;
  originalPrice: number;
  savings: number;
  quantity: number;
  selected: boolean;
  stockQuantity: number;
  inStock: boolean;
  trackInventory: boolean;
  lineTotal: number;
  volumeDiscountPercent?: number;
  isVolumeDiscounted?: boolean;
}

export interface CartCalculationResult {
  items: PopulatedCartItem[];
  savedForLater: PopulatedCartItem[];
  itemCount: number;
  totalCount: number;
  subtotal: number;
  savings: number;
  qualifiesForFreeShipping: boolean;
  amountToFreeShipping: number;
  estimatedShipping: number;
  estimatedTax: number;
  discount: number;
  appliedCoupon?: string | null;
  grandTotal: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly couponsService: CouponsService,
  ) {}

  async getOrCreateCart(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new this.cartModel({ userId, items: [], savedForLater: [] });
      await cart.save();
    }
    return cart;
  }

  async getCalculatedCart(userId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    return this.calculateCart(cart);
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<CartCalculationResult> {
    const product = await this.findProduct(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { stock, trackInventory, variant } = this.resolveStockAndVariant(product, dto.variantSku);

    if (trackInventory && stock <= 0) {
      throw new BadRequestException('This item is currently out of stock');
    }

    const cart = await this.getOrCreateCart(userId);

    // Look for existing item with matching productId AND variantSku
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === product._id.toString() &&
        (item.variantSku || null) === (dto.variantSku || null),
    );

    if (existingIndex > -1) {
      const existing = cart.items[existingIndex];
      const newQty = existing.quantity + dto.quantity;
      if (trackInventory && newQty > stock) {
        throw new BadRequestException(`Cannot add more than ${stock} units available in stock`);
      }
      existing.quantity = newQty;
      existing.selected = true;
    } else {
      if (trackInventory && dto.quantity > stock) {
        throw new BadRequestException(`Cannot add more than ${stock} units available in stock`);
      }
      cart.items.push({
        _id: uuidv4(),
        productId: product._id as Types.ObjectId,
        variantSku: dto.variantSku || null,
        quantity: dto.quantity,
        selected: true,
        addedAt: new Date(),
      });
    }

    // Also remove from savedForLater if it was there
    cart.savedForLater = cart.savedForLater.filter(
      (item) =>
        !(
          item.productId.toString() === product._id.toString() &&
          (item.variantSku || null) === (dto.variantSku || null)
        ),
    );

    await cart.save();
    return this.calculateCart(cart);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    const index = cart.items.findIndex((i) => i._id === itemId);
    if (index === -1) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity !== undefined) {
      if (dto.quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        const item = cart.items[index];
        const product = await this.productModel.findById(item.productId).exec();
        if (product) {
          const { stock, trackInventory } = this.resolveStockAndVariant(product, item.variantSku);
          if (trackInventory && dto.quantity > stock) {
            throw new BadRequestException(`Only ${stock} units available in stock`);
          }
        }
        item.quantity = dto.quantity;
      }
    }

    if (dto.selected !== undefined && cart.items[index]) {
      cart.items[index].selected = dto.selected;
    }

    await cart.save();
    return this.calculateCart(cart);
  }

  async removeItem(userId: string, itemId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = cart.items.filter((i) => i._id !== itemId);
    await cart.save();
    return this.calculateCart(cart);
  }

  /** Amazon signature feature: Move item to Saved for Later */
  async saveForLater(userId: string, itemId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    const index = cart.items.findIndex((i) => i._id === itemId);
    if (index === -1) {
      throw new NotFoundException('Cart item not found');
    }

    const [item] = cart.items.splice(index, 1);
    const raw = (item as any).toObject ? (item as any).toObject() : item;
    cart.savedForLater.push({
      _id: uuidv4(),
      productId: raw.productId,
      variantSku: raw.variantSku || null,
      quantity: raw.quantity || 1,
      selected: false,
      addedAt: new Date(),
    });

    await cart.save();
    return this.calculateCart(cart);
  }

  /** Amazon signature feature: Move item from Saved for Later back to active Cart */
  async moveToCart(userId: string, itemId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    const index = cart.savedForLater.findIndex((i) => i._id === itemId);
    if (index === -1) {
      throw new NotFoundException('Saved item not found');
    }

    const [saved] = cart.savedForLater.splice(index, 1);
    const raw = (saved as any).toObject ? (saved as any).toObject() : saved;
    // Add to active items
    cart.items.push({
      _id: uuidv4(),
      productId: raw.productId,
      variantSku: raw.variantSku || null,
      quantity: raw.quantity || 1,
      selected: true,
      addedAt: new Date(),
    });

    await cart.save();
    return this.calculateCart(cart);
  }

  async deleteSavedItem(userId: string, itemId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    cart.savedForLater = cart.savedForLater.filter((i) => i._id !== itemId);
    await cart.save();
    return this.calculateCart(cart);
  }

  async clearCart(userId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    cart.items = [];
    await cart.save();
    return this.calculateCart(cart);
  }

  async mergeCart(userId: string, items: AddToCartDto[]): Promise<CartCalculationResult> {
    for (const item of items) {
      try {
        await this.addItem(userId, item);
      } catch {
        // Skip invalid or out-of-stock items during merge
      }
    }
    return this.getCalculatedCart(userId);
  }

  async applyCoupon(userId: string, code: string): Promise<CartCalculationResult> {
    const cleanCode = (code || '').trim().toUpperCase();
    const cart = await this.getOrCreateCart(userId);
    const prelim = await this.calculateCart(cart);

    const validation = await this.couponsService.validateCoupon(cleanCode, prelim.subtotal, userId);
    if (!validation.isValid) {
      throw new BadRequestException(validation.message || 'Invalid or expired promotional code');
    }

    cart.appliedCoupon = validation.code;
    await cart.save();
    return this.calculateCart(cart);
  }

  async removeCoupon(userId: string): Promise<CartCalculationResult> {
    const cart = await this.getOrCreateCart(userId);
    cart.appliedCoupon = null;
    await cart.save();
    return this.calculateCart(cart);
  }

  // ─── Helpers & Calculations ───────────────────────────────────────────────

  private async findProduct(idOrSlug: string): Promise<ProductDocument | null> {
    if (Types.ObjectId.isValid(idOrSlug)) {
      return this.productModel.findById(idOrSlug).exec();
    }
    return this.productModel.findOne({ slug: idOrSlug }).exec();
  }

  private resolveStockAndVariant(product: Product, variantSku?: string | null) {
    let stock = product.stockQuantity || 0;
    let variant: any = null;

    if (variantSku && product.variants?.length) {
      variant = product.variants.find((v) => v.sku === variantSku);
      if (variant) {
        stock = variant.stockQuantity || 0;
      }
    }

    return {
      stock,
      trackInventory: product.trackInventory ?? true,
      variant,
    };
  }

  private async calculateCart(cart: CartDocument): Promise<CartCalculationResult> {
    const allProductIds = [
      ...cart.items.map((i) => i.productId),
      ...cart.savedForLater.map((i) => i.productId),
    ];

    const products = await this.productModel
      .find({ _id: { $in: allProductIds } })
      .exec();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const populateItem = (item: any): PopulatedCartItem | null => {
      const prod = productMap.get(item.productId.toString());
      if (!prod) return null;

      let variant = null;
      if (item.variantSku && prod.variants?.length) {
        variant = prod.variants.find((v) => v.sku === item.variantSku);
      }

      const primaryImg =
        (variant?.imageUrl) ||
        prod.images?.find((img) => img.isPrimary)?.url ||
        prod.images?.[0]?.url ||
        '';

      const basePrice = variant ? variant.price : prod.basePrice || 0;
      const salePrice = variant ? variant.salePrice : prod.salePrice;
      let effectivePrice = salePrice && salePrice > 0 ? salePrice : basePrice;

      // Tiered Volume Pricing evaluation
      let isVolumeDiscounted = false;
      let volumeDiscountPercent = 0;
      if (prod.volumeTiers?.length) {
        const matchingTier = [...prod.volumeTiers]
          .filter((t) => item.quantity >= t.minQuantity && (t.maxQuantity == null || item.quantity <= t.maxQuantity))
          .sort((a, b) => b.minQuantity - a.minQuantity)[0];

        if (matchingTier) {
          isVolumeDiscounted = true;
          if (matchingTier.unitPrice != null && matchingTier.unitPrice > 0) {
            effectivePrice = matchingTier.unitPrice;
            volumeDiscountPercent = Math.max(0, Math.round(((basePrice - effectivePrice) / basePrice) * 100));
          } else if (matchingTier.discountPercent && matchingTier.discountPercent > 0) {
            volumeDiscountPercent = matchingTier.discountPercent;
            effectivePrice = +(basePrice * (1 - volumeDiscountPercent / 100)).toFixed(2);
          }
        }
      }

      const savingsPerUnit = basePrice > effectivePrice ? basePrice - effectivePrice : 0;
      const stock = variant ? variant.stockQuantity : prod.stockQuantity || 0;
      const inStock = prod.trackInventory ? stock > 0 : true;

      return {
        id: item._id,
        productId: prod._id.toString(),
        productSlug: prod.slug,
        name: prod.name,
        brandName: (prod as any).brandName || undefined,
        image: primaryImg,
        variantSku: item.variantSku || null,
        variantTitle: variant?.title || null,
        price: effectivePrice,
        originalPrice: basePrice,
        savings: +(savingsPerUnit * item.quantity).toFixed(2),
        quantity: item.quantity,
        selected: item.selected !== false,
        stockQuantity: stock,
        inStock,
        trackInventory: prod.trackInventory ?? true,
        lineTotal: +(effectivePrice * item.quantity).toFixed(2),
        volumeDiscountPercent: volumeDiscountPercent > 0 ? volumeDiscountPercent : undefined,
        isVolumeDiscounted,
      };
    };

    const populatedItems = cart.items
      .map(populateItem)
      .filter((i): i is PopulatedCartItem => i !== null);

    const populatedSaved = cart.savedForLater
      .map(populateItem)
      .filter((i): i is PopulatedCartItem => i !== null);

    // Sum up selected items
    const selectedItems = populatedItems.filter((i) => i.selected);
    const subtotal = +selectedItems
      .reduce((sum, item) => sum + item.lineTotal, 0)
      .toFixed(2);

    const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalCount = populatedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalSavings = +selectedItems
      .reduce((sum, item) => sum + item.savings, 0)
      .toFixed(2);

    const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const amountToFreeShipping = qualifiesForFreeShipping
      ? 0
      : +(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);

    let estimatedShipping = subtotal === 0 ? 0 : (qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE);

    // Coupon discount logic
    let discount = 0;
    if (cart.appliedCoupon && subtotal > 0) {
      try {
        const valResult = await this.couponsService.validateCoupon(
          cart.appliedCoupon,
          subtotal,
          cart.userId?.toString(),
        );
        if (valResult.isValid) {
          discount = valResult.discountAmount;
          if (valResult.isFreeShipping) {
            estimatedShipping = 0;
          }
        }
      } catch {
        discount = 0;
      }
    }

    const estimatedTax = +(subtotal * ESTIMATED_TAX_RATE).toFixed(2);
    const grandTotal = +(Math.max(0, subtotal + estimatedShipping + estimatedTax - discount)).toFixed(2);

    return {
      items: populatedItems,
      savedForLater: populatedSaved,
      itemCount,
      totalCount,
      subtotal,
      savings: totalSavings,
      qualifiesForFreeShipping,
      amountToFreeShipping,
      estimatedShipping,
      estimatedTax,
      discount,
      appliedCoupon: cart.appliedCoupon || null,
      grandTotal,
    };
  }
}
