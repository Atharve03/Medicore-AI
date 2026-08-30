const appointmentRepository = require('../../repositories/appointment.repository');
const { assertCanAccessPatient, resolveOwnDoctorId } = require('./_shared/authz');

const STAFF_ROLES = ['admin', 'receptionist', 'doctor'];

module.exports = {
  name: 'appointment',
  description: "A patient's upcoming appointments, or a doctor's recent schedule.",
  tools: {
    getUpcomingForPatient: {
      description: "A patient's next few requested/confirmed appointments.",
      async handler({ patientId, limit = 5 }, { requestingUser }) {
        await assertCanAccessPatient(requestingUser, patientId, STAFF_ROLES);

        const { items } = await appointmentRepository.listForPatient({
          patientId,
          page: 1,
          limit,
        });
        return items
          .filter((a) => ['requested', 'confirmed'].includes(a.status))
          .map((a) => a.toClientJSON());
      },
    },

    getRecentForDoctor: {
      description: "The calling doctor's most recent appointments (own schedule only).",
      async handler({ limit = 10 }, { requestingUser }) {
        const doctorId = await resolveOwnDoctorId(requestingUser);

        const { items } = await appointmentRepository.listForDoctor({
          doctorId,
          page: 1,
          limit,
        });
        return items.map((a) => a.toClientJSON());
      },
    },
  },
};
