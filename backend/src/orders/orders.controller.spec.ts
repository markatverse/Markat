import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

describe('OrdersController buyer history', () => {
  const ordersService = {
    findByBuyer: vi.fn(),
  } as unknown as OrdersService;
  const jwtService = {
    verify: vi.fn(),
  } as unknown as JwtService;
  const controller = new OrdersController(ordersService, jwtService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the authenticated buyer's orders", async () => {
    const orders = [{ id: 'order-1' }];
    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'buyer-1' } as never);
    vi.mocked(ordersService.findByBuyer).mockResolvedValue(orders as never);

    await expect(controller.findByBuyer('buyer-1', 'Bearer valid-token')).resolves.toEqual(orders);
    expect(ordersService.findByBuyer).toHaveBeenCalledWith('buyer-1', []);
  });

  it('rejects requests without a token', async () => {
    await expect(controller.findByBuyer('buyer-1')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(ordersService.findByBuyer).not.toHaveBeenCalled();
  });

  it('rejects a buyer trying to read another account’s orders', async () => {
    vi.mocked(jwtService.verify).mockReturnValue({ sub: 'buyer-2' } as never);

    await expect(controller.findByBuyer('buyer-1', 'Bearer valid-token')).rejects.toBeInstanceOf(ForbiddenException);
    expect(ordersService.findByBuyer).not.toHaveBeenCalled();
  });
});
