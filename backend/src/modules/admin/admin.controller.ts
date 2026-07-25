import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { UserRole } from '../../entities/user.entity';
import { BindingRate } from '../../entities/binding-rate.entity';
import { BindingType } from '../../entities/binding-type.entity';
import { CoverFinish } from '../../entities/cover-finish.entity';
import { CoverFinishRate } from '../../entities/cover-finish-rate.entity';
import { CoverStyleRate } from '../../entities/cover-style-rate.entity';
import { CoverStyle } from '../../entities/cover-style.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { PaperStock } from '../../entities/paper-stock.entity';
import { PrintType } from '../../entities/print-type.entity';
import { Quote } from '../../entities/quote.entity';
import { TrimSize } from '../../entities/trim-size.entity';
import { AdminService, CouponWithStats, CouponUsageView, DashboardStats, PaginatedResponse, QuoteDetailView, UserView } from './admin.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateBindingRateDto } from './dto/create-binding-rate.dto';
import { CreateCoverFinishRateDto } from './dto/create-cover-finish-rate.dto';
import { CreateCoverStyleRateDto } from './dto/create-cover-style-rate.dto';
import { CreatePageRateDto } from './dto/create-page-rate.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateBindingRateDto } from './dto/update-binding-rate.dto';
import { UpdateCoverFinishRateDto } from './dto/update-cover-finish-rate.dto';
import { UpdateCoverStyleRateDto } from './dto/update-cover-style-rate.dto';
import { UpdatePageRateDto } from './dto/update-page-rate.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

