import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Shot } from '../components/Shot';

// jsdom has no modal dialogs; showModal just opens the dialog.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
});

const props = { altKey: 'img.acolyte', base: '/images/qk/acolyte', widths: [800], width: 800, height: 562 };

describe('Shot viewer', () => {
  it('opens the full image in the page with a caption, and Close returns focus', async () => {
    render(<Shot {...props} enlarge />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/images/qk/acolyte-800.jpg');
    await userEvent.click(link);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('figcaption')?.textContent).toMatch(/Acolyte is the only option/);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await new Promise((r) => requestAnimationFrame(r));
    expect(link).toHaveFocus();
  });

  it('renders nothing until the alt text is approved', () => {
    const { container } = render(<Shot {...props} altKey="img.notApproved" />);
    expect(container).toBeEmptyDOMElement();
  });
});
