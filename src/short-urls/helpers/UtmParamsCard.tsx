import { LabelledInput, SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { FC } from 'react';
import { useMemo } from 'react';

export const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export type UtmParam = (typeof UTM_PARAMS)[number];

const UTM_PLACEHOLDERS: Record<UtmParam, string> = {
  utm_source: 'google, newsletter...',
  utm_medium: 'cpc, email, banner...',
  utm_campaign: 'summer_sale...',
  utm_content: 'header_link...',
  utm_term: 'running shoes...',
};

const parseLongUrl = (longUrl: string): URL | null => {
  try {
    return new URL(longUrl);
  } catch {
    return null;
  }
};

/**
 * Extracts the value of every UTM param present in provided long URL.
 * Returns an empty object if the long URL is not a valid URL.
 */
export const utmParamsFromLongUrl = (longUrl: string): Partial<Record<UtmParam, string>> => {
  const url = parseLongUrl(longUrl);
  if (!url) {
    return {};
  }

  return Object.fromEntries(
    UTM_PARAMS.filter((param) => url.searchParams.has(param)).map((param) => [param, url.searchParams.get(param)!]),
  );
};

/**
 * Returns provided long URL with a UTM param set in its query string, or removed from it when the value is empty.
 * Returns the long URL verbatim if it is not a valid URL.
 */
export const setUtmParamInLongUrl = (longUrl: string, param: UtmParam, value: string): string => {
  const url = parseLongUrl(longUrl);
  if (!url) {
    return longUrl;
  }

  if (value) {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }

  return url.toString();
};

export type UtmParamsCardProps = {
  longUrl: string;
  onLongUrlChange: (longUrl: string) => void;
};

/**
 * Card with one optional input for every UTM param. The long URL itself acts as the source of truth: values are
 * parsed from its query string, and changes are applied back to it.
 */
export const UtmParamsCard: FC<UtmParamsCardProps> = ({ longUrl, onLongUrlChange }) => {
  const utmParams = useMemo(() => utmParamsFromLongUrl(longUrl), [longUrl]);
  const disabled = useMemo(() => parseLongUrl(longUrl) === null, [longUrl]);

  return (
    <SimpleCard title="UTM parameters" className="card" bodyClassName="flex flex-col gap-4">
      <p className="text-sm">
        Optionally add UTM parameters to the long URL, to track this campaign in your analytics tool.
        {disabled && <b> Enter a valid long URL to be able to set them.</b>}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UTM_PARAMS.map((param) => (
          <LabelledInput
            key={param}
            label={param}
            placeholder={UTM_PLACEHOLDERS[param]}
            disabled={disabled}
            value={utmParams[param] ?? ''}
            onChange={(e) => onLongUrlChange(setUtmParamInLongUrl(longUrl, param, e.target.value))}
          />
        ))}
      </div>
    </SimpleCard>
  );
};
