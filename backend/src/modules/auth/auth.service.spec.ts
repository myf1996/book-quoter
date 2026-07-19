import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { AuthService } from './auth.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = { sign: jest.fn().mockReturnValue('mock-token') };

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
  });

  // ─── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates a new user and returns a token', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const saved = { id: 'u1', name: 'Alice', email: 'alice@test.com', role: UserRole.CUSTOMER, passwordHash: 'hash' };
      userRepo.create.mockReturnValue(saved);
      userRepo.save.mockResolvedValue(saved);

      const result = await service.register({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('alice@test.com');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException when email already registered', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ name: 'Bob', email: 'taken@test.com', password: 'Password1!' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns token on valid credentials', async () => {
      const hash = await bcrypt.hash('Password1!', 10);
      const user = { id: 'u1', name: 'Alice', email: 'alice@test.com', role: UserRole.CUSTOMER, passwordHash: hash };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.login({ email: 'alice@test.com', password: 'Password1!' });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.id).toBe('u1');
    });

    it('throws UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'nobody@test.com', password: 'Password1!' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password wrong', async () => {
      const hash = await bcrypt.hash('CorrectPassword!', 10);
      userRepo.findOne.mockResolvedValue({ id: 'u1', passwordHash: hash });

      await expect(service.login({ email: 'alice@test.com', password: 'WrongPassword!' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── getProfile ──────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('returns user without passwordHash', async () => {
      const user = { id: 'u1', name: 'Alice', email: 'alice@test.com', role: UserRole.CUSTOMER, passwordHash: 'secret' };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.getProfile('u1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('alice@test.com');
    });

    it('throws NotFoundException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── changePassword ──────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('updates password hash when current password is correct', async () => {
      const hash = await bcrypt.hash('OldPass1!', 10);
      const user = { id: 'u1', passwordHash: hash };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue(user);

      const result = await service.changePassword('u1', {
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass1!',
      });

      expect(result.message).toBe('Password updated successfully');
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('throws UnauthorizedException when current password is wrong', async () => {
      const hash = await bcrypt.hash('CorrectPass!', 10);
      userRepo.findOne.mockResolvedValue({ id: 'u1', passwordHash: hash });

      await expect(
        service.changePassword('u1', { currentPassword: 'WrongPass!', newPassword: 'NewPass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
