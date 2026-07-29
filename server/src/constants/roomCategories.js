/**
 * Room categories & status — ARCHITECTURE.md §1.2 (FR-ROOM-05), §18.2.
 * Controlled vocabulary; free text would break filtering (§7.1).
 */
export const ROOM_CATEGORIES = Object.freeze({
  CLASSROOM: 'Classroom',
  LAB: 'Lab',
  SEMINAR_HALL: 'Seminar Hall',
  CONFERENCE_ROOM: 'Conference Room',
  AUDITORIUM: 'Auditorium',
  HOSTEL_ROOM: 'Hostel Room',
  LIBRARY_STUDY_ROOM: 'Library Study Room',
  MEETING_POD: 'Meeting Pod',
});

export const ROOM_CATEGORY_VALUES = Object.freeze(Object.values(ROOM_CATEGORIES));

/** Room lifecycle status (§18.2). Non-active rooms are not bookable (FR-ROOM-10). */
export const ROOM_STATUS = Object.freeze({
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
});

export const ROOM_STATUS_VALUES = Object.freeze(Object.values(ROOM_STATUS));

export default ROOM_CATEGORIES;
