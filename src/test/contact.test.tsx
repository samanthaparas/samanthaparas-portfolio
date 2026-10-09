import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AudienceProvider, useAudience } from '../lib/audience';
import { ContactForm, validate } from '../components/ContactForm';

function Picker() {
  const { pick, clear } = useAudience();
  return (
    <>
      <button onClick={() => pick('hire')}>hire</button>
      <button onClick={() => pick('build')}>build</button>
      <button onClick={() => pick('snoop')}>snoop</button>
      <button onClick={clear}>clear</button>
    </>
  );
}

function setup(ctaReason?: 'build') {
  render(
    <MemoryRouter>
      <AudienceProvider>
        <Picker />
        <ContactForm ctaReason={ctaReason} />
      </AudienceProvider>
    </MemoryRouter>,
  );
  return screen.getByLabelText('What brings you here?') as HTMLSelectElement;
}

const note = "Picked from your route. Change it if it's wrong.";

describe('Contact reason preselection', () => {
  beforeEach(() => sessionStorage.clear());

  it('starts at "Choose one…" with no route', () => {
    expect(setup().value).toBe('');
    expect(screen.queryByText(note, { exact: false })).toBeNull();
  });

  it('preselects from the hiring and business routes, with the note', async () => {
    const select = setup();
    await userEvent.click(screen.getByText('hire'));
    expect(select.value).toBe('hire');
    expect(screen.getByText(note, { exact: false })).toBeInTheDocument();
    await userEvent.click(screen.getByText('build'));
    expect(select.value).toBe('build');
  });

  it('does not preselect for the snooping route', async () => {
    const select = setup();
    await userEvent.click(screen.getByText('snoop'));
    expect(select.value).toBe('');
  });

  it('a business CTA preselects without the route note', () => {
    const select = setup('build');
    expect(select.value).toBe('build');
    expect(screen.queryByText(note, { exact: false })).toBeNull();
  });

  it('clearing the route resets an untouched field, but keeps a visitor choice', async () => {
    const select = setup();
    await userEvent.click(screen.getByText('hire'));
    await userEvent.click(screen.getByText('clear'));
    expect(select.value).toBe('');

    await userEvent.click(screen.getByText('hire'));
    await userEvent.selectOptions(select, 'collab');
    await userEvent.click(screen.getByText('clear'));
    expect(select.value).toBe('collab');
  });
});

describe('form validation', () => {
  it('uses the approved error messages', () => {
    expect(validate({ name: '', email: '', reason: '', message: '' })).toEqual({
      name: 'Please add your name.',
      email: 'Please add your email address.',
      reason: 'Please pick the closest option. "Just saying hello" counts.',
      message: 'Please add a message, even a short one.',
    });
    expect(validate({ name: 'A', email: 'nope', reason: 'hello', message: 'hi' }).email).toBe(
      "That email address doesn't look right. Check for a typo.",
    );
  });

  it('shows errors next to the fields and focuses the first one', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(screen.getByLabelText('Name')).toHaveFocus();
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please add your name.')).toBeInTheDocument();
  });

  it('keeps the message and offers email when sending fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const select = setup();
    await userEvent.type(screen.getByLabelText('Name'), 'Sam');
    await userEvent.type(screen.getByLabelText('Email'), 'sam@example.com');
    await userEvent.selectOptions(select, 'hello');
    await userEvent.type(screen.getByLabelText('Message'), 'Hi there');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent("That didn't send.");
    expect(screen.getByLabelText('Message')).toHaveValue('Hi there');
    vi.unstubAllGlobals();
  });

  it('confirms with the visitor\'s name when it sends', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const select = setup();
    await userEvent.type(screen.getByLabelText('Name'), 'Sam');
    await userEvent.type(screen.getByLabelText('Email'), 'sam@example.com');
    await userEvent.selectOptions(select, 'hello');
    await userEvent.type(screen.getByLabelText('Message'), 'Hi there');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Sent! Thanks, Sam.')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
