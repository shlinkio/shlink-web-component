import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import { ShlinkWebSettings } from '../../../src/settings';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('<ShlinkWebSettings />', () => {
  const setUp = (activeRoute = '/') => {
    const history = createMemoryHistory();
    history.push(activeRoute);
    return render(
      <Router location={history.location} navigator={history}>
        <ShlinkWebSettings settings={{}} defaultShortUrlsListOrdering={{}} />
      </Router>,
    );
  };

  it.each([
    '/general',
    '/short-urls',
    '/visits',
    '/tags',
    '/qr-codes',
  ])('passes a11y checks', (activeRoute) => checkAccessibility(setUp(activeRoute)));

  it.each([
    {
      activeRoute: '/general',
      visibleComps: ['User interface', 'Real-time updates'],
      hiddenComps: ['Short URLs form', 'Short URLs list', 'Tags', 'Visits', 'Size', 'Colors', 'Format'],
    },
    {
      activeRoute: '/short-urls',
      visibleComps: ['Short URLs form', 'Short URLs list'],
      hiddenComps: ['User interface', 'Real-time updates', 'Tags', 'Visits', 'Size', 'Colors', 'Format'],
    },
    {
      activeRoute: '/visits',
      visibleComps: ['Visits'],
      hiddenComps: ['Short URLs form', 'Short URLs list', 'User interface', 'Real-time updates', 'Tags', 'Size', 'Colors', 'Format'],
    },
    {
      activeRoute: '/tags',
      visibleComps: ['Tags'],
      hiddenComps: ['User interface', 'Real-time updates', 'Short URLs form', 'Short URLs list', 'Size', 'Colors', 'Format', 'Visits'],
    },
    {
      activeRoute: '/qr-codes',
      visibleComps: ['Size', 'Colors', 'Format'],
      hiddenComps: ['Short URLs form', 'Short URLs list', 'User interface', 'Real-time updates', 'Tags', 'Visits'],
    },
  ])('renders expected sections based on route', ({ activeRoute, visibleComps, hiddenComps }) => {
    setUp(activeRoute);

    visibleComps.forEach((name) => expect(screen.getByRole('heading', { name })).toBeInTheDocument());
    hiddenComps.forEach((name) => expect(screen.queryByRole('heading', { name })).not.toBeInTheDocument());
  });

  it('renders expected menu', () => {
    setUp();

    expect(screen.getByRole('menuitem', { name: 'General' })).toHaveAttribute('href', '/general');
    expect(screen.getByRole('menuitem', { name: 'Short URLs' })).toHaveAttribute('href', '/short-urls');
    expect(screen.getByRole('menuitem', { name: 'Visits' })).toHaveAttribute('href', '/visits');
    expect(screen.getByRole('menuitem', { name: 'Tags' })).toHaveAttribute('href', '/tags');
    expect(screen.getByRole('menuitem', { name: 'QR codes' })).toHaveAttribute('href', '/qr-codes');
  });
});
