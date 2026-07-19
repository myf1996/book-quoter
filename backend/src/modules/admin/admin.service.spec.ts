import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
import { AdminService } from './admin.service';

const mockRepo = () => ({
  find: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AdminService', () => {
  let service: AdminService;
  let trimSizeRepo: ReturnType<typeof mockRepo>;
  let userRepo: ReturnType<typeof mockRepo>;
  let quoteRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(TrimSize), useFactory: mockRepo },
        { provide: getRepositoryToken(CoverStyle), useFactory: mockRepo },
        { provide: getRepositoryToken(CoverFinish), useFactory: mockRepo },
        { provide: getRepositoryToken(PrintType), useFactory: mockRepo },
        { provide: getRepositoryToken(PaperStock), useFactory: mockRepo },
        { provide: getRepositoryToken(BindingType), useFactory: mockRepo },
        { provide: getRepositoryToken(PageRate), useFactory: mockRepo },
        { provide: getRepositoryToken(CoverRate), useFactory: mockRepo },
        { provide: getRepositoryToken(BindingRate), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: getRepositoryToken(Quote), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    trimSizeRepo = module.get(getRepositoryToken(TrimSize));
    userRepo = module.get(getRepositoryToken(User));
    quoteRepo = module.get(getRepositoryToken(Quote));
  });

  // ─── getDashboardStats ───────────────────────────────────────────────────────

  describe('getDashboardStats', () => {
    it('returns correct totals', async () => {
      userRepo.count.mockResolvedValue(5);
      quoteRepo.count.mockResolvedValue(10);
      const qb = { select: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ sum: '2500.50' }) };
      quoteRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getDashboardStats();

      expect(result).toEqual({ totalUsers: 5, totalQuotes: 10, totalRevenue: 2500.5 });
    });

    it('returns 0 revenue when no quotes exist', async () => {
      userRepo.count.mockResolvedValue(0);
      quoteRepo.count.mockResolvedValue(0);
      const qb = { select: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getRawOne: jest.fn().mockResolvedValue({ sum: null }) };
      quoteRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getDashboardStats();

      expect(result.totalRevenue).toBe(0);
    });
  });

  // ─── getAllTrimSizes ──────────────────────────────────────────────────────────

  describe('getAllTrimSizes', () => {
    it('returns all trim sizes when no status filter', async () => {
      const items = [{ id: 'uuid-1', name: 'Digest', status: ProductStatus.ACTIVE }];
      trimSizeRepo.find.mockResolvedValue(items);

      const result = await service.getAllTrimSizes();

      expect(trimSizeRepo.find).toHaveBeenCalledWith({ where: {}, order: { id: 'ASC' } });
      expect(result).toEqual(items);
    });

    it('filters by status when provided', async () => {
      const items = [{ id: 'uuid-1', name: 'Digest', status: ProductStatus.ACTIVE }];
      trimSizeRepo.find.mockResolvedValue(items);

      await service.getAllTrimSizes(ProductStatus.ACTIVE);

      expect(trimSizeRepo.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
        order: { id: 'ASC' },
      });
    });
  });

  // ─── createTrimSize ──────────────────────────────────────────────────────────

  describe('createTrimSize', () => {
    it('creates and returns a trim size', async () => {
      const dto = { name: 'Square', status: ProductStatus.ACTIVE };
      const entity = { id: 'uuid-1', ...dto };
      trimSizeRepo.create.mockReturnValue(entity);
      trimSizeRepo.save.mockResolvedValue(entity);

      const result = await service.createTrimSize(dto);

      expect(trimSizeRepo.create).toHaveBeenCalledWith({ name: 'Square', status: ProductStatus.ACTIVE });
      expect(result).toEqual(entity);
    });
  });

  // ─── updateTrimSize ──────────────────────────────────────────────────────────

  describe('updateTrimSize', () => {
    it('updates and returns the trim size', async () => {
      const entity = { id: 'uuid-1', name: 'Old', status: ProductStatus.ACTIVE };
      trimSizeRepo.findOneBy.mockResolvedValue(entity);
      trimSizeRepo.save.mockResolvedValue({ ...entity, name: 'New' });

      const result = await service.updateTrimSize('uuid-1', { name: 'New' });

      expect(trimSizeRepo.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
      expect(result.name).toBe('New');
    });

    it('throws NotFoundException when trim size not found', async () => {
      trimSizeRepo.findOneBy.mockResolvedValue(null);

      await expect(service.updateTrimSize('bad-id', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteTrimSize ──────────────────────────────────────────────────────────

  describe('deleteTrimSize', () => {
    it('soft-deletes successfully', async () => {
      trimSizeRepo.softDelete.mockResolvedValue({ affected: 1 });

      await expect(service.deleteTrimSize('uuid-1')).resolves.toBeUndefined();
      expect(trimSizeRepo.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      trimSizeRepo.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteTrimSize('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getAllUsers (paginated) ──────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('returns paginated result with defaults', async () => {
      const users = [{ id: 'u1', name: 'Test', email: 'test@test.com', role: UserRole.CUSTOMER, createdAt: new Date() }];
      userRepo.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.getAllUsers();

      expect(userRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
      expect(result.data).toEqual(users);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('calculates totalPages correctly', async () => {
      userRepo.findAndCount.mockResolvedValue([[], 45]);

      const result = await service.getAllUsers(1, 20);

      expect(result.totalPages).toBe(3);
    });

    it('applies correct skip for page 2', async () => {
      userRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getAllUsers(2, 20);

      expect(userRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 20 }));
    });
  });

  // ─── getAllQuotes (paginated) ─────────────────────────────────────────────────

  describe('getAllQuotes', () => {
    it('returns paginated quotes with user relation', async () => {
      const quotes = [{ id: 'q1', totalPrice: 100, user: { id: 'u1' } }];
      quoteRepo.findAndCount.mockResolvedValue([quotes, 1]);

      const result = await service.getAllQuotes();

      expect(quoteRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      }));
      expect(result.data).toEqual(quotes);
      expect(result.total).toBe(1);
    });
  });

  // ─── updateUserRole ──────────────────────────────────────────────────────────

  describe('updateUserRole', () => {
    it('updates role and returns UserView', async () => {
      const user = { id: 'u1', name: 'Alice', email: 'alice@test.com', role: UserRole.CUSTOMER, createdAt: new Date() };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue(user);

      const result = await service.updateUserRole('u1', { role: UserRole.ADMIN });

      expect(result.role).toBe(UserRole.ADMIN);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws NotFoundException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.updateUserRole('bad-id', { role: UserRole.ADMIN })).rejects.toThrow(NotFoundException);
    });
  });
});
