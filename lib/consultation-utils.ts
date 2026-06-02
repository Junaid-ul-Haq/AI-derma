export type ConsultationScheduleDoc = {
  scheduleActive?: boolean;
  status?: string;
};

/**
 * A meeting appears in doctor "active schedule" / user views when consultation is confirmed.
 * Consultations are active when scheduleActive is true or status is ACCEPTED/COMPLETED.
 */
export function isConsultationMeetingLive(doc: ConsultationScheduleDoc): boolean {
  if (doc.scheduleActive === true) return true;
  if (doc.status === 'ACCEPTED' || doc.status === 'COMPLETED') return true;
  return false;
}
