type ICSOptions = { title: string; description?: string; when?: Date };

function formatDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function downloadICS(opts: ICSOptions) {
  const start = opts.when ?? new Date(Date.now() + 6 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30m default
  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//First Friend//EN
BEGIN:VEVENT
UID:${crypto.randomUUID()}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${escapeICSText(opts.title)}
DESCRIPTION:${escapeICSText(opts.description ?? '')}
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'first-friend-reminder.ics';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeICSText(t: string) {
  return t.replace(/\n/g, '\\n').replace(/,/g, '\\,');
}
