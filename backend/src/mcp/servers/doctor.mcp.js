const doctorRepository = require('../../repositories/doctor.repository');

module.exports = {
  name: 'doctor',
  description: "A doctor's public profile: specialization, department, availability.",
  tools: {
    listAvailable: {
      description: 'List public doctor profiles and their published availability.',
      async handler({ limit = 10 }) {
        const { items } = await doctorRepository.list({ page: 1, limit });
        return items.map((doctor) => doctor.toClientJSON());
      },
    },
    getProfile: {
      // No patient-ownership check applies here — a doctor's specialization
      // and department are not sensitive the way patient records are, so
      // any authenticated role may look one up (matches GET /doctors/:id's
      // broad REST access: admin, receptionist, patient).
      description: 'Fetch one doctor profile by id.',
      async handler({ doctorId }) {
        const doctor = await doctorRepository.findById(doctorId);
        if (!doctor) return null;
        return doctor.toClientJSON();
      },
    },
  },
};
