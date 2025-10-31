/**
 * Calendar Export Utilities
 * Generates .ics files for exporting meetings to calendar apps
 */

export interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  url?: string;
  recurrence?: {
    freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    byDay?: string[]; // e.g., ['MO', 'WE', 'FR']
    until?: Date;
  };
}

/**
 * Generate an iCalendar (.ics) file content
 */
export function generateICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Recovery Companion//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((event) => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${generateUID()}`);
    lines.push(`DTSTAMP:${formatDateUTC(new Date())}`);
    lines.push(`DTSTART:${formatDateUTC(event.start)}`);
    lines.push(`DTEND:${formatDateUTC(event.end)}`);
    lines.push(`SUMMARY:${escapeText(event.summary)}`);
    
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    }
    
    if (event.location) {
      lines.push(`LOCATION:${escapeText(event.location)}`);
    }
    
    if (event.url) {
      lines.push(`URL:${event.url}`);
    }

    if (event.recurrence) {
      const rrule = generateRRULE(event.recurrence);
      if (rrule) {
        lines.push(`RRULE:${rrule}`);
      }
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Format date for iCalendar (UTC format: YYYYMMDDTHHmmssZ)
 */
function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape text for iCalendar format
 */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a unique ID for the event
 */
function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@recovery-companion.app`;
}

/**
 * Generate RRULE string for recurring events
 */
function generateRRULE(recurrence: CalendarEvent['recurrence']): string | null {
  if (!recurrence) return null;

  const parts: string[] = [];
  
  parts.push(`FREQ=${recurrence.freq}`);
  
  if (recurrence.interval > 1) {
    parts.push(`INTERVAL=${recurrence.interval}`);
  }
  
  if (recurrence.byDay && recurrence.byDay.length > 0) {
    parts.push(`BYDAY=${recurrence.byDay.join(',')}`);
  }
  
  if (recurrence.until) {
    parts.push(`UNTIL=${formatDateUTC(recurrence.until)}`);
  }

  return parts.join(';');
}

/**
 * Convert meeting data to calendar event
 */
export function meetingToCalendarEvent(meeting: {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  time: string;
  day: number; // 0-6, Sunday-Saturday
  format?: string;
  url?: string;
}): CalendarEvent {
  const now = new Date();
  const [hours, minutes] = meeting.time.split(':').map(Number);
  
  // Create start date for next occurrence
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  
  // Adjust to next occurrence of this day
  const dayDiff = meeting.day - start.getDay();
  if (dayDiff < 0) {
    start.setDate(start.getDate() + 7 + dayDiff);
  } else if (dayDiff > 0) {
    start.setDate(start.getDate() + dayDiff);
  }
  
  // End time is 1 hour after start (default for meetings)
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const location = [
    meeting.address,
    meeting.city,
    meeting.state,
  ].filter(Boolean).join(', ');

  const description = meeting.format ? `Format: ${meeting.format}` : undefined;

  return {
    summary: meeting.name,
    description,
    location: location || undefined,
    start,
    end,
    url: meeting.url,
    recurrence: {
      freq: 'WEEKLY',
      interval: 1,
      byDay: [getDayAbbreviation(meeting.day)],
    },
  };
}

/**
 * Get day abbreviation for RRULE (SU, MO, TU, etc.)
 */
function getDayAbbreviation(day: number): string {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return days[day] || 'SU';
}

