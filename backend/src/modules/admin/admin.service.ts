import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Coupon, DiscountType } from '../../entities/coupon.entity';
import { CouponUsage } from '../../entities/coupon-usage.entity';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateBindingRateDto } from './dto/create-binding-rate.dto';
import { CreateCoverRateDto } from './dto/create-cover-rate.dto';
import { CreatePageRateDto } from './dto/create-page-rate.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateBindingRateDto } from './dto/update-binding-rate.dto';
import { UpdateCoverRateDto } from './dto/update-cover-rate.dto';
import { UpdatePageRateDto } from './dto/update-page-rate.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

/** Dashboard statistics summary */
export interface DashboardStats {
  totalUsers: number;
  totalQuotes: number;
  totalRevenue: number;
}

/** Sanitized user view (no passwordHash) */
export interface UserView {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/** Coupon with total usage count */
export interface CouponWithStats extends Coupon {
  usageCount: number;
}

/** A single coupon redemption viewed from the admin user detail */
export interface CouponUsageView {
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number | null;
  usedAt: Date;
  quoteId: string | null;
}

/** Paginated result wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Fully resolved quote detail for admin view */
export interface QuoteDetailView {
  id: string;
  createdAt: Date;
  user: { id: string; name: string; email: string; role: string } | null;
  configuration: {
    trimSize: string;
    coverStyle: string;
    coverFinish: string;
    printType: string;
    paperStock: string;
    bindingType: string;
    pageCount: number;
    quantity: number;
  };
  priceBreakdown: Quote['priceBreakdown'];
  totalPrice: number;
  couponCode: string | null;
  discountAmount: number | null;
}

const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

/**
 * Provides all admin-level data operations:
 * product CRUD, pricing CRUD, user management, and quote/dashboard queries.
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(TrimSize) private trimSizeRepo: Repository<TrimSize>,
    @InjectRepository(CoverStyle) private coverStyleRepo: Repository<CoverStyle>,
    @InjectRepository(CoverFinish) private coverFinishRepo: Repository<CoverFinish>,
    @InjectRepository(PrintType) private printTypeRepo: Repository<PrintType>,
    @InjectRepository(PaperStock) private paperStockRepo: Repository<PaperStock>,
    @InjectRepository(BindingType) private bindingTypeRepo: Repository<BindingType>,
    @InjectRepository(PageRate) private pageRateRepo: Repository<PageRate>,
    @InjectRepository(CoverRate) private coverRateRepo: Repository<CoverRate>,
    @InjectRepository(BindingRate) private bindingRateRepo: Repository<BindingRate>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Quote) private quoteRepo: Repository<Quote>,
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage) private couponUsageRepo: Repository<CouponUsage>,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private paginate<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  /**
   * Returns aggregate platform statistics for the admin dashboard.
   * @returns Total user count, quote count, and sum of all quote revenue.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const totalUsers = await this.userRepo.count();
    const totalQuotes = await this.quoteRepo.count();
    const revenueResult = await this.quoteRepo
      .createQueryBuilder('quote')
      .select('SUM(quote.total_price)', 'sum')
      .where('quote.deleted_at IS NULL')
      .getRawOne<{ sum: string }>();
    const totalRevenue = parseFloat(revenueResult?.sum ?? '0');
    return { totalUsers, totalQuotes, totalRevenue };
  }

  // ─── TrimSize CRUD ────────────────────────────────────────────────────────────

  /** @returns Trim sizes; pass status to filter by active/inactive */
  getAllTrimSizes(status?: ProductStatus): Promise<TrimSize[]> {
    return this.trimSizeRepo.find({ where: status ? { status } : {}, order: { id: 'ASC' } });
  }

  /**
   * Creates a new trim size.
   * @param dto - Name and optional status for the new trim size
   */
  async createTrimSize(dto: CreateProductDto): Promise<TrimSize> {
    const entity = this.trimSizeRepo.create({ name: dto.name, status: dto.status });
    return this.trimSizeRepo.save(entity);
  }

