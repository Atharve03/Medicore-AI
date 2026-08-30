jest.mock('../repositories/patient.repository');
jest.mock('../repositories/doctor.repository');

const patientRepository = require('../repositories/patient.repository');
const doctorRepository = require('../repositories/doctor.repository');
const {
  resolveOwnPatientId,
  resolveOwnDoctorId,
  assertCanAccessPatient,
  McpAccessError,
} = require('../mcp/servers/_shared/authz');

describe('mcp authz helpers', () => {
  afterEach(() => jest.resetAllMocks());

  describe('resolveOwnPatientId', () => {
    it('resolves the patient id for a patient user', async () => {
      patientRepository.findByUserId.mockResolvedValue({ _id: 'p1' });
      const id = await resolveOwnPatientId({ id: 'u1', role: 'patient' });
      expect(id).toBe('p1');
    });

    it('throws for a non-patient role', async () => {
      await expect(resolveOwnPatientId({ id: 'u1', role: 'doctor' })).rejects.toThrow(
        McpAccessError
      );
    });

    it('throws when no linked patient profile exists', async () => {
      patientRepository.findByUserId.mockResolvedValue(null);
      await expect(resolveOwnPatientId({ id: 'u1', role: 'patient' })).rejects.toThrow(
        /No patient profile/
      );
    });
  });

  describe('resolveOwnDoctorId', () => {
    it('resolves the doctor id for a doctor user', async () => {
      doctorRepository.findByUserId.mockResolvedValue({ _id: 'd1' });
      const id = await resolveOwnDoctorId({ id: 'u1', role: 'doctor' });
      expect(id).toBe('d1');
    });

    it('throws for a non-doctor role', async () => {
      await expect(resolveOwnDoctorId({ id: 'u1', role: 'patient' })).rejects.toThrow(
        McpAccessError
      );
    });
  });

  describe('assertCanAccessPatient', () => {
    it('allows a patient to access their own data', async () => {
      patientRepository.findByUserId.mockResolvedValue({ _id: 'p1' });
      await expect(
        assertCanAccessPatient({ id: 'u1', role: 'patient' }, 'p1', ['admin'])
      ).resolves.toBeUndefined();
    });

    it("blocks a patient from accessing another patient's data", async () => {
      patientRepository.findByUserId.mockResolvedValue({ _id: 'p1' });
      await expect(
        assertCanAccessPatient({ id: 'u1', role: 'patient' }, 'p2', ['admin'])
      ).rejects.toThrow(McpAccessError);
    });

    it('allows a listed staff role to access any patient', async () => {
      await expect(
        assertCanAccessPatient({ id: 'u1', role: 'doctor' }, 'p2', ['doctor', 'admin'])
      ).resolves.toBeUndefined();
    });

    it('blocks a staff role not in the allow-list', async () => {
      await expect(
        assertCanAccessPatient({ id: 'u1', role: 'nurse' }, 'p2', ['doctor', 'admin'])
      ).rejects.toThrow(McpAccessError);
    });
  });
});
