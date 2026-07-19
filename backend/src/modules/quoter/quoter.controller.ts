import { Body, Controller, Get, ParseIntPipe, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { PriceBreakdown, Quote } from '../../entities/quote.entity';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponValidationResult, QuoterService } from './quoter.service';

/** Typed request with the authenticated user attached by JwtAuthGuard */
interface AuthRequest {
  user: AuthenticatedUser;
}

/**
 * Exposes pricing and quote-saving endpoints for the quoter wizard.
 * All routes are under /api/quoter.
 */
@Controller('api/quoter')
export class QuoterController {
  constructor(private readonly quoterService: QuoterService) {}

  /**
   * POST /api/quoter/calculate
   * Returns a PriceBreakdown for the given wizard configuration without saving.
   */
  @Post('calculate')
  calculatePrice(@Body() dto: CalculateQuoteDto): Promise<PriceBreakdown> {
    return this.quoterService.calculatePrice(dto);
  }

  /**
   * POST /api/quoter/validate-coupon
   * Validates a coupon code for the authenticated user.
   * Returns coupon type + value if valid; throws 400 if invalid/expired/ineligible.
   */
  @Post('validate-coupon')
  @UseGuards(JwtAuthGuard)
  validateCoupon(
    @Body() dto: ValidateCouponDto,
    @Request() req: AuthRequest,
  ): Promise<CouponValidationResult> {
    return this.quoterService.validateCoupon(dto.code, req.user.id);
  }

  /**
   * POST /api/quoter/quote
   * Calculates price and saves the quote to the database.
   * Optionally applies a coupon (couponCode field in body).
   * Requires a valid JWT Bearer token.
   */
  @Post('quote')
  @UseGuards(JwtAuthGuard)
  saveQuote(@Body() dto: CalculateQuoteDto, @Request() req: AuthRequest): Promise<Quote> {
    return this.quoterService.saveQuote(dto, req.user.id);
  }

  /**
   * GET /api/quoter/quotes?page=1&limit=20
   * Returns a paginated list of quotes saved by the authenticated user, newest first.
   */
  @Get('quotes')
  @UseGuards(JwtAuthGuard)
  getUserQuotes(
    @Request() req: AuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<{ data: Quote[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.quoterService.getUserQuotes(req.user.id, page, limit);
  }
}
