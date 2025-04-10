export type CopyToClipboardOptions = {
  text: string | Promise<string>;
  onCopy?: (result: { text: string; copied: boolean }) => void;
};

export const copyToClipboard = async (
  { text: textOrPromise, onCopy }: CopyToClipboardOptions,
  navigator_: Navigator = navigator,
) => {
  const text = typeof textOrPromise === 'string' ? textOrPromise : await textOrPromise;
  return navigator_.clipboard?.writeText(text)
    .then(() => onCopy?.({ text, copied: true }))
    .catch(() => onCopy?.({ text, copied: false }));
};
