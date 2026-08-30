function detectIntent(message) {
  const text = message.toLowerCase();
  if (/analytics|performance|trend|workload|how many appointments|hospital-wide|revenue this|revenue last|this month.*appointment/.test(text)) {
    let section = 'overview';
    if (/appointment|workload/.test(text)) section = 'appointments';
    else if (/revenue|billing|invoice/.test(text)) section = 'billing';
    else if (/pharmacy|medicine|inventory/.test(text)) section = 'pharmacy';
    else if (/laboratory|lab/.test(text)) section = 'laboratory';
    else if (/admission|ward/.test(text)) section = 'admissions';
    else if (/department/.test(text)) section = 'departments';
    else if (/patient/.test(text)) section = 'patients';
    else if (/doctor/.test(text)) section = 'doctors';
    const range = /today/.test(text) ? 'today' : /last 7 days|last7days|past week|this week/.test(text) ? 'last7Days' : /this month|thismonth/.test(text) ? 'thisMonth' : /last month|lastmonth/.test(text) ? 'lastMonth' : 'last30Days';
    return { name: 'analytics.insight', section, range };
  }
  if (/another patient|all patients|someone else|other patient/.test(text)) return { name: 'forbidden.cross_patient' };
  if (/appointment|scheduled|booking/.test(text)) return { name: 'appointment.upcoming' };
  if (/\blab\b|blood report|test result/.test(text)) return { name: 'laboratory.latest' };
  if (/prescription|prescribed|medicine.*taking/.test(text)) return { name: 'prescription.latest' };
  if (/bill|invoice|balance|payment/.test(text)) return { name: 'billing.summary' };
  if (/medical record|visit history|diagnos/.test(text)) return { name: 'medicalRecord.list' };
  if (/doctor|specialist|availability/.test(text)) return { name: 'doctor.available' };
  if (/my profile|blood group|allerg/.test(text)) return { name: 'patient.profile' };
  if (/notification|unread/.test(text)) return { name: 'notification.unread' };
  return { name: 'general' };
}

module.exports = { detectIntent };
