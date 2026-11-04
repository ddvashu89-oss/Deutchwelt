/** A stable, human-readable student reference derived from the immutable account ID. */
export function getStudentCode(userId?: string | null) {
  const normalizedId = String(userId || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return normalizedId ? `DW-${normalizedId}` : '';
}
