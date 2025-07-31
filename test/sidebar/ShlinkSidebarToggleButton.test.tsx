import { render, screen } from '@testing-library/react';
import { ShlinkSidebarToggleButton, ShlinkSidebarVisibilityProvider } from '../../src';
import { useSidebarVisibility } from '../../src/sidebar/ShlinkSidebarVisibilityProvider';
import { checkAccessibility } from '../__helpers__/accessibility';
import { renderWithEvents } from '../__helpers__/setUpTest';

describe('<ShlinkSidebarToggleButton />', () => {
  let currentVisibility: boolean = false;

  function VisibilityChecker() {
    // eslint-disable-next-line react-compiler/react-compiler
    currentVisibility = useSidebarVisibility()!.sidebarVisible;
    return null;
  }

  const setUp = () => renderWithEvents(
    <ShlinkSidebarVisibilityProvider>
      <ShlinkSidebarToggleButton />
      <VisibilityChecker />
    </ShlinkSidebarVisibilityProvider>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('throws when used outside of ShlinkSidebarVisibilityProvider', () => {
    expect(() => render(<ShlinkSidebarToggleButton />)).toThrow(
      new Error('ShlinkSidebarToggleButton has to be used inside a ShlinkSidebarVisibilityProvider'),
    );
  });

  it('toggles visibility when clicked', async () => {
    const { user } = setUp();

    expect(currentVisibility).toBe(false);
    await user.click(screen.getByLabelText('Toggle sidebar'));
    expect(currentVisibility).toBe(true);
    await user.click(screen.getByLabelText('Toggle sidebar'));
    expect(currentVisibility).toBe(false);
  });
});
