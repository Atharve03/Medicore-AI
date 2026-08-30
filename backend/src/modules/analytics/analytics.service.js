const ApiError = require('../../utils/ApiError');
const repo = require('../../repositories/analytics.repository');
const doctorRepository = require('../../repositories/doctor.repository');

function periodFrom(query = {}) {
  const now = new Date(); let from; let to;
  if (query.from) { from = new Date(query.from); to = new Date(query.to); to.setUTCHours(23, 59, 59, 999); }
  else { const key = query.range || 'last30Days'; to = new Date(now); from = new Date(now); if (key === 'today') from.setHours(0,0,0,0); else if (key === 'yesterday') { from.setDate(from.getDate()-1); from.setHours(0,0,0,0); to = new Date(from); to.setHours(23,59,59,999); } else if (key === 'last7Days') from.setDate(from.getDate()-6); else if (key === 'thisMonth') from = new Date(now.getFullYear(), now.getMonth(), 1); else if (key === 'lastMonth') { from = new Date(now.getFullYear(), now.getMonth()-1, 1); to = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999); } else from.setDate(from.getDate()-29); }
  return { from, to, label: query.range || (query.from ? 'custom' : 'last30Days') };
}
const permissions = { overview:['admin','superAdmin'], appointments:['admin','superAdmin','receptionist','doctor'], patients:['admin','superAdmin','receptionist'], doctors:['admin','superAdmin'], billing:['admin','superAdmin','receptionist'], pharmacy:['admin','superAdmin','pharmacist'], laboratory:['admin','superAdmin','labTechnician'], admissions:['admin','superAdmin','nurse'], departments:['admin','superAdmin'], aiUsage:['superAdmin'] };
async function get(section, query, user) { if (!permissions[section]?.includes(user.role)) throw ApiError.forbidden(`Role '${user.role}' cannot access ${section} analytics`); const period = periodFrom(query); if (section === 'appointments' && user.role === 'doctor') { const doctor = await doctorRepository.findByUserId(user.id); if (!doctor) throw ApiError.notFound('Doctor profile not found'); return { period, ...(await repo.appointments(period, doctor._id)) }; } return { period, ...(section === 'doctors' || section === 'departments' ? { items: await repo[section](period) } : await repo[section](period)) }; }
module.exports = { get, periodFrom, permissions };
