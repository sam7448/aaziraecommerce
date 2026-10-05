import { Request, Response, NextFunction } from 'express';
import { authorizeRoles } from '../middleware/role.middleware';

describe('Role Authorization Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFn = jest.fn();
  });

  it('should call next() if user role is authorized', () => {
    mockReq = {
      user: {
        id: 'usr-1',
        email: 'admin@market.com',
        role: 'admin',
      },
    };

    const middleware = authorizeRoles('admin');
    middleware(mockReq as Request, mockRes as Response, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should block and return 403 Forbidden if user lacks required role', () => {
    mockReq = {
      user: {
        id: 'usr-2',
        email: 'customer@market.com',
        role: 'customer',
      },
    };

    const middleware = authorizeRoles('seller', 'admin');
    middleware(mockReq as Request, mockRes as Response, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      })
    );
  });

  it('should return 401 Unauthorized if user is not attached to request', () => {
    mockReq = {};

    const middleware = authorizeRoles('customer');
    middleware(mockReq as Request, mockRes as Response, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});