/**
 * Handles all admin panel API routes.
 * All endpoints require a valid JWT and the ADMIN role.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  /** GET /api/admin/dashboard */
  @Get('dashboard')
  getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }

  // ─── Trim Sizes ─────────────────────────────────────────────────────────────

  /** GET /api/admin/trim-sizes?status=active|inactive */
  @Get('trim-sizes')
  getTrimSizes(@Query('status') status?: ProductStatus): Promise<TrimSize[]> {
    return this.adminService.getAllTrimSizes(status);
  }

  /** POST /api/admin/trim-sizes */
  @Post('trim-sizes')
  createTrimSize(@Body() dto: CreateProductDto): Promise<TrimSize> {
    return this.adminService.createTrimSize(dto);
  }

  /** PATCH /api/admin/trim-sizes/:id */
  @Patch('trim-sizes/:id')
  updateTrimSize(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<TrimSize> {
    return this.adminService.updateTrimSize(id, dto);
  }

  /** DELETE /api/admin/trim-sizes/:id */
  @Delete('trim-sizes/:id')
  @HttpCode(204)
  deleteTrimSize(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteTrimSize(id);
  }

  // ─── Cover Styles ────────────────────────────────────────────────────────────

  /** GET /api/admin/cover-styles?status=active|inactive */
  @Get('cover-styles')
  getCoverStyles(@Query('status') status?: ProductStatus): Promise<CoverStyle[]> {
    return this.adminService.getAllCoverStyles(status);
  }

  /** POST /api/admin/cover-styles */
  @Post('cover-styles')
  createCoverStyle(@Body() dto: CreateProductDto): Promise<CoverStyle> {
    return this.adminService.createCoverStyle(dto);
  }

  /** PATCH /api/admin/cover-styles/:id */
  @Patch('cover-styles/:id')
  updateCoverStyle(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<CoverStyle> {
    return this.adminService.updateCoverStyle(id, dto);
  }

  /** DELETE /api/admin/cover-styles/:id */
  @Delete('cover-styles/:id')
  @HttpCode(204)
  deleteCoverStyle(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteCoverStyle(id);
  }

  // ─── Cover Finishes ──────────────────────────────────────────────────────────

  /** GET /api/admin/cover-finishes?status=active|inactive */
  @Get('cover-finishes')
  getCoverFinishes(@Query('status') status?: ProductStatus): Promise<CoverFinish[]> {
    return this.adminService.getAllCoverFinishes(status);
  }

  /** POST /api/admin/cover-finishes */
  @Post('cover-finishes')
  createCoverFinish(@Body() dto: CreateProductDto): Promise<CoverFinish> {
    return this.adminService.createCoverFinish(dto);
  }

  /** PATCH /api/admin/cover-finishes/:id */
  @Patch('cover-finishes/:id')
  updateCoverFinish(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<CoverFinish> {
    return this.adminService.updateCoverFinish(id, dto);
  }

  /** DELETE /api/admin/cover-finishes/:id */
  @Delete('cover-finishes/:id')
  @HttpCode(204)
  deleteCoverFinish(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteCoverFinish(id);
  }

  // ─── Print Types ─────────────────────────────────────────────────────────────

  /** GET /api/admin/print-types?status=active|inactive */
  @Get('print-types')
  getPrintTypes(@Query('status') status?: ProductStatus): Promise<PrintType[]> {
    return this.adminService.getAllPrintTypes(status);
  }

  /** POST /api/admin/print-types */
  @Post('print-types')
  createPrintType(@Body() dto: CreateProductDto): Promise<PrintType> {
    return this.adminService.createPrintType(dto);
  }

  /** PATCH /api/admin/print-types/:id */
  @Patch('print-types/:id')
  updatePrintType(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<PrintType> {
    return this.adminService.updatePrintType(id, dto);
  }

  /** DELETE /api/admin/print-types/:id */
  @Delete('print-types/:id')
  @HttpCode(204)
  deletePrintType(@Param('id') id: string): Promise<void> {
    return this.adminService.deletePrintType(id);
  }

  // ─── Paper Stocks ────────────────────────────────────────────────────────────

  /** GET /api/admin/paper-stocks?status=active|inactive */
  @Get('paper-stocks')
  getPaperStocks(@Query('status') status?: ProductStatus): Promise<PaperStock[]> {
    return this.adminService.getAllPaperStocks(status);
  }

  /** POST /api/admin/paper-stocks */
  @Post('paper-stocks')
  createPaperStock(@Body() dto: CreateProductDto): Promise<PaperStock> {
    return this.adminService.createPaperStock(dto);
  }

  /** PATCH /api/admin/paper-stocks/:id */
  @Patch('paper-stocks/:id')
  updatePaperStock(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<PaperStock> {
    return this.adminService.updatePaperStock(id, dto);
  }

  /** DELETE /api/admin/paper-stocks/:id */
  @Delete('paper-stocks/:id')
  @HttpCode(204)
  deletePaperStock(@Param('id') id: string): Promise<void> {
    return this.adminService.deletePaperStock(id);
  }

  // ─── Binding Types ───────────────────────────────────────────────────────────

  /** GET /api/admin/binding-types?status=active|inactive */
  @Get('binding-types')
  getBindingTypes(@Query('status') status?: ProductStatus): Promise<BindingType[]> {
    return this.adminService.getAllBindingTypes(status);
  }

  /** POST /api/admin/binding-types */
  @Post('binding-types')
  createBindingType(@Body() dto: CreateProductDto): Promise<BindingType> {
    return this.adminService.createBindingType(dto);
  }

  /** PATCH /api/admin/binding-types/:id */
  @Patch('binding-types/:id')
  updateBindingType(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<BindingType> {
    return this.adminService.updateBindingType(id, dto);
  }

  /** DELETE /api/admin/binding-types/:id */
  @Delete('binding-types/:id')
  @HttpCode(204)
  deleteBindingType(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteBindingType(id);
  }

  // ─── Page Rates ──────────────────────────────────────────────────────────────

  /** GET /api/admin/page-rates */
  @Get('page-rates')
  getPageRates(): Promise<PageRate[]> {
    return this.adminService.getAllPageRates();
  }

  /** POST /api/admin/page-rates */
  @Post('page-rates')
  createPageRate(@Body() dto: CreatePageRateDto): Promise<PageRate> {
    return this.adminService.createPageRate(dto);
  }

  /** PATCH /api/admin/page-rates/:id */
  @Patch('page-rates/:id')
  updatePageRate(
    @Param('id') id: string,
    @Body() dto: UpdatePageRateDto,
  ): Promise<PageRate> {
    return this.adminService.updatePageRate(id, dto);
  }

  /** DELETE /api/admin/page-rates/:id */
  @Delete('page-rates/:id')
  @HttpCode(204)
  deletePageRate(@Param('id') id: string): Promise<void> {
    return this.adminService.deletePageRate(id);
  }

  // ─── Cover Style Rates ───────────────────────────────────────────────────────

  /** GET /api/admin/cover-style-rates */
  @Get('cover-style-rates')
  getCoverStyleRates(): Promise<CoverStyleRate[]> {
    return this.adminService.getAllCoverStyleRates();
  }

  /** POST /api/admin/cover-style-rates */
  @Post('cover-style-rates')
  createCoverStyleRate(@Body() dto: CreateCoverStyleRateDto): Promise<CoverStyleRate> {
    return this.adminService.createCoverStyleRate(dto);
  }

  /** PATCH /api/admin/cover-style-rates/:id */
  @Patch('cover-style-rates/:id')
  updateCoverStyleRate(
    @Param('id') id: string,
    @Body() dto: UpdateCoverStyleRateDto,
  ): Promise<CoverStyleRate> {
    return this.adminService.updateCoverStyleRate(id, dto);
  }

  /** DELETE /api/admin/cover-style-rates/:id */
  @Delete('cover-style-rates/:id')
  @HttpCode(204)
  deleteCoverStyleRate(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteCoverStyleRate(id);
  }

  // ─── Cover Finish Rates ──────────────────────────────────────────────────────

  /** GET /api/admin/cover-finish-rates */
  @Get('cover-finish-rates')
  getCoverFinishRates(): Promise<CoverFinishRate[]> {
    return this.adminService.getAllCoverFinishRates();
  }

  /** POST /api/admin/cover-finish-rates */
  @Post('cover-finish-rates')
  createCoverFinishRate(@Body() dto: CreateCoverFinishRateDto): Promise<CoverFinishRate> {
    return this.adminService.createCoverFinishRate(dto);
  }

  /** PATCH /api/admin/cover-finish-rates/:id */
  @Patch('cover-finish-rates/:id')
  updateCoverFinishRate(
    @Param('id') id: string,
    @Body() dto: UpdateCoverFinishRateDto,
  ): Promise<CoverFinishRate> {
    return this.adminService.updateCoverFinishRate(id, dto);
  }

  /** DELETE /api/admin/cover-finish-rates/:id */
  @Delete('cover-finish-rates/:id')
  @HttpCode(204)
  deleteCoverFinishRate(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteCoverFinishRate(id);
  }

  // ─── Binding Rates ───────────────────────────────────────────────────────────

  /** GET /api/admin/binding-rates */
  @Get('binding-rates')
  getBindingRates(): Promise<BindingRate[]> {
    return this.adminService.getAllBindingRates();
  }

  /** POST /api/admin/binding-rates */
  @Post('binding-rates')
  createBindingRate(@Body() dto: CreateBindingRateDto): Promise<BindingRate> {
    return this.adminService.createBindingRate(dto);
  }

  /** PATCH /api/admin/binding-rates/:id */
  @Patch('binding-rates/:id')
  updateBindingRate(
    @Param('id') id: string,
    @Body() dto: UpdateBindingRateDto,
  ): Promise<BindingRate> {
    return this.adminService.updateBindingRate(id, dto);
  }

  /** DELETE /api/admin/binding-rates/:id */
  @Delete('binding-rates/:id')
  @HttpCode(204)
  deleteBindingRate(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteBindingRate(id);
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  /** GET /api/admin/users?page=1&limit=20 */
  @Get('users')
  getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<PaginatedResponse<UserView>> {
    return this.adminService.getAllUsers(page, limit);
  }

  /** PATCH /api/admin/users/:id/role */
  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserView> {
    return this.adminService.updateUserRole(id, dto);
  }

  /** DELETE /api/admin/users/:id */
  @Delete('users/:id')
  @HttpCode(204)
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteUser(id);
  }

  // ─── Quotes ──────────────────────────────────────────────────────────────────

  /** GET /api/admin/quotes?page=1&limit=20&userSearch=john&couponCode=SAVE10 */
  @Get('quotes')
  getQuotes(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('userSearch') userSearch?: string,
    @Query('couponCode') couponCode?: string,
  ): Promise<PaginatedResponse<Quote>> {
    return this.adminService.getAllQuotes(page, limit, userSearch, couponCode);
  }

  /** GET /api/admin/quotes/:id — full resolved detail for a single quote */
  @Get('quotes/:id')
  getQuoteDetail(@Param('id') id: string): Promise<QuoteDetailView> {
    return this.adminService.getQuoteDetail(id);
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────────

  /** GET /api/admin/coupons */
  @Get('coupons')
  getCoupons(): Promise<CouponWithStats[]> {
    return this.adminService.getAllCoupons();
  }

  /** POST /api/admin/coupons */
  @Post('coupons')
  createCoupon(@Body() dto: CreateCouponDto): Promise<CouponWithStats> {
    return this.adminService.createCoupon(dto) as Promise<CouponWithStats>;
  }

  /** PATCH /api/admin/coupons/:id */
  @Patch('coupons/:id')
  updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ): Promise<CouponWithStats> {
    return this.adminService.updateCoupon(id, dto) as Promise<CouponWithStats>;
  }

  /** DELETE /api/admin/coupons/:id */
  @Delete('coupons/:id')
  @HttpCode(204)
  deleteCoupon(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteCoupon(id);
  }

  /** GET /api/admin/users/:id/coupon-usage */
  @Get('users/:id/coupon-usage')
  getUserCouponUsage(@Param('id') id: string): Promise<CouponUsageView[]> {
    return this.adminService.getUserCouponUsage(id);
  }

  /** GET /api/admin/coupons/:id/quotes — quotes that used this coupon */
  @Get('coupons/:id/quotes')
  getCouponQuotes(@Param('id') id: string): Promise<Quote[]> {
    return this.adminService.getCouponQuotes(id);
  }
}
