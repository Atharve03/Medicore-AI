const {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} = require('../modules/admin/admin.validators');

describe('admin.validators', () => {
  describe('createUserSchema', () => {
    it('accepts a valid doctor payload', () => {
      const { error } = createUserSchema.validate({
        fullName: 'Dr. Rao',
        email: 'rao@medicore-hospital.com',
        password: 'Supersecret@1',
        role: 'doctor',
      });
      expect(error).toBeUndefined();
    });

    it('rejects an invalid role', () => {
      const { error } = createUserSchema.validate({
        fullName: 'Someone',
        email: 'someone@medicore-hospital.com',
        password: 'Supersecret@1',
        role: 'superAdmin',
      });
      expect(error).toBeDefined();
    });
  });

  describe('updateUserSchema', () => {
    it('rejects an empty update object', () => {
      const { error } = updateUserSchema.validate({});
      expect(error).toBeDefined();
    });

    it('accepts a partial update', () => {
      const { error } = updateUserSchema.validate({ isActive: false });
      expect(error).toBeUndefined();
    });
  });

  describe('userIdParamSchema', () => {
    it('accepts a valid Mongo ObjectId', () => {
      const { error } = userIdParamSchema.validate({
        id: '64f1a2b3c4d5e6f7a8b9c0d1',
      });
      expect(error).toBeUndefined();
    });

    it('rejects a malformed id', () => {
      const { error } = userIdParamSchema.validate({ id: 'not-an-id' });
      expect(error).toBeDefined();
    });
  });
});
