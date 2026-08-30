jest.mock('../config/redis',()=>({del:jest.fn()}));
jest.mock('../repositories/user.repository');
jest.mock('../repositories/patient.repository');
jest.mock('../repositories/doctor.repository');
const authorize=require('../middlewares/authorize'); const users=require('../repositories/user.repository'); const service=require('../modules/admin/admin.service');

describe('super-admin privilege boundary',()=>{
  beforeEach(()=>jest.resetAllMocks());
  it('allows superAdmin to inherit an admin-only middleware permission',()=>{const next=jest.fn();authorize('admin')({user:{role:'superAdmin'}},{},next);expect(next).toHaveBeenCalledWith();});
  it('prevents a regular admin from creating privileged accounts',async()=>{await expect(service.createUser({fullName:'Root',email:'root@example.com',password:'Strong@123',role:'admin'},{id:'a',role:'admin'})).rejects.toMatchObject({statusCode:403});await expect(service.createUser({fullName:'Root',email:'root@example.com',password:'Strong@123',role:'superAdmin'},{id:'a',role:'admin'})).rejects.toMatchObject({statusCode:403});});
  it('allows a super admin to create an admin account',async()=>{users.findByEmail.mockResolvedValue(null);users.create.mockResolvedValue({toSafeJSON:()=>({role:'admin'})});await expect(service.createUser({fullName:'Admin',email:'admin2@example.com',password:'Strong@123',role:'admin'},{id:'s',role:'superAdmin'})).resolves.toEqual({role:'admin'});});
  it('prevents a regular admin from editing a super admin',async()=>{users.findById.mockResolvedValue({_id:'s',role:'superAdmin'});await expect(service.updateUser('507f1f77bcf86cd799439011',{isActive:false},{id:'a',role:'admin'})).rejects.toMatchObject({statusCode:403});});
});
