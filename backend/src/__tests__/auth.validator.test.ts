import { loginSchema, registerSchema } from '../validators/auth.validator';

describe('Auth Validator Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid email and password', () => {
      const validData = {
        email: 'customer@example.com',
        password: 'password123',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email address');
      }
    });

    it('should reject short passwords', () => {
      const invalidData = {
        email: 'customer@example.com',
        password: '123',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 6 characters');
      }
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration payload', () => {
      const valid = {
        email: 'seller@example.com',
        password: 'securePassword123',
        fullName: 'Jane Doe',
        role: 'seller',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing full name', () => {
      const invalid = {
        email: 'seller@example.com',
        password: 'securePassword123',
        fullName: '',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
