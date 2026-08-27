import { screen } from '@testing-library/react';
import type { UtmParamsCardProps } from '../../../src/short-urls/helpers/UtmParamsCard';
import {
  setUtmParamInLongUrl,
  UTM_PARAMS,
  UtmParamsCard,
  utmParamsFromLongUrl,
} from '../../../src/short-urls/helpers/UtmParamsCard';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/setUpTest';

describe('utmParamsFromLongUrl', () => {
  it.each([
    ['', {}],
    ['not a URL', {}],
    ['https://example.com', {}],
    ['https://example.com?utm_source=google', { utm_source: 'google' }],
    [
      'https://example.com/foo?bar=baz&utm_source=newsletter&utm_medium=email&utm_campaign=summer%20sale',
      { utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'summer sale' },
    ],
  ])('extracts UTM params present in long URL', (longUrl, expectedParams) => {
    expect(utmParamsFromLongUrl(longUrl)).toEqual(expectedParams);
  });
});

describe('setUtmParamInLongUrl', () => {
  it.each([
    ['not a URL', 'utm_source' as const, 'google', 'not a URL'],
    ['https://example.com/foo', 'utm_source' as const, 'google', 'https://example.com/foo?utm_source=google'],
    [
      'https://example.com/foo?utm_source=google',
      'utm_source' as const,
      'yandex',
      'https://example.com/foo?utm_source=yandex',
    ],
    ['https://example.com/foo?bar=baz&utm_medium=email', 'utm_medium' as const, '', 'https://example.com/foo?bar=baz'],
  ])('sets, overwrites or removes the param in the long URL', (longUrl, param, value, expectedLongUrl) => {
    expect(setUtmParamInLongUrl(longUrl, param, value)).toEqual(expectedLongUrl);
  });
});

describe('<UtmParamsCard />', () => {
  const onLongUrlChange = vi.fn();
  const setUp = (props: Partial<UtmParamsCardProps> = {}) =>
    renderWithEvents(<UtmParamsCard longUrl="https://example.com/foo" onLongUrlChange={onLongUrlChange} {...props} />);

  it('passes a11y checks', () => checkAccessibility(setUp()));

  it('renders an optional input for every UTM param', () => {
    setUp();

    UTM_PARAMS.forEach((param) => {
      const input = screen.getByLabelText(param);
      expect(input).toBeInTheDocument();
      expect(input).not.toBeRequired();
      expect(input).toBeEnabled();
    });
  });

  it.each([['not a URL'], ['']])('disables inputs and displays a hint when long URL is not valid', (longUrl) => {
    setUp({ longUrl });

    UTM_PARAMS.forEach((param) => expect(screen.getByLabelText(param)).toBeDisabled());
    expect(screen.getByText('Enter a valid long URL to be able to set them.')).toBeInTheDocument();
  });

  it('pre-fills inputs with UTM params already present in long URL', () => {
    setUp({ longUrl: 'https://example.com/foo?utm_source=google&utm_medium=cpc' });

    expect(screen.getByLabelText('utm_source')).toHaveValue('google');
    expect(screen.getByLabelText('utm_medium')).toHaveValue('cpc');
    expect(screen.getByLabelText('utm_campaign')).toHaveValue('');
  });

  it('appends the param to the long URL when typing in an input', async () => {
    const { user } = setUp();

    await user.type(screen.getByLabelText('utm_source'), 'g');
    expect(onLongUrlChange).toHaveBeenLastCalledWith('https://example.com/foo?utm_source=g');
  });

  it('removes the param from the long URL when the input is cleared', async () => {
    const { user } = setUp({ longUrl: 'https://example.com/foo?utm_source=g' });

    await user.clear(screen.getByLabelText('utm_source'));
    expect(onLongUrlChange).toHaveBeenLastCalledWith('https://example.com/foo');
  });
});
