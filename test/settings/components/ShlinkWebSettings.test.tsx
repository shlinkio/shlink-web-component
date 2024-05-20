import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ShlinkWebSettings } from '../../../src/settings';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShlinkWebSettings />', () => {
  const setUp = (activeRoute = '/') => {
    const history = createMemoryHistory();
    history.push(activeRoute);
    return render(
      <Router location={history.location} navigator={history}>
        <ShlinkWebSettings settings={{}} defaultShortUrlsListOrdering={{}} updateSettings={vi.fn} />
      </Router>,
    );
  };

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it.each([
    ['/general', {
      visibleComps: ['User interface', 'Real-time updates'],
      hiddenComps: ['Short URLs form', 'Short URLs list', 'Tags', 'Visits'],
    }],
    ['/short-urls', {
      visibleComps: ['Short URLs form', 'Short URLs list'],
      hiddenComps: ['User interface', 'Real-time updates', 'Tags', 'Visits'],
    }],
    ['/other-items', {
      visibleComps: ['Tags', 'Visits'],
      hiddenComps: ['User interface', 'Real-time updates', 'Short URLs form', 'Short URLs list'],
    }],
  ])('renders expected sections based on route', (activeRoute, { visibleComps, hiddenComps }) => {
    setUp(activeRoute);

    visibleComps.forEach((name) => expect(screen.getByRole('heading', { name })).toBeInTheDocument());
    hiddenComps.forEach((name) => expect(screen.queryByRole('heading', { name })).not.toBeInTheDocument());
  });

  it('renders expected menu', () => {
    setUp();

    expect(screen.getByRole('link', { name: 'General' })).toHaveAttribute('href', '/general');
    expect(screen.getByRole('link', { name: 'Short URLs' })).toHaveAttribute('href', '/short-urls');
    expect(screen.getByRole('link', { name: 'Other items' })).toHaveAttribute('href', '/other-items');
  });
});
