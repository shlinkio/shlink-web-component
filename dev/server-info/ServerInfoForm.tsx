import { Button, Input } from '@shlinkio/shlink-frontend-kit';
import type { FC, FormEvent } from 'react';
import { useCallback } from 'react';
import type { ServerInfo } from './useServerInfo';

type ServerInfoFormProps = {
  serverInfo: ServerInfo;
  onChange: (serverInfo: ServerInfo) => void;
};

export const ServerInfoForm: FC<ServerInfoFormProps> = ({ serverInfo, onChange }) => {
  const formDisabled = !!serverInfo.baseUrl && !!serverInfo.apiKey;
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    // @ts-expect-error - Entries is not recognized for some reason
    onChange(Object.fromEntries(new FormData(e.target).entries()));
  }, [onChange]);
  const resetForm = () => onChange({});
  const inputRef = useCallback((el: HTMLInputElement | HTMLTextAreaElement | null, key: keyof typeof serverInfo) => {
    if (el) {
      el.value = serverInfo[key] ?? '';
    }
  }, [serverInfo]);

  return (
    <form className="py-2 pl-2 flex gap-2" onSubmit={handleSubmit}>
      <Input
        name="baseUrl"
        placeholder="Server URL"
        type="url"
        disabled={formDisabled}
        ref={(el) => inputRef(el, 'baseUrl')}
      />
      <Input
        type="password"
        name="apiKey"
        placeholder="API key"
        disabled={formDisabled}
        ref={(el) => inputRef(el, 'apiKey')}
      />
      {!formDisabled && <Button type="submit" variant="secondary" solid>Load</Button>}
      {formDisabled && <Button type="reset" variant="secondary" solid onClick={resetForm}>Reset</Button>}
    </form>
  );
};
