const userRepository = require('../../repositories/user.repository');
const doctorRepository = require('../../repositories/doctor.repository');
const appointmentRepository = require('../../repositories/appointment.repository');
const admissionRepository = require('../../repositories/admission.repository');

function assertAdmin(requestingUser) {
  if (requestingUser.role !== 'admin') {
    throw new Error(`Role ${requestingUser.role} cannot access hospital analytics`);
  }
}

module.exports = {
  name: 'analytics',
  description: 'Hospital-wide operational snapshot (admin only, no per-patient data).',
  tools: {
    getHospitalOverview: {
      description: 'User counts by role, appointments scheduled today, and active admissions.',
      async handler(_args, { requestingUser }) {
        assertAdmin(requestingUser);

        const [byRole, appointmentsToday, activeAdmissions] = await Promise.all([
          userRepository.countByRole(),
          appointmentRepository.countToday(),
          admissionRepository.countActive(),
        ]);

        return { usersByRole: byRole, appointmentsToday, activeAdmissions };
      },
    },

    getDepartmentPerformance: {
      description: 'Doctor headcount by department.',
      async handler(_args, { requestingUser }) {
        assertAdmin(requestingUser);
        return doctorRepository.countByDepartment();
      },
    },
  },
};
