import { MemoryRouter } from 'react-router';
import { AsideMenu } from '../../src/common/AsideMenu';
import { checkAccessibility } from '../__helpers__/accessibility';
import { render } from '../__helpers__/setUpTest';

describe('<AsideMenu />', () => {
  const setUp = () =>
    render(
      <MemoryRouter>
        <AsideMenu routePrefix="/abc123" />
      </MemoryRouter>,
    );

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('contains links to different sections', async () => {
    const screen = await setUp();

    const links = screen.getByRole('link').all();

    expect.assertions(links.length + 1);
    expect(links).toHaveLength(5);

    await Promise.all(
      links.map((link) => expect.element(link).toHaveAttribute('href', expect.stringContaining('abc123'))),
    );
  });
});
