'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface TalkReminderProps {
  title: string;
  company: string;
  date?: string;       // ISO date or "2026/06/20" format
  location?: string;
  url?: string;
}

// Generate .ics calendar file content
function generateICS(props: TalkReminderProps): string {
  const { title, company, date, location, url } = props;

  // Parse date - try to extract a valid date
  let startDate: Date;
  if (date) {
    // Handle formats like "2026/06/20", "2026-06-20", "6月20日"
    const cleaned = date.replace(/\//g, '-');
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      startDate = parsed;
    } else {
      // Default to tomorrow if can't parse
      startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
    }
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
  }

  // Set time to 14:00 (common talk time)
  startDate.setHours(14, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 2 * 3600000); // 2 hours

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const uid = `jobhot-talk-${Date.now()}@jobhot.abcdabcd.cc`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JOBHOT//Talk Reminder//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:【宣讲会】${company} - ${title}`,
    `DESCRIPTION:${title}\\n\\n来源: JOBHOT\\n${url ? '详情: ' + url : ''}`,
    location ? `LOCATION:${location}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:宣讲会提醒：${company} 的宣讲会将在30分钟后开始`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:明日宣讲会提醒：${company}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function TalkReminder({ title, company, date, location, url }: TalkReminderProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Download .ics file
  function handleCalendarDownload() {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const icsContent = generateICS({ title, company, date, location, url });
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `宣讲会-${company}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    // Save to Supabase
    saveReminder();
  }

  // Send email reminder (mailto)
  function handleEmailReminder() {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const subject = encodeURIComponent(`【宣讲会提醒】${company} - ${title}`);
    const body = encodeURIComponent(
      `你预约了以下宣讲会：\n\n` +
      `公司：${company}\n` +
      `主题：${title}\n` +
      (date ? `时间：${date}\n` : '') +
      (location ? `地点：${location}\n` : '') +
      (url ? `\n详情链接：${url}\n` : '') +
      `\n—— 来自 JOBHOT 求职站`
    );

    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_self');
    saveReminder();
  }

  // Save reminder record to Supabase
  async function saveReminder() {
    if (!supabase || !user) return;

    await supabase.from('talk_reminders').upsert({
      user_id: user.id,
      talk_title: title.slice(0, 200),
      company,
      talk_date: date || null,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id,talk_title' }).then(() => {
      setSaved(true);
    });
  }

  return (
    <div className="talk-reminder">
      <div className="talk-reminder-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>预约提醒</span>
        {saved && <span className="talk-reminder-saved">✓ 已预约</span>}
      </div>

      <div className="talk-reminder-actions">
        <button
          type="button"
          className="talk-reminder-btn"
          onClick={handleCalendarDownload}
          title="下载日历文件，导入手机日历自动提醒"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          同步到日历
        </button>
        <button
          type="button"
          className="talk-reminder-btn"
          onClick={handleEmailReminder}
          title="发送邮件提醒到你的邮箱"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          邮件提醒
        </button>
      </div>

      {showLogin && !user && (
        <p className="talk-reminder-login">
          需要<a href="/login">登录</a>后才能使用预约功能
        </p>
      )}

      <style jsx>{`
        .talk-reminder {
          margin-top: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
        }
        .talk-reminder-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 0.75rem;
        }
        .talk-reminder-saved {
          margin-left: auto;
          font-size: 0.75rem;
          color: #22c55e;
          font-weight: 500;
        }
        .talk-reminder-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .talk-reminder-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          font-weight: 500;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .talk-reminder-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 5%, var(--bg));
        }
        .talk-reminder-login {
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .talk-reminder-login a {
          color: var(--accent);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
