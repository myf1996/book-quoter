import { Body, Controller, Post } from '@nestjs/common';
import { PriceBreakdown, Quote } from '../../entities/quote.entity';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { QuoterService } from './quoter.service';

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
   * Calculates price and saves the quote to the database. Returns the saved Quote.
   */
  @Post('quote')
  saveQuote(@Body() dto: CalculateQuoteDto): Promise<Quote> {
    return this.quoterService.saveQuote(dto);
  }
}
