import { faInfoCircle as infoIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { InputProps } from '@shlinkio/shlink-frontend-kit/tailwind';
import { CardModal ,LabelledInput   } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { FC } from 'react';
import { useCallback , useState } from 'react';
import type { ShlinkDomain } from '../../api-contract';
import { nonEmptyStringOrNull } from '../../utils/helpers';
import type { EditDomainRedirects } from '../reducers/domainRedirects';

type FormGroupProps = Omit<InputProps, 'type' | 'placeholder' | 'onChange' | 'onKeyDown'> & {
  onConfirm: () => void;
  onChange: (newValue: string) => void;
};

const FormGroup: FC<FormGroupProps> = ({ children, onChange, onConfirm, ...rest }) => (
  <LabelledInput
    {...rest}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        onConfirm();
      }
    }}
    label={children ?? ''}
    type="url"
    placeholder="No redirect"
  />
);

export type EditDomainRedirectsModalProps = {
  domain: ShlinkDomain;
  isOpen: boolean;
  onClose: () => void;
  editDomainRedirects: (redirects: EditDomainRedirects) => Promise<void>;
};

export const EditDomainRedirectsModal: FC<EditDomainRedirectsModalProps> = (
  { isOpen, onClose, domain, editDomainRedirects },
) => {
  const [baseUrlRedirect, setBaseUrlRedirect] = useState(domain.redirects?.baseUrlRedirect ?? '');
  const [regular404Redirect, setRegular404Redirect] = useState(domain.redirects?.regular404Redirect ?? '');
  const [invalidShortUrlRedirect, setInvalidShortUrlRedirect] = useState(
    domain.redirects?.invalidShortUrlRedirect ?? '',
  );

  const [saving, setSaving] = useState(false);
  const onConfirm = useCallback(
    async () => {
      setSaving(true);
      try {
        await editDomainRedirects({
          domain: domain.domain,
          redirects: {
            baseUrlRedirect: nonEmptyStringOrNull(baseUrlRedirect),
            regular404Redirect: nonEmptyStringOrNull(regular404Redirect),
            invalidShortUrlRedirect: nonEmptyStringOrNull(invalidShortUrlRedirect),
          },
        });
        onClose();
      } finally {
        setSaving(false);
      }
    },
    [editDomainRedirects, domain.domain, baseUrlRedirect, regular404Redirect, invalidShortUrlRedirect, onClose],
  );

  return (
    <CardModal
      title={`Edit redirects for ${domain.domain}`}
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmText={saving ? 'Saving...' : 'Save'}
      confirmDisabled={saving}
    >
      <div className="tw:flex tw:flex-col tw:gap-y-3">
        <FormGroup value={baseUrlRedirect} onChange={setBaseUrlRedirect} onConfirm={onConfirm}>
          <FontAwesomeIcon
            className="tw:mr-1.5"
            icon={infoIcon}
            title={`Visitors accessing the base url, as in https://${domain.domain}/, will be redirected to this URL.`}
          />
          Base URL
        </FormGroup>
        <FormGroup value={regular404Redirect} onChange={setRegular404Redirect} onConfirm={onConfirm}>
          <FontAwesomeIcon
            className="tw:mr-1.5"
            icon={infoIcon}
            title={`Visitors accessing a url not matching a short URL pattern, as in https://${domain.domain}/???/[...], will be redirected to this URL.`}
          />
          Regular 404
        </FormGroup>
        <FormGroup value={invalidShortUrlRedirect} onChange={setInvalidShortUrlRedirect} onConfirm={onConfirm}>
          <FontAwesomeIcon
            className="tw:mr-1.5"
            icon={infoIcon}
            title="Visitors accessing a url matching a short URL pattern, but not matching an existing short code, will be redirected to this URL."
          />
          Invalid short URL
        </FormGroup>
      </div>
    </CardModal>
  );
};
