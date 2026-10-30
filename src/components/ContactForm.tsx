import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { fill, t } from '../content';
import { reasonForRoute, useAudience } from '../lib/audience';
import { external } from '../lib/site';

type Reason = '' | 'hire' | 'build' | 'collab' | 'hello';
type Field = 'name' | 'email' | 'reason' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'failed';

const reasons: Exclude<Reason, ''>[] = ['hire', 'build', 'collab', 'hello'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!values.name.trim()) errors.name = t('global', 'form.error.name');
  if (!values.email.trim()) errors.email = t('global', 'form.error.emailEmpty');
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = t('global', 'form.error.emailInvalid');
  if (!values.reason) errors.reason = t('global', 'form.error.reason');
  if (!values.message.trim()) errors.message = t('global', 'form.error.message');
  return errors;
}

/**
 * The contact form on /contact and the homepage. "What brings you here?" follows
 * IMPLEMENTATION-MAP "Contact reason preselection": a business CTA preselects for its own click;
 * otherwise the hiring and business routes preselect (with a note); everything else starts at
 * "Choose one…". The visitor can always change it, and clearing the route resets an untouched field.
 * Sends through Netlify Forms; the email address stays visible as a fallback.
 */
export function ContactForm({ ctaReason }: { ctaReason?: 'build' }) {
  const { route } = useAudience();
  const routeReason = reasonForRoute(route);
  const [reason, setReason] = useState<Reason>(ctaReason ?? routeReason);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [sentName, setSentName] = useState('');
  const id = useId();
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    reason: useRef<HTMLSelectElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };
  const statusRef = useRef<HTMLParagraphElement>(null);

  // The stored route arrives after hydration, and can be picked or cleared later. Follow it
  // until the visitor makes their own choice. A CTA preselect wins for its own click.
  useEffect(() => {
    if (touched || ctaReason) return;
    setReason(routeReason);
  }, [routeReason, touched, ctaReason]);

  const fromRoute = !touched && !ctaReason && reason !== '' && reason === routeReason;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate({ name, email, reason, message });
    setErrors(found);
    const firstBad = (['name', 'email', 'reason', 'message'] as Field[]).find((f) => found[f]);
    if (firstBad) {
      refs[firstBad].current?.focus();
      return;
    }
    setStatus('sending');
    try {
      const body = new URLSearchParams(new FormData(e.currentTarget) as unknown as Record<string, string>);
      // Send the visible wording ("Hiring / recruiting"), not the internal code, so the email reads clearly.
      body.set('reason', t('global', `form.reason.${reason}`));
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSentName(name.trim());
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  }

  useEffect(() => {
    if (status === 'sent' || status === 'failed') statusRef.current?.focus();
  }, [status]);

  if (status === 'sent') {
    return (
      <p ref={statusRef} tabIndex={-1} className="form-sent" role="status">
        {fill(t('global', 'form.sent'), { name: sentName })}
      </p>
    );
  }

  const describedBy = (field: Field, extra?: string) =>
    [errors[field] ? `${id}-${field}-err` : '', extra ?? ''].filter(Boolean).join(' ') || undefined;
  const hintKey = reason ? `form.hint.${reason}` : null;

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="contact-form"
      noValidate
      onSubmit={onSubmit}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="visually-hidden" aria-hidden="true">
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="field">
        <label htmlFor={`${id}-name`}>{t('global', 'form.name')}</label>
        <input
          ref={refs.name}
          id={`${id}-name`}
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describedBy('name')}
        />
        {errors.name && <p id={`${id}-name-err`} className="field-error">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${id}-email`}>{t('global', 'form.email')}</label>
        <input
          ref={refs.email}
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describedBy('email')}
        />
        {errors.email && <p id={`${id}-email-err`} className="field-error">{errors.email}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${id}-reason`}>{t('global', 'form.reason')}</label>
        <select
          ref={refs.reason}
          id={`${id}-reason`}
          name="reason"
          value={reason}
          onChange={(e) => {
            setTouched(true);
            setReason(e.target.value as Reason);
          }}
          aria-invalid={Boolean(errors.reason)}
          aria-describedby={describedBy('reason', `${id}-reason-hint`)}
        >
          <option value="" disabled>
            {t('global', 'form.reason.default')}
          </option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {t('global', `form.reason.${r}`)}
            </option>
          ))}
        </select>
        <p id={`${id}-reason-hint`} className="field-hint">
          {fromRoute && <span className="field-note">{t('global', 'form.preselect')} </span>}
          {hintKey && t('global', hintKey)}
        </p>
        {errors.reason && <p id={`${id}-reason-err`} className="field-error">{errors.reason}</p>}
      </div>

      <div className="field">
        <label htmlFor={`${id}-message`}>{t('global', 'form.message')}</label>
        <textarea
          ref={refs.message}
          id={`${id}-message`}
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy('message')}
        />
        {errors.message && <p id={`${id}-message-err`} className="field-error">{errors.message}</p>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? t('global', 'form.sending') : t('global', 'form.submit')}
      </button>

      {status === 'failed' && (
        <p ref={statusRef} tabIndex={-1} className="field-error" role="alert">
          <FailedMessage />
        </p>
      )}
    </form>
  );
}

/** The failure line names the email address; it becomes a mailto link. */
function FailedMessage() {
  const text = t('global', 'form.failed');
  const [before, after] = text.split(external.email);
  if (after === undefined) return <>{text}</>;
  return (
    <>
      {before}
      <a href={`mailto:${external.email}`}>{external.email}</a>
      {after}
    </>
  );
}
