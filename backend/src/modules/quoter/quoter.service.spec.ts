import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BindingRate } from '../../entities/binding-rate.entity';
import { CoverRate } from '../../entities/cover-rate.entity';
import { PageRate } from '../../entities/page-rate.entity';
import { Quote } from '../../entities/quote.entity';
import { CalculateQuoteDto } from './dto/calculate-quote.dto';
import { QuoterService } from './quoter.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
});

const baseDto: CalculateQuoteDto = {
  trimSizeId: 'ts-uuid',
  coverStyleId: 'cs-uuid',
  coverFinishId: 'cf-uuid',
  printTypeId: 'pt-uuid',
  paperStockId: 'ps-uuid',
  bindingTypeId: 'bt-uuid',
  pageCount: 200,
  quantity: 100,
};

describe('QuoterService', () => {
  let service: QuoterService;
  let pageRateRepo: ReturnType<typeof mockRepo>;
  let coverRateRepo: ReturnType<typeof mockRepo>;
  let bindingRateRepo: ReturnType<typeof mockRepo>;
  let quoteRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuoterService,
        { provide: getRepositoryToken(PageRate), useFactory: mockRepo },
        { provide: getRepositoryToken(CoverRate), useFactory: mockRepo },
        { provide: getRepositoryToken(BindingRate), useFactory: mockRepo },
        { provide: getRepositoryToken(Quote), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<QuoterService>(QuoterService);
    pageRateRepo = module.get(getRepositoryToken(PageRate));
    coverRateRepo = module.get(getRepositoryToken(CoverRate));
    bindingRateRepo = module.get(getRepositoryToken(BindingRate));
    quoteRepo = module.get(getRepositoryToken(Quote));
  });

  // ─── calculatePrice ──────────────────────────────────────────────────────────

  describe('calculatePrice', () => {
    beforeEach(() => {
      pageRateRepo.findOne.mockResolvedValue({ ratePerPage: 0.035 });
      coverRateRepo.findOne.mockResolvedValue({ basePrice: 3.5 });
      bindingRateRepo.findOne.mockResolvedValue({ surcharge: 1.5 });
    });

    it('calculates correct breakdown', async () => {
      const result = await service.calculatePrice(baseDto);

      // pageCost = 0.035 * 200 = 7.00
      expect(result.pageCost).toBe(7.0);
      // coverCost = 3.50
      expect(result.coverCost).toBe(3.5);
      // bindingCost = 1.50
      expect(result.bindingCost).toBe(1.5);
      // subtotal = (7 + 3.5 + 1.5) * 100 = 1200
      expect(result.subtotal).toBe(1200);
      // tax = 1200 * 0.08 = 96
      expect(result.tax).toBe(96);
      // total = 1296
      expect(result.total).toBe(1296);
    });

    it('throws NotFoundException when page rate missing', async () => {
      pageRateRepo.findOne.mockResolvedValue(null);

      await expect(service.calculatePrice(baseDto)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when cover rate missing', async () => {
      coverRateRepo.findOne.mockResolvedValue(null);

      await expect(service.calculatePrice(baseDto)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when binding rate missing', async () => {
      bindingRateRepo.findOne.mockResolvedValue(null);

      await expect(service.calculatePrice(baseDto)).rejects.toThrow(NotFoundException);
    });

    it('looks up rates by correct FK IDs', async () => {
      await service.calculatePrice(baseDto);

      expect(pageRateRepo.findOne).toHaveBeenCalledWith({
        where: {
          printType: { id: 'pt-uuid' },
          paperStock: { id: 'ps-uuid' },
        },
      });
      expect(coverRateRepo.findOne).toHaveBeenCalledWith({
        where: {
          coverStyle: { id: 'cs-uuid' },
          coverFinish: { id: 'cf-uuid' },
        },
      });
      expect(bindingRateRepo.findOne).toHaveBeenCalledWith({
        where: { bindingType: { id: 'bt-uuid' } },
      });
    });
  });

  // ─── saveQuote ────────────────────────────────────────────────────────────────

  describe('saveQuote', () => {
    it('creates and saves quote with breakdown', async () => {
      pageRateRepo.findOne.mockResolvedValue({ ratePerPage: 0.035 });
      coverRateRepo.findOne.mockResolvedValue({ basePrice: 3.5 });
      bindingRateRepo.findOne.mockResolvedValue({ surcharge: 1.5 });
      const savedQuote = { id: 'q-uuid', totalPrice: 1296 };
      quoteRepo.create.mockReturnValue(savedQuote);
      quoteRepo.save.mockResolvedValue(savedQuote);

      const result = await service.saveQuote(baseDto, 'user-uuid');

      expect(quoteRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        pageCount: 200,
        quantity: 100,
        totalPrice: 1296,
        user: { id: 'user-uuid' },
      }));
      expect(result).toEqual(savedQuote);
    });
  });

  // ─── getUserQuotes (paginated) ────────────────────────────────────────────────

  describe('getUserQuotes', () => {
    it('returns paginated quotes for a user', async () => {
      const quotes = [{ id: 'q1', totalPrice: 500 }];
      quoteRepo.findAndCount.mockResolvedValue([quotes, 1]);

      const result = await service.getUserQuotes('user-uuid');

      expect(quoteRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        where: { user: { id: 'user-uuid' } },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      }));
      expect(result.data).toEqual(quotes);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('applies correct skip for page 3 with limit 10', async () => {
      quoteRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getUserQuotes('user-uuid', 3, 10);

      expect(quoteRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
    });
  });
});
