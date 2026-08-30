function detectIntent(message) {
  const text = message.toLowerCase();
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
