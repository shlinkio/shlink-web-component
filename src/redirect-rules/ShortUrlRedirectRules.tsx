import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Message, Result, SimpleCard, useToggle } from '@shlinkio/shlink-frontend-kit';
import type { ShlinkRedirectRuleData } from '@shlinkio/shlink-js-sdk/api-contract';
import type { FC, FormEvent } from 'react';
import { useCallback, useEffect } from 'react';
import { ExternalLink } from 'react-external-link';
import { ShlinkApiError } from '../common/ShlinkApiError';
import { useShortUrlIdentifier } from '../short-urls/helpers/hooks';
import { useUrlsDetails } from '../short-urls/reducers/shortUrlsDetails';
import { GoBackButton } from '../utils/components/GoBackButton';
import { RedirectRuleCard } from './helpers/RedirectRuleCard';
import { RedirectRuleModal } from './helpers/RedirectRuleModal';
import { useUrlRedirectRulesSaving } from './reducers/setShortUrlRedirectRules';
import { useUrlRedirectRules } from './reducers/shortUrlRedirectRules';

export const ShortUrlRedirectRules: FC = () => {
  const { shortUrlRedirectRules, getShortUrlRedirectRules } = useUrlRedirectRules();
  const { setShortUrlRedirectRules, shortUrlRedirectRulesSaving, resetSetRules } = useUrlRedirectRulesSaving();
  const loading = shortUrlRedirectRules.status === 'loading';
  const identifier = useShortUrlIdentifier();
  const { getShortUrlsDetails, shortUrlsDetails } = useUrlsDetails();
  const { status } = shortUrlsDetails;
  const shortUrl = identifier && status === 'loaded' ? shortUrlsDetails.shortUrls.get(identifier) : undefined;
  const [rulesContainerRef, rules, setRules] = useDragAndDrop<HTMLDivElement, ShlinkRedirectRuleData>([], {
    dragHandle: '.drag-n-drop-handler',
    dropZoneClass: 'opacity-25',
  });
  const saving = shortUrlRedirectRulesSaving.status === 'saving';

  const { flag: isModalOpen, setToFalse: closeModal, setToTrue: openModal } = useToggle();

  const pushRule = useCallback((rule: ShlinkRedirectRuleData) => setRules((prev = []) => [...prev, rule]), [setRules]);
  const removeRule = useCallback((index: number) => setRules((prev = []) => {
    const copy = [...prev];
    copy.splice(index, 1);
    return copy;
  }), [setRules]);
  const updateRule = useCallback((index: number, rule: ShlinkRedirectRuleData) => setRules((prev = []) => {
    const copy = [...prev];
    copy[index] = rule;
    return copy;
  }), [setRules]);

  const moveRuleToNewPosition = useCallback((oldIndex: number, newIndex: number) => setRules((prev = []) => {
    if (!prev[newIndex]) {
      return prev;
    }

    const copy = [...prev];
    const temp = copy[newIndex];
    copy[newIndex] = copy[oldIndex];
    copy[oldIndex] = temp;

    return copy;
  }), [setRules]);
  const moveRuleUp = useCallback((index: number) => moveRuleToNewPosition(index, index - 1), [moveRuleToNewPosition]);
  const moveRuleDown = useCallback((index: number) => moveRuleToNewPosition(index, index + 1), [moveRuleToNewPosition]);

  const onSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (rules) {
      setShortUrlRedirectRules({
        shortUrl: identifier,
        data: { redirectRules: rules },
      });
    }
  }, [identifier, rules, setShortUrlRedirectRules]);

  useEffect(() => {
    getShortUrlRedirectRules(identifier);
    getShortUrlsDetails([identifier]);

    return () => {
      resetSetRules();
    };
  }, [getShortUrlRedirectRules, getShortUrlsDetails, identifier, resetSetRules]);

  const { redirectRules, defaultLongUrl } = shortUrlRedirectRules.status === 'loaded'
    ? shortUrlRedirectRules
    : {};
  useEffect(() => {
    // Initialize rules once loaded
    if (redirectRules) {
      setRules(redirectRules);
    }
  }, [setRules, redirectRules]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <SimpleCard>
          <h2 className="sm:flex justify-between items-center">
            <GoBackButton />
            <div className="text-center grow">
              {status === 'loading' ? <>Loading...</> : (
                <small>Redirect rules for <ExternalLink href={shortUrl?.shortUrl ?? ''} /></small>
              )}
            </div>
          </h2>
          <hr />
          <div>
            <p>Configure dynamic conditions that will be checked at runtime.</p>
            {defaultLongUrl && (
              <p>
                If no conditions match, visitors will be redirected to: <ExternalLink href={defaultLongUrl} />
              </p>
            )}
          </div>
        </SimpleCard>
      </header>
      <div>
        <Button onClick={openModal}>
          <FontAwesomeIcon icon={faPlus} /> Add rule
        </Button>
      </div>
      <form onSubmit={onSubmit}>
        {loading && <Message loading />}
        {rules.length === 0 && !loading && (
          <SimpleCard className="text-center"><i>This short URL has no dynamic redirect rules</i></SimpleCard>
        )}
        <div className="flex flex-col gap-2" ref={rulesContainerRef}>
          {rules.map((rule, index) => (
            <RedirectRuleCard
              key={`${rule.longUrl}_${index}`}
              redirectRule={rule}
              priority={index + 1}
              isLast={index === rules.length - 1}
              onDelete={() => removeRule(index)}
              onMoveUp={() => moveRuleUp(index)}
              onMoveDown={() => moveRuleDown(index)}
              onUpdate={(r) => updateRule(index, r)}
            />
          ))}
        </div>
        <div className="text-center mt-4">
          <Button type="submit" inline className="max-md:w-full" disabled={saving} data-testid="save-button">
            {saving ? 'Saving...' : 'Save rules'}
          </Button>
        </div>
      </form>
      {shortUrlRedirectRulesSaving.status === 'error' && (
        <Result variant="error">
          <ShlinkApiError
            errorData={shortUrlRedirectRulesSaving.error}
            fallbackMessage="An error occurred while saving short URL redirect rules :("
          />
        </Result>
      )}
      {shortUrlRedirectRulesSaving.status === 'saved' && (
        <Result variant="success">Redirect rules properly saved.</Result>
      )}
      <RedirectRuleModal isOpen={isModalOpen} onClose={closeModal} onSave={pushRule} />
    </div>
  );
};
