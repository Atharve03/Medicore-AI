jest.mock('../repositories/appointment.repository');
jest.mock('../repositories/patient.repository');
jest.mock('../repositories/doctor.repository');

const appointmentRepository = require('../repositories/appointment.repository');
const patientRepository = require('../repositories/patient.repository');
const doctorRepository = require('../repositories/doctor.repository');
const appointmentService = require('../modules/appointment/appointment.service');

describe('appointment mutation authorization', () => {
  beforeEach(() => jest.resetAllMocks());

  it('prevents a patient from cancelling another patient appointment', async () => {
    appointmentRepository.findById.mockResolvedValue({ patientId: 'patient-2', status: 'requested' });
    patientRepository.findByUserId.mockResolvedValue({ _id: 'patient-1' });

    await expect(
      appointmentService.cancelAppointment('appointment-1', { id: 'user-1', role: 'patient' })
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(appointmentRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('allows a patient to cancel only their own active appointment', async () => {
    appointmentRepository.findById.mockResolvedValue({ patientId: 'patient-1', status: 'confirmed' });
    patientRepository.findByUserId.mockResolvedValue({ _id: 'patient-1' });
    appointmentRepository.updateStatus.mockResolvedValue({
      toClientJSON: () => ({ id: 'appointment-1', status: 'cancelled' }),
    });

    await expect(
      appointmentService.cancelAppointment('appointment-1', { id: 'user-1', role: 'patient' })
    ).resolves.toMatchObject({ status: 'cancelled' });
  });

  it('prevents a doctor from updating another doctor appointment', async () => {
    appointmentRepository.findById.mockResolvedValue({ doctorId: 'doctor-2', status: 'requested' });
    doctorRepository.findByUserId.mockResolvedValue({ _id: 'doctor-1' });

    await expect(
      appointmentService.updateStatus('appointment-1', 'confirmed', { id: 'user-1', role: 'doctor' })
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(appointmentRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('allows receptionists to manage appointments within valid transitions', async () => {
    appointmentRepository.findById.mockResolvedValue({ status: 'requested' });
    appointmentRepository.updateStatus.mockResolvedValue({
      toClientJSON: () => ({ id: 'appointment-1', status: 'confirmed' }),
    });

    await expect(
      appointmentService.updateStatus('appointment-1', 'confirmed', { id: 'staff-1', role: 'receptionist' })
    ).resolves.toMatchObject({ status: 'confirmed' });
  });
});
