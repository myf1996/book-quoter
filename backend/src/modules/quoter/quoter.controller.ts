import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { PriceBreakdown, Quote } from '../../entities/quote.entity';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { QuoterService } from './quoter.service';

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
   * POST /api/quoter/quote
   * Calculates price and saves the quote to the database.
   * Requires a valid JWT Bearer token.
   * Returns the saved Quote with the authenticated user's ID attached.
   */
  @Post('quote')
  @UseGuards(JwtAuthGuard)
  saveQuote(@Body() dto: CalculateQuoteDto, @Request() req: AuthRequest): Promise<Quote> {
    return this.quoterService.saveQuote(dto, req.user.id);
  }

  /**
   * GET /api/quoter/quotes
   * Returns all quotes saved by the authenticated user, newest first.
   * Requires a valid JWT Bearer token.
   */
  @Get('quotes')
  @UseGuards(JwtAuthGuard)
  getUserQuotes(@Request() req: AuthRequest): Promise<Quote[]> {
    return this.quoterService.getUserQuotes(req.user.id);
  }
}
