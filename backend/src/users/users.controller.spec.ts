import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController profile ownership', () => {
  const usersService = {
    getAddresses: vi.fn(),
    findRole: vi.fn(),
    update: vi.fn(),
  } as unknown as UsersService;
  const jwtService = {
    verify: vi.fn(),
  } as unknown as JwtService;
  const controller = new UsersController(usersService, jwtService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns addresses for the authenticated account', async () => {
    const addresses = [{ id: 'address-1' }];
    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'user-1' } as never);
    vi.mocked(usersService.getAddresses).mockResolvedValue(addresses as never);

    await expect(controller.getAddresses('user-1', 'Bearer valid-token')).resolves.toEqual(addresses);
    expect(usersService.getAddresses).toHaveBeenCalledWith('user-1');
  });

  it('rejects address reads without a valid owner session', async () => {
    await expect(controller.getAddresses('user-1')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.getAddresses).not.toHaveBeenCalled();

    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'user-2' } as never);
    await expect(controller.getAddresses('user-1', 'Bearer valid-token')).rejects.toBeInstanceOf(ForbiddenException);
    expect(usersService.getAddresses).not.toHaveBeenCalled();
  });

  it('limits self-service profile updates to contact fields', async () => {
    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'user-1', role: 'CONSUMER' } as never);
    vi.mocked(usersService.findRole).mockResolvedValue('CONSUMER' as never);

    await controller.update('user-1', {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '1234567890',
      role: 'ADMIN',
    }, 'Bearer valid-token');

    expect(usersService.update).toHaveBeenCalledWith('user-1', {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '1234567890',
    });
  });

  it('does not trust an admin role claim without checking the current user role', async () => {
    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'attacker-1', role: 'ADMIN' } as never);
    vi.mocked(usersService.findRole).mockResolvedValue('CONSUMER' as never);

    await expect(controller.update('victim-1', { role: 'SUPER_ADMIN' }, 'Bearer valid-token'))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(usersService.update).not.toHaveBeenCalled();
  });

  it('allows a current administrator to update another account', async () => {
    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'admin-1', role: 'CONSUMER' } as never);
    vi.mocked(usersService.findRole).mockResolvedValue('SUPER_ADMIN' as never);

    await controller.update('user-1', { role: 'SELLER' }, 'Bearer valid-token');
    expect(usersService.update).toHaveBeenCalledWith('user-1', { role: 'SELLER' });
  });
});
