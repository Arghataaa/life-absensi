export class AttendanceEventBus {
  private listeners: Set<(data: Record<string, unknown>) => void> = new Set();

  subscribe(listener: (data: Record<string, unknown>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(data: Record<string, unknown>) {
    this.listeners.forEach((listener) => listener(data));
  }
}

export const attendanceEvents = new AttendanceEventBus();
