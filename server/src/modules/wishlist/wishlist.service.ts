import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CartService } from '../cart/cart.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { MergeWishlistDto } from './dto/merge-wishlist.dto';

export interface PopulatedWishlistItem {
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
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  addedAt: Date;
}

export interface WishlistResponse {
  items: PopulatedWishlistItem[];
  totalCount: number;
}

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private readonly wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly cartService: CartService,
  ) {}

  async getOrCreateWishlist(userId: string): Promise<WishlistDocument> {
    let wishlist = await this.wishlistModel.findOne({ userId }).exec();
    if (!wishlist) {
      wishlist = new this.wishlistModel({ userId, items: [] });
      await wishlist.save();
    }
    return wishlist;
  }

  async getPopulatedWishlist(userId: string): Promise<WishlistResponse> {
    const wishlist = await this.getOrCreateWishlist(userId);
    return this.populateWishlist(wishlist);
  }

  async addItem(userId: string, dto: AddWishlistItemDto): Promise<WishlistResponse> {
    const product = await this.productModel.findById(dto.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const exists = wishlist.items.some(
      (item) =>
        item.productId.toString() === product._id.toString() &&
        (item.variantSku || null) === (dto.variantSku || null),
    );

    if (!exists) {
      wishlist.items.push({
        _id: uuidv4(),
        productId: product._id as Types.ObjectId,
        variantSku: dto.variantSku || null,
        addedAt: new Date(),
      });
      await wishlist.save();
    }

    return this.populateWishlist(wishlist);
  }

  async removeItem(userId: string, identifier: string): Promise<WishlistResponse> {
    const wishlist = await this.getOrCreateWishlist(userId);

    wishlist.items = wishlist.items.filter(
      (item) =>
        item._id !== identifier &&
        item.productId.toString() !== identifier,
    );

    await wishlist.save();
    return this.populateWishlist(wishlist);
  }

  async clearWishlist(userId: string): Promise<WishlistResponse> {
    const wishlist = await this.getOrCreateWishlist(userId);
    wishlist.items = [];
    await wishlist.save();
    return { items: [], totalCount: 0 };
  }

  async moveToCart(userId: string, identifier: string): Promise<{ wishlist: WishlistResponse; cart: any }> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const itemIndex = wishlist.items.findIndex(
      (item) => item._id === identifier || item.productId.toString() === identifier,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in wishlist');
    }

    const item = wishlist.items[itemIndex];

    // Add to cart
    const updatedCart = await this.cartService.addItem(userId, {
      productId: item.productId.toString(),
      variantSku: item.variantSku || undefined,
      quantity: 1,
    });

    // Remove from wishlist
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    const updatedWishlist = await this.populateWishlist(wishlist);
    return { wishlist: updatedWishlist, cart: updatedCart };
  }

  async moveAllToCart(userId: string): Promise<{ wishlist: WishlistResponse; cart: any; movedCount: number }> {
    const wishlist = await this.getOrCreateWishlist(userId);
    if (!wishlist.items.length) {
      const currentCart = await this.cartService.getCalculatedCart(userId);
      return { wishlist: { items: [], totalCount: 0 }, cart: currentCart, movedCount: 0 };
    }

    let movedCount = 0;
    const remainingItems = [];
    let lastCart = null;

    for (const item of wishlist.items) {
      try {
        lastCart = await this.cartService.addItem(userId, {
          productId: item.productId.toString(),
          variantSku: item.variantSku || undefined,
          quantity: 1,
        });
        movedCount++;
      } catch (err) {
        // If out of stock, keep item in wishlist
        remainingItems.push(item);
      }
    }

    wishlist.items = remainingItems;
    await wishlist.save();

    if (!lastCart) {
      lastCart = await this.cartService.getCalculatedCart(userId);
    }

    const updatedWishlist = await this.populateWishlist(wishlist);
    return { wishlist: updatedWishlist, cart: lastCart, movedCount };
  }

  async mergeWishlist(userId: string, dto: MergeWishlistDto): Promise<WishlistResponse> {
    const wishlist = await this.getOrCreateWishlist(userId);

    for (const guestItem of dto.items) {
      const exists = wishlist.items.some(
        (item) =>
          item.productId.toString() === guestItem.productId &&
          (item.variantSku || null) === (guestItem.variantSku || null),
      );

      if (!exists && Types.ObjectId.isValid(guestItem.productId)) {
        wishlist.items.push({
          _id: uuidv4(),
          productId: new Types.ObjectId(guestItem.productId),
          variantSku: guestItem.variantSku || null,
          addedAt: new Date(),
        });
      }
    }

    await wishlist.save();
    return this.populateWishlist(wishlist);
  }

  private async populateWishlist(wishlist: WishlistDocument): Promise<WishlistResponse> {
    if (!wishlist.items || wishlist.items.length === 0) {
      return { items: [], totalCount: 0 };
    }

    const productIds = wishlist.items.map((i) => i.productId);
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .populate('brandId', 'name')
      .exec();

    const productMap = new Map<string, ProductDocument>();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    const populatedItems: PopulatedWishlistItem[] = [];

    for (const item of wishlist.items) {
      const prod = productMap.get(item.productId.toString());
      if (!prod) continue; // product may have been deleted

      let price = prod.salePrice || prod.basePrice;
      let originalPrice = prod.basePrice;
      let stock = prod.stockQuantity ?? 0;
      let variantTitle: string | null = null;
      let imageUrl = prod.thumbnailUrl || (prod.images && prod.images[0]?.url) || '';

      if (item.variantSku && prod.variants?.length) {
        const v = prod.variants.find((vr) => vr.sku === item.variantSku);
        if (v) {
          if (v.price) price = v.price;
          if (v.stockQuantity !== undefined) stock = v.stockQuantity;
          if (v.imageUrl) imageUrl = v.imageUrl;
          variantTitle = v.title || Object.entries(v.attributes || {})
            .map(([k, val]) => `${k}: ${val}`)
            .join(', ');
        }
      }

      const savings = originalPrice > price ? originalPrice - price : 0;
      const brandObj = prod.brandId as any;
      const brandName = brandObj?.name || (prod as any).brandName || '';

      populatedItems.push({
        id: item._id,
        productId: prod._id.toString(),
        productSlug: prod.slug,
        name: prod.name,
        brandName,
        image: imageUrl,
        variantSku: item.variantSku || null,
        variantTitle,
        price,
        originalPrice,
        savings,
        inStock: prod.trackInventory ? stock > 0 : true,
        stockQuantity: stock,
        rating: prod.ratingAverage || 4.5,
        reviewCount: prod.ratingCount || 12,
        addedAt: item.addedAt || new Date(),
      });
    }

    return {
      items: populatedItems,
      totalCount: populatedItems.length,
    };
  }
}
