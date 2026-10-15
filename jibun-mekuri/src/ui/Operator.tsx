// 運営者情報とお問い合わせ。
import { useT } from '../state/AppContext';
import { SectionLabel } from './common';

const SOCIALS = [
  {
    name: 'YouTube',
    href: 'https://youtube.com/channel/UC3ICAf2hXYrCdYvb2ZZBvsQ?si=1Q29Fio1GeEXXL7T',
    color: '#FF0000',
    path: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@kagura_void?_r=1&_t=ZS-96y3ls2Qk2H',
    color: 'currentColor',
    path: 'M16.6 5.82a4.28 4.28 0 0 1-1.01-2.82h-3.3v13.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .76-5.06v-3.36a5.94 5.94 0 0 0-5.95 5.92 5.94 5.94 0 0 0 11.88 0V8.9a7.57 7.57 0 0 0 4.42 1.42V7a4.28 4.28 0 0 1-3.2-1.18z',
  },
  {
    name: 'Apple Music',
    href: 'https://music.apple.com/jp/artist/kagura-void/1873610176?l=en-US',
    color: '#FA57C1',
    path: 'M23.99 6.12c0-.5-.05-1-.16-1.49a4.9 4.9 0 0 0-.54-1.41 4.6 4.6 0 0 0-2.02-1.86c-.5-.24-1.03-.36-1.58-.42-.42-.05-.85-.06-1.27-.06H5.58c-.42 0-.85.01-1.27.06-.55.06-1.08.18-1.58.42A4.6 4.6 0 0 0 .7 3.22c-.25.44-.42.91-.54 1.41-.11.49-.16.99-.16 1.49v11.76c0 .5.05 1 .16 1.49.12.5.29.97.54 1.41a4.6 4.6 0 0 0 2.03 1.86c.5.24 1.03.36 1.58.42.42.05.85.06 1.27.06h12.84c.42 0 .85-.01 1.27-.06.55-.06 1.08-.18 1.58-.42a4.6 4.6 0 0 0 2.02-1.86c.25-.44.43-.91.54-1.41.11-.49.16-.99.16-1.49V6.12zM17.3 9.42v6.07a2.13 2.13 0 0 1-2.4 2.13c-1-.13-1.72-.97-1.72-1.94a1.9 1.9 0 0 1 1.62-1.88l.78-.16c.27-.06.36-.16.36-.43V8.2c0-.3-.13-.38-.42-.32l-4.3.87c-.26.06-.36.17-.36.45v7.3a2.13 2.13 0 0 1-2.4 2.12c-1-.13-1.72-.97-1.72-1.94a1.9 1.9 0 0 1 1.62-1.88l.78-.16c.27-.06.36-.16.36-.43V7.15c0-.4.18-.6.55-.68l5.96-1.2c.4-.08.62.12.62.52l-.02 3.63z',
  },
  {
    name: 'Spotify',
    href: 'https://open.spotify.com/artist/2tUJiefdu5qzwlJA8l8rIl?si=k4PMP0JtT0ycFCtmCtDFxQ',
    color: '#1DB954',
    path: 'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.36-2.11-10.54-1.16a.75.75 0 1 1-.33-1.46c4.57-1.04 8.5-.59 11.65 1.34.35.22.46.68.25 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.99-8.15-2.56-11.97-1.4a.94.94 0 1 1-.54-1.8c4.37-1.32 9.79-.68 13.49 1.6.44.27.58.85.31 1.29zm.13-3.4C15.3 8.3 8.78 8.1 5.03 9.24a1.12 1.12 0 1 1-.65-2.15c4.3-1.3 11.5-1.05 16.04 1.64a1.12 1.12 0 1 1-1.15 1.93z',
  },
];

export const CONTACT_EMAIL = 'stop2ask@gmail.com';
export const OPERATOR_NAME = 'KAGURA VOID';

export function OperatorSection({ n }: { n?: number }) {
  const T = useT();
  return (
    <section className="card" style={{ marginTop: 16 }} data-testid="operator">
      <SectionLabel n={n}>{T('運営者情報', 'About the operator')}</SectionLabel>
      <div className="profile">
        <div className="profile-icon" aria-hidden="true">
          🔮
        </div>
        <div>
          <h3 style={{ margin: 0 }}>{OPERATOR_NAME}</h3>
          <p style={{ margin: '4px 0 10px' }}>
            {T('独立開発者・占いファン・アーティスト。', 'Independent developer, fortune-telling fan & artist.')}
            <br />
            {T(
              '占いをきっかけに、自分のことをもっと楽しく知れるように「じぶんめくり」を開発。',
              'Built Jibun Mekuri so that fortune-telling can be a fun way to get to know yourself.',
            )}
          </p>
          <div className="social-icons">
            {SOCIALS.map((s) => (
              <a key={s.name} className="social-icon" href={s.href} target="_blank" rel="noopener noreferrer" title={s.name} aria-label={s.name}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={s.color} aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <h3 style={{ marginTop: 18 }}>{T('お問い合わせ', 'Contact')}</h3>
      <p style={{ marginBottom: 0 }}>
        {T('ご質問・フィードバック・提携のご相談はこちら：', 'For questions, feedback, or partnership inquiries:')}
        <br />
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </section>
  );
}

export function SiteFooter() {
  const T = useT();
  return (
    <footer className="site-footer small muted">
      © 2026 {T('じぶんめくり', 'Jibun Mekuri')} · {T('運営', 'Operated by')}：{OPERATOR_NAME}
    </footer>
  );
}