  /**
   * Updates an existing trim size by ID.
   * @param id - Trim size ID
   * @param dto - Fields to update
   * @throws NotFoundException if the trim size does not exist
   */
  async updateTrimSize(id: string, dto: UpdateProductDto): Promise<TrimSize> {
    const entity = await this.trimSizeRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`TrimSize #${id} not found`);
    Object.assign(entity, dto);
    return this.trimSizeRepo.save(entity);
  }

  /**
   * Soft-deletes a trim size by ID.
   * @param id - Trim size ID
   * @throws NotFoundException if the trim size does not exist
   */
  async deleteTrimSize(id: string): Promise<void> {
    const result = await this.trimSizeRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`TrimSize #${id} not found`);
  }

  // ─── CoverStyle CRUD ─────────────────────────────────────────────────────────

  /** @returns Cover styles; pass status to filter by active/inactive */
  getAllCoverStyles(status?: ProductStatus): Promise<CoverStyle[]> {
    return this.coverStyleRepo.find({ where: status ? { status } : {}, order: { id: 'ASC' } });
  }

  /**
   * Creates a new cover style.
   * @param dto - Name and optional status
   */
  async createCoverStyle(dto: CreateProductDto): Promise<CoverStyle> {
    const entity = this.coverStyleRepo.create({ name: dto.name, status: dto.status });
    return this.coverStyleRepo.save(entity);
  }

  /**
   * Updates an existing cover style by ID.
   * @param id - Cover style ID
   * @param dto - Fields to update
   * @throws NotFoundException if the cover style does not exist
   */
  async updateCoverStyle(id: string, dto: UpdateProductDto): Promise<CoverStyle> {
    const entity = await this.coverStyleRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`CoverStyle #${id} not found`);
    Object.assign(entity, dto);
    return this.coverStyleRepo.save(entity);
  }

  /**
   * Soft-deletes a cover style by ID.
   * @param id - Cover style ID
   * @throws NotFoundException if the cover style does not exist
   */
  async deleteCoverStyle(id: string): Promise<void> {
    const result = await this.coverStyleRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`CoverStyle #${id} not found`);
  }

  // ─── CoverFinish CRUD ─────────────────────────────────────────────────────────

  /** @returns Cover finishes; pass status to filter by active/inactive */
  getAllCoverFinishes(status?: ProductStatus): Promise<CoverFinish[]> {
    return this.coverFinishRepo.find({ where: status ? { status } : {}, order: { id: 'ASC' } });
  }

  /**
   * Creates a new cover finish.
   * @param dto - Name and optional status
   */
  async createCoverFinish(dto: CreateProductDto): Promise<CoverFinish> {
    const entity = this.coverFinishRepo.create({ name: dto.name, status: dto.status });
    return this.coverFinishRepo.save(entity);
  }

  /**
   * Updates an existing cover finish by ID.
   * @param id - Cover finish ID
   * @param dto - Fields to update
   * @throws NotFoundException if the cover finish does not exist
   */
  async updateCoverFinish(id: string, dto: UpdateProductDto): Promise<CoverFinish> {
    const entity = await this.coverFinishRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`CoverFinish #${id} not found`);
    Object.assign(entity, dto);
    return this.coverFinishRepo.save(entity);
  }

  /**
   * Soft-deletes a cover finish by ID.
   * @param id - Cover finish ID
   * @throws NotFoundException if the cover finish does not exist
   */
  async deleteCoverFinish(id: string): Promise<void> {
    const result = await this.coverFinishRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`CoverFinish #${id} not found`);
  }

  // ─── PrintType CRUD ──────────────────────────────────────────────────────────

  /** @returns Print types; pass status to filter by active/inactive */
  getAllPrintTypes(status?: ProductStatus): Promise<PrintType[]> {
    return this.printTypeRepo.find({ where: status ? { status } : {}, order: { id: 'ASC' } });
  }

  /**
   * Creates a new print type.
   * @param dto - Name and optional status
   */
  async createPrintType(dto: CreateProductDto): Promise<PrintType> {
    const entity = this.printTypeRepo.create({ name: dto.name, status: dto.status });
    return this.printTypeRepo.save(entity);
  }

  /**
   * Updates an existing print type by ID.
   * @param id - Print type ID
   * @param dto - Fields to update
   * @throws NotFoundException if the print type does not exist
   */
  async updatePrintType(id: string, dto: UpdateProductDto): Promise<PrintType> {
    const entity = await this.printTypeRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`PrintType #${id} not found`);
    Object.assign(entity, dto);
    return this.printTypeRepo.save(entity);
  }

  /**
   * Soft-deletes a print type by ID.
   * @param id - Print type ID
   * @throws NotFoundException if the print type does not exist
   */
  async deletePrintType(id: string): Promise<void> {
    const result = await this.printTypeRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`PrintType #${id} not found`);
  }

  // ─── PaperStock CRUD ──────────────────────────────────────────────────────────

  /** @returns Paper stocks; pass status to filter by active/inactive */
  getAllPaperStocks(status?: ProductStatus): Promise<PaperStock[]> {
    return this.paperStockRepo.find({ where: status ? { status } : {}, order: { id: 'ASC' } });
  }

  /**
   * Creates a new paper stock.
   * @param dto - Name and optional status
   */
  async createPaperStock(dto: CreateProductDto): Promise<PaperStock> {
    const entity = this.paperStockRepo.create({ name: dto.name, status: dto.status });
    return this.paperStockRepo.save(entity);
  }

  /**
   * Updates an existing paper stock by ID.
   * @param id - Paper stock ID
   * @param dto - Fields to update
   * @throws NotFoundException if the paper stock does not exist
   */
  async updatePaperStock(id: string, dto: UpdateProductDto): Promise<PaperStock> {
    const entity = await this.paperStockRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`PaperStock #${id} not found`);
    Object.assign(entity, dto);
    return this.paperStockRepo.save(entity);
  }

  /**
   * Soft-deletes a paper stock by ID.
   * @param id - Paper stock ID
   * @throws NotFoundException if the paper stock does not exist
   */
  async deletePaperStock(id: string): Promise<void> {
    const result = await this.paperStockRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`PaperStock #${id} not found`);
  }

  // ─── BindingType CRUD ─────────────────────────────────────────────────────────

  /** @returns Binding types; pass status to filter by active/inactive */
  getAllBindingTypes(status?: ProductStatus): Promise<BindingType[]> {
    return this.bindingTypeRepo.find({ where: status ? { status } : {}, order: { id: 'ASC' } });
  }

  /**
   * Creates a new binding type.
   * @param dto - Name and optional status
   */
  async createBindingType(dto: CreateProductDto): Promise<BindingType> {
    const entity = this.bindingTypeRepo.create({ name: dto.name, status: dto.status });
    return this.bindingTypeRepo.save(entity);
  }

  /**
   * Updates an existing binding type by ID.
   * @param id - Binding type ID
   * @param dto - Fields to update
   * @throws NotFoundException if the binding type does not exist
   */
  async updateBindingType(id: string, dto: UpdateProductDto): Promise<BindingType> {
    const entity = await this.bindingTypeRepo.findOneBy({ id });
    if (!entity) throw new NotFoundException(`BindingType #${id} not found`);
    Object.assign(entity, dto);
    return this.bindingTypeRepo.save(entity);
  }

  /**
   * Soft-deletes a binding type by ID.
   * @param id - Binding type ID
   * @throws NotFoundException if the binding type does not exist
   */
  async deleteBindingType(id: string): Promise<void> {
    const result = await this.bindingTypeRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`BindingType #${id} not found`);
  }

  // ─── PageRate CRUD ────────────────────────────────────────────────────────────

  /** @returns All page rates with printType and paperStock relations loaded */
  getAllPageRates(): Promise<PageRate[]> {
    return this.pageRateRepo.find({ relations: ['printType', 'paperStock'] });
  }

  /**
   * Creates a new page rate.
   * @param dto - printTypeId, paperStockId, and ratePerPage
   */
  async createPageRate(dto: CreatePageRateDto): Promise<PageRate> {
    const rate = this.pageRateRepo.create({
      printType: { id: dto.printTypeId } as PrintType,
      paperStock: { id: dto.paperStockId } as PaperStock,
      ratePerPage: dto.ratePerPage,
    });
    return this.pageRateRepo.save(rate);
  }

  /**
   * Updates an existing page rate by ID.
   * @param id - Page rate ID
   * @param dto - Fields to update
   * @throws NotFoundException if the page rate does not exist
   */
  async updatePageRate(id: string, dto: UpdatePageRateDto): Promise<PageRate> {
    const entity = await this.pageRateRepo.findOne({ where: { id }, relations: ['printType', 'paperStock'] });
    if (!entity) throw new NotFoundException(`PageRate #${id} not found`);
    if (dto.printTypeId !== undefined) entity.printType = { id: dto.printTypeId } as PrintType;
    if (dto.paperStockId !== undefined) entity.paperStock = { id: dto.paperStockId } as PaperStock;
    if (dto.ratePerPage !== undefined) entity.ratePerPage = dto.ratePerPage;
    return this.pageRateRepo.save(entity);
  }

  /**
   * Soft-deletes a page rate by ID.
   * @param id - Page rate ID
   * @throws NotFoundException if the page rate does not exist
   */
  async deletePageRate(id: string): Promise<void> {
    const result = await this.pageRateRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`PageRate #${id} not found`);
  }

  // ─── CoverRate CRUD ───────────────────────────────────────────────────────────

  /** @returns All cover rates with coverStyle and coverFinish relations loaded */
  getAllCoverRates(): Promise<CoverRate[]> {
    return this.coverRateRepo.find({ relations: ['coverStyle', 'coverFinish'] });
  }

  /**
   * Creates a new cover rate.
   * @param dto - coverStyleId, coverFinishId, and basePrice
   */
  async createCoverRate(dto: CreateCoverRateDto): Promise<CoverRate> {
    const rate = this.coverRateRepo.create({
      coverStyle: { id: dto.coverStyleId } as CoverStyle,
      coverFinish: { id: dto.coverFinishId } as CoverFinish,
      basePrice: dto.basePrice,
    });
    return this.coverRateRepo.save(rate);
  }

  /**
   * Updates an existing cover rate by ID.
   * @param id - Cover rate ID
   * @param dto - Fields to update
   * @throws NotFoundException if the cover rate does not exist
   */
  async updateCoverRate(id: string, dto: UpdateCoverRateDto): Promise<CoverRate> {
    const entity = await this.coverRateRepo.findOne({ where: { id }, relations: ['coverStyle', 'coverFinish'] });
    if (!entity) throw new NotFoundException(`CoverRate #${id} not found`);
    if (dto.coverStyleId !== undefined) entity.coverStyle = { id: dto.coverStyleId } as CoverStyle;
    if (dto.coverFinishId !== undefined) entity.coverFinish = { id: dto.coverFinishId } as CoverFinish;
    if (dto.basePrice !== undefined) entity.basePrice = dto.basePrice;
    return this.coverRateRepo.save(entity);
  }

  /**
   * Soft-deletes a cover rate by ID.
   * @param id - Cover rate ID
   * @throws NotFoundException if the cover rate does not exist
   */
  async deleteCoverRate(id: string): Promise<void> {
    const result = await this.coverRateRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`CoverRate #${id} not found`);
  }

  // ─── BindingRate CRUD ─────────────────────────────────────────────────────────

  /** @returns All binding rates with bindingType relation loaded */
  getAllBindingRates(): Promise<BindingRate[]> {
    return this.bindingRateRepo.find({ relations: ['bindingType'] });
  }

  /**
   * Creates a new binding rate.
   * @param dto - bindingTypeId and surcharge
   */
  async createBindingRate(dto: CreateBindingRateDto): Promise<BindingRate> {
    const rate = this.bindingRateRepo.create({
      bindingType: { id: dto.bindingTypeId } as BindingType,
      surcharge: dto.surcharge,
    });
    return this.bindingRateRepo.save(rate);
  }

  /**
   * Updates an existing binding rate by ID.
   * @param id - Binding rate ID
   * @param dto - Fields to update
   * @throws NotFoundException if the binding rate does not exist
   */
  async updateBindingRate(id: string, dto: UpdateBindingRateDto): Promise<BindingRate> {
    const entity = await this.bindingRateRepo.findOne({ where: { id }, relations: ['bindingType'] });
    if (!entity) throw new NotFoundException(`BindingRate #${id} not found`);
    if (dto.bindingTypeId !== undefined) entity.bindingType = { id: dto.bindingTypeId } as BindingType;
    if (dto.surcharge !== undefined) entity.surcharge = dto.surcharge;
    return this.bindingRateRepo.save(entity);
  }

  /**
   * Soft-deletes a binding rate by ID.
   * @param id - Binding rate ID
   * @throws NotFoundException if the binding rate does not exist
   */
  async deleteBindingRate(id: string): Promise<void> {
    const result = await this.bindingRateRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`BindingRate #${id} not found`);
  }

  // ─── User Management ─────────────────────────────────────────────────────────

  /**
   * Returns a paginated list of users without their password hashes.
   * @param page - 1-based page number (default 1)
   * @param limit - Items per page (default 20)
   */
  async getAllUsers(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT): Promise<PaginatedResponse<UserView>> {
    const [users, total] = await this.userRepo.findAndCount({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return this.paginate(users as UserView[], total, page, limit);
  }

  /**
   * Updates the role of a user.
   * @param id - User ID
   * @param dto - New role to assign
   * @throws NotFoundException if the user does not exist
   */
  async updateUserRole(id: string, dto: UpdateUserRoleDto): Promise<UserView> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    user.role = dto.role;
    await this.userRepo.save(user);
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  /**
   * Soft-deletes a user by ID.
   * @param id - User ID
   * @throws NotFoundException if the user does not exist
   */
  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`User #${id} not found`);
  }

  // ─── Quote Management ─────────────────────────────────────────────────────────

  /**
   * Returns a paginated list of all quotes with user relation, ordered newest first.
   * Optionally filters by partial user name/email and/or exact coupon code.
   */
  async getAllQuotes(
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    userSearch?: string,
    couponCode?: string,
  ): Promise<PaginatedResponse<Quote>> {
    const search = userSearch?.trim();
    const coupon = couponCode?.trim().toUpperCase();

    let whereClause: object | object[] | undefined;

    if (search && coupon) {
      whereClause = [
        { user: { name: ILike(`%${search}%`) }, couponCode: coupon },
        { user: { email: ILike(`%${search}%`) }, couponCode: coupon },
      ];
    } else if (search) {
      whereClause = [
        { user: { name: ILike(`%${search}%`) } },
        { user: { email: ILike(`%${search}%`) } },
      ];
    } else if (coupon) {
      whereClause = { couponCode: coupon };
    }

    const [data, total] = await this.quoteRepo.findAndCount({
      relations: ['user', 'trimSize', 'coverStyle', 'coverFinish', 'printType', 'paperStock', 'bindingType'],
      where: whereClause,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return this.paginate(data, total, page, limit);
  }

  /**
   * Returns full resolved details for a single quote, with product names looked up.
   * @throws NotFoundException if the quote does not exist
   */
  async getQuoteDetail(id: string): Promise<QuoteDetailView> {
    const quote = await this.quoteRepo.findOne({
      where: { id },
      relations: ['user', 'trimSize', 'coverStyle', 'coverFinish', 'printType', 'paperStock', 'bindingType'],
    });
    if (!quote) throw new NotFoundException(`Quote #${id} not found`);

    return {
      id: quote.id,
      createdAt: quote.createdAt,
      user: quote.user
        ? { id: quote.user.id, name: quote.user.name, email: quote.user.email, role: quote.user.role }
        : null,
      configuration: {
        trimSize: quote.trimSize.name,
        coverStyle: quote.coverStyle.name,
        coverFinish: quote.coverFinish.name,
        printType: quote.printType.name,
        paperStock: quote.paperStock.name,
        bindingType: quote.bindingType.name,
        pageCount: quote.pageCount,
        quantity: quote.quantity,
      },
      priceBreakdown: quote.priceBreakdown,
      totalPrice: Number(quote.totalPrice),
      couponCode: quote.couponCode,
      discountAmount: quote.discountAmount !== null ? Number(quote.discountAmount) : null,
    };
  }

  // ─── Coupon Management ────────────────────────────────────────────────────────

  /**
   * Returns all coupons with their total usage count and optional user info.
   */
  async getAllCoupons(): Promise<CouponWithStats[]> {
    const coupons = await this.couponRepo.find({
      relations: ['applicableUser'],
      withDeleted: false,
      order: { createdAt: 'DESC' },
    });

    const counts = await Promise.all(
      coupons.map((c) => this.couponUsageRepo.count({ where: { coupon: { id: c.id } } })),
    );

    return coupons.map((c, i) => Object.assign(c, { usageCount: counts[i] }));
  }

  /**
   * Creates a new coupon.
   * @param dto - Coupon configuration
   */
  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepo.create({
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUsesPerUser: dto.maxUsesPerUser ?? 1,
      totalMaxUses: dto.totalMaxUses ?? null,
      status: (dto.isActive ?? true) ? ProductStatus.ACTIVE : ProductStatus.INACTIVE,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      applicableUser: dto.applicableUserId ? ({ id: dto.applicableUserId } as User) : null,
    });
    return this.couponRepo.save(coupon);
  }

  /**
   * Updates an existing coupon by ID.
   * @throws NotFoundException if the coupon does not exist
   */
  async updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id }, relations: ['applicableUser'] });
    if (!coupon) throw new NotFoundException(`Coupon #${id} not found`);

    if (dto.code !== undefined) coupon.code = dto.code;
    if (dto.discountType !== undefined) coupon.discountType = dto.discountType;
    if (dto.discountValue !== undefined) coupon.discountValue = dto.discountValue;
    if (dto.maxUsesPerUser !== undefined) coupon.maxUsesPerUser = dto.maxUsesPerUser;
    if (dto.totalMaxUses !== undefined) coupon.totalMaxUses = dto.totalMaxUses ?? null;
    if (dto.isActive !== undefined) coupon.status = dto.isActive ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
    if (dto.expiresAt !== undefined) coupon.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    if (dto.applicableUserId !== undefined) {
      coupon.applicableUser = dto.applicableUserId ? ({ id: dto.applicableUserId } as User) : null;
    }

    return this.couponRepo.save(coupon);
  }

  /**
   * Soft-deletes a coupon by ID.
   * @throws NotFoundException if the coupon does not exist
   */
  async deleteCoupon(id: string): Promise<void> {
    const result = await this.couponRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException(`Coupon #${id} not found`);
  }

  /**
   * Returns all coupons used by a specific user, newest first.
   */
  async getUserCouponUsage(userId: string): Promise<CouponUsageView[]> {
    const usages = await this.couponUsageRepo.find({
      where: { user: { id: userId } },
      relations: ['coupon', 'quote'],
      order: { createdAt: 'DESC' },
    });

    return usages.map((u) => ({
      couponCode: u.coupon.code,
      discountType: u.coupon.discountType,
      discountValue: Number(u.coupon.discountValue),
      discountAmount: u.quote ? Number(u.quote.discountAmount) : null,
      usedAt: u.createdAt,
      quoteId: u.quote?.id ?? null,
    }));
  }

  /**
   * Returns all quotes that used a specific coupon, newest first.
   */
  async getCouponQuotes(couponId: string): Promise<Quote[]> {
    const coupon = await this.couponRepo.findOneBy({ id: couponId });
    if (!coupon) throw new NotFoundException(`Coupon #${couponId} not found`);

    const usages = await this.couponUsageRepo.find({
      where: { coupon: { id: couponId } },
      relations: ['quote', 'quote.user', 'quote.trimSize', 'quote.coverStyle', 'quote.coverFinish', 'quote.printType', 'quote.paperStock', 'quote.bindingType'],
      order: { createdAt: 'DESC' },
    });

    return usages
      .filter((u) => u.quote !== null)
      .map((u) => u.quote as Quote);
  }
}
