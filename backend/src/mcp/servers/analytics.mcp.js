const userRepository = require('../../repositories/user.repository');
const doctorRepository = require('../../repositories/doctor.repository');
const appointmentRepository = require('../../repositories/appointment.repository');
const admissionRepository = require('../../repositories/admission.repository');
const analyticsService = require('../../modules/analytics/analytics.service');

function assertAdmin(requestingUser) {
  if (!['admin', 'superAdmin'].includes(requestingUser.role)) {
    throw new Error(`Role ${requestingUser.role} cannot access hospital analytics`);
  }
}

module.exports = {
  name: 'analytics',
  description: 'Hospital-wide operational snapshot (admin only, no per-patient data).',
  tools: {
    getAuthorizedAnalytics: {
      description: 'Returns one registered analytics section, scoped to the authenticated role and a validated bounded period.',
      async handler(args, { requestingUser }) {
        const allowed = ['overview', 'appointments', 'patients', 'doctors', 'billing', 'pharmacy', 'laboratory', 'admissions', 'departments'];
        if (!allowed.includes(args.section)) throw new Error('Unknown analytics section');
        return analyticsService.get(args.section, { range: args.range || 'last30Days' }, requestingUser);
      },
    },
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
