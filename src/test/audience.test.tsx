import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { announcementFor, AudienceProvider, stopsFor, useAudience } from '../lib/audience';
import { StopTag } from '../components/StopTag';

describe('route data', () => {
  it('drops missing stops: no résumé, no Lab, Easter eggs as a plain-text fallback', () => {
    expect(stopsFor('hire').map((s) => s.label)).toEqual(['Work', 'Experience', 'Contact']);
    expect(stopsFor('build').map((s) => s.label)).toEqual(['Common problems', 'Services', 'Work', 'Contact']);
    const snoop = stopsFor('snoop');
    expect(snoop.map((s) => s.label)).toEqual(['Behind the Build', 'About', "Easter eggs: they're around."]);
    expect(snoop[2].href).toBeUndefined();
  });

  it('announces from the stops that are actually available', () => {
    expect(announcementFor('hire')).toBe('Hiring route: Work, Experience, Contact.');
    expect(announcementFor('snoop')).toBe("Snooping route: Behind the Build, About, Easter eggs: they're around.");
  });
});

function Picker() {
  const { pick, clear } = useAudience();
  return (
    <>
      <button onClick={() => pick('hire')}>hire</button>
      <button onClick={() => pick('snoop')}>snoop</button>
      <button onClick={clear}>clear</button>
    </>
  );
}

function setup(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AudienceProvider>
        <Picker />
        {ui}
      </AudienceProvider>
    </MemoryRouter>,
  );
}

describe('StopTag', () => {
  beforeEach(() => sessionStorage.clear());

  it('renders nothing without a route', () => {
    const { container } = setup(<StopTag href="/work" mode="stop" />);
    expect(container.querySelector('.stop-tag')).toBeNull();
  });

  it('shows the stop and links to the next one', async () => {
    setup(<StopTag href="/work" mode="stop" />);
    await userEvent.click(screen.getByText('hire'));
    expect(screen.getByRole('link', { name: 'Stop 1 of 3 · Next: Experience →' })).toHaveAttribute('href', '/about#experience');
  });

  it('marks the last stop', async () => {
    setup(<StopTag href="/contact" mode="stop" />);
    await userEvent.click(screen.getByText('hire'));
    expect(screen.getByText('Stop 3 of 3 · Last stop')).toBeInTheDocument();
  });

  it('uses the plain-text fallback before Easter eggs', async () => {
    setup(<StopTag href="/about" mode="stop" />);
    await userEvent.click(screen.getByText('snoop'));
    const tag = screen.getByText("Stop 2 of 3 · Next: Easter eggs: they're around.");
    expect(tag.querySelector('a')).toBeNull();
  });

  it('keeps the route for the session, across pages', async () => {
    const first = setup(null);
    await userEvent.click(screen.getByText('hire'));
    first.unmount();
    setup(<StopTag href="/work" mode="stop" />);
    await act(async () => {});
    expect(screen.getByText('Stop 1 of 3 · Next: Experience →')).toBeInTheDocument();
  });
});
