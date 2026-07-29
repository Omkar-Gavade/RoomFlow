/**
 * Facilities controlled vocabulary — ARCHITECTURE.md §1.2 (FR-ROOM-06), §18.2.
 */
export const FACILITIES = Object.freeze({
  PROJECTOR: 'Projector',
  AC: 'AC',
  WHITEBOARD: 'Whiteboard',
  WIFI: 'Wi-Fi',
  SMART_BOARD: 'Smart Board',
  AUDIO_SYSTEM: 'Audio System',
  VIDEO_CONFERENCING: 'Video Conferencing',
  POWER_OUTLETS: 'Power Outlets',
  ACCESSIBLE: 'Accessible',
});

export const FACILITY_VALUES = Object.freeze(Object.values(FACILITIES));

export default FACILITIES;
