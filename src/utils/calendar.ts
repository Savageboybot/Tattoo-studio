import { Appointment } from '../types';

export function getCalendarDates(dateStr: string, timeSlot: string): { startUtc: string; endUtc: string } {
  // Parse date and standard time slot
  // Example date: "2026-10-24", timeSlot: "11:00 AM - 2:30 PM"
  const cleanDate = dateStr.replace(/-/g, '');
  
  let startHour = 11;
  let startMinute = 0;
  let endHour = 14;
  let endMinute = 30;

  if (timeSlot.toLowerCase().includes('10:00 am')) {
    startHour = 10;
    endHour = 13;
  } else if (timeSlot.toLowerCase().includes('2:00 pm')) {
    startHour = 14;
    endHour = 18;
  } else if (timeSlot.toLowerCase().includes('6:00 pm')) {
    startHour = 18;
    endHour = 21;
  }

  const formatPart = (n: number) => n.toString().padStart(2, '0');
  const startUtc = `${cleanDate}T${formatPart(startHour)}${formatPart(startMinute)}00Z`;
  const endUtc = `${cleanDate}T${formatPart(endHour)}${formatPart(endMinute)}00Z`;

  return { startUtc, endUtc };
}

export function generateGoogleCalendarUrl(apt: Appointment): string {
  const { startUtc, endUtc } = getCalendarDates(apt.date, apt.timeSlot);
  const title = encodeURIComponent(`Tattoo Session: ${apt.artistName} [${apt.bookingCode}]`);
  const details = encodeURIComponent(
    `Atelier Noir Tattoo Studio Session\n` +
    `Booking Ref: ${apt.bookingCode}\n` +
    `Artist: ${apt.artistName}\n` +
    `Placement: ${apt.tattooDetails.placement}\n` +
    `Style: ${apt.tattooDetails.style}\n` +
    `Studio: Atelier Noir Atelier, 442 Mercer Street, Suite 3B\n\n` +
    `Preparation: Please arrive 10 minutes early. Stay hydrated, eat a nutritious meal 2h before, avoid alcohol 24h prior, and wear loose clothing allowing access to your ${apt.tattooDetails.placement}.`
  );
  const location = encodeURIComponent('Atelier Noir Tattoo Atelier, 442 Mercer Street, Suite 3B');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

export function downloadIcsFile(apt: Appointment): void {
  const { startUtc, endUtc } = getCalendarDates(apt.date, apt.timeSlot);
  const title = `Tattoo Session: ${apt.artistName} - Atelier Noir [${apt.bookingCode}]`;
  const description = `Atelier Noir Tattoo Session for ${apt.client.name}. Placement: ${apt.tattooDetails.placement}. Concept: ${apt.tattooDetails.conceptDescription}. Upfront deposit confirmed.`;
  const location = 'Atelier Noir Tattoo Atelier, 442 Mercer Street, Suite 3B';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atelier Noir//Tattoo Appointment System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:atelier-noir-${apt.bookingCode}-${Date.now()}@ateliernoir.art`,
    `DTSTAMP:${startUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT48H',
    'ACTION:DISPLAY',
    'DESCRIPTION:48-Hour Tattoo Prep Reminder: Hydrate and review prep guide',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Atelier Noir Tattoo Session in 2 hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `atelier-noir-booking-${apt.bookingCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
