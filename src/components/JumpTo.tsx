import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { fill, t } from '../content';
import { d20Message, filterJump, isRollCommand, jumpItems, type JumpItem } from '../lib/jumpIndex';

type Variant = 'desktop' | 'phone';

interface JumpState {
  /** Opens the dialog. Focus returns to `returnTo` (or whatever had focus) when it closes. */
  open: (variant: Variant, returnTo?: HTMLElement | null) => void;
}

const JumpContext = createContext<JumpState | null>(null);

export function useJump(): JumpState {
  const ctx = useContext(JumpContext);
  if (!ctx) throw new Error('useJump outside JumpProvider');
  return ctx;
}

const groups: { id: JumpItem['group']; key: string }[] = [
  { id: 'projects', key: 'jump.group.projects' },
  { id: 'sections', key: 'jump.group.sections' },
  { id: 'pages', key: 'jump.group.pages' },
];

export function JumpProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<Variant | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((v: Variant, returnTo?: HTMLElement | null) => {
    returnFocus.current = returnTo ?? (document.activeElement as HTMLElement | null);
    setVariant(v);
  }, []);

  const close = useCallback(() => {
    setVariant(null);
    // Deferred build check #3: focus goes back to the control that opened the dialog.
    // Opened by ⌘K with nothing focused: fall back to the visible header button.
    let target = returnFocus.current;
    if (!target || target === document.body || !target.isConnected) {
      target = document.querySelector<HTMLElement>('.search-btn');
    }
    requestAnimationFrame(() => target?.focus());
  }, []);

  // ⌘K / Ctrl+K opens Jump to from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        open('desktop');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const value = useMemo(() => ({ open }), [open]);
  return (
    <JumpContext.Provider value={value}>
      {children}
      {variant && <JumpDialog variant={variant} onClose={close} />}
    </JumpContext.Provider>
  );
}

function JumpDialog({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [roll, setRoll] = useState<number | null>(null);
  const listId = useId();
  const titleId = useId();

  const all = useMemo(() => jumpItems(), []);
  const rolling = isRollCommand(query);
  const results = rolling ? [] : filterJump(all, query);

  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActive(0);
    setRoll(rolling ? 1 + Math.floor(Math.random() * 20) : null);
  }, [query, rolling]);

  function go(item: JumpItem) {
    onClose();
    navigate(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (rolling) setRoll(1 + Math.floor(Math.random() * 20));
      else if (results[active]) go(results[active]);
    }
  }

  const title = t('global', variant === 'desktop' ? 'jump.dialog.desktop' : 'jump.dialog.phone');
  const activeId = results[active] ? `${listId}-${active}` : undefined;

  return (
    <dialog
      ref={dialogRef}
      className={`jump jump-${variant}`}
      aria-labelledby={titleId}
      // Esc fires `cancel`; close through the same path so focus returns to the trigger.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="jump-head">
        <h2 id={titleId} className="label">
          {title}
        </h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
          {t('global', variant === 'desktop' ? 'jump.close.desktop' : 'jump.close.phone')}
        </button>
      </div>
      <input
        ref={inputRef}
        className="jump-input"
        type="text"
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-label={title}
        placeholder={t('global', 'jump.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
      />

      {rolling && roll !== null && (
        <div className="jump-roll" aria-live="polite">
          <p className="jump-roll-result">{d20Message(roll)}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRoll(1 + Math.floor(Math.random() * 20))}>
            {t('global', 'jump.d20.again')}
          </button>
          {variant === 'desktop' && <span className="label">{t('global', 'jump.d20.againHint')}</span>}
        </div>
      )}

      {!rolling && results.length === 0 && (
        <p className="jump-empty">
          {fill(t('global', 'jump.noResults'), { query })}{' '}
          <NoResultLinks onPick={onClose} />
        </p>
      )}

      {!rolling && results.length > 0 && (
        <ul id={listId} role="listbox" className="jump-list" aria-label={title}>
          {groups.map((g) => {
            const inGroup = results.filter((r) => r.group === g.id);
            if (inGroup.length === 0) return null;
            return (
              <li key={g.id} role="presentation">
                <span className="label jump-group">{t('global', g.key)}</span>
                <ul role="presentation">
                  {inGroup.map((item) => {
                    const i = results.indexOf(item);
                    return (
                      <li
                        key={item.href}
                        id={`${listId}-${i}`}
                        role="option"
                        aria-selected={i === active}
                        className="jump-item"
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(item)}
                      >
                        {item.label}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      {variant === 'desktop' && (
        <p className="label jump-keys" aria-hidden="true">
          {t('global', 'jump.keys')}
        </p>
      )}
    </dialog>
  );
}

function NoResultLinks({ onPick }: { onPick: () => void }) {
  const hrefs = ['/work', '/about', '/contact'];
  const labels = t('global', 'jump.noResults.links').split(' · ');
  return (
    <>
      {labels.map((label, i) => (
        <span key={label}>
          {i > 0 && ' · '}
          <Link to={hrefs[i]} onClick={onPick}>
            {label}
          </Link>
        </span>
      ))}
    </>
  );
}
