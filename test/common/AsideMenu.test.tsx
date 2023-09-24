import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AsideMenu } from '../../src/common/AsideMenu';
import { checkAccessibility } from '../__helpers__/accessibility';

describe('<AsideMenu />', () => {
  const setUp = () => render(
    <MemoryRouter>
      <AsideMenu routePrefix="/abc123" />
    </MemoryRouter>,
  );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('contains links to different sections', () => {
    setUp();

    const links = screen.getAllByRole('link');

    expect.assertions(links.length + 1);
    expect(links).toHaveLength(5);
    links.forEach((link) => expect(link.getAttribute('href')).toContain('abc123'));
  });
});
