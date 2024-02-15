export type CopyToClipboardOptions = {
  text: string;
  onCopy?: (text: string, copied: boolean) => void;
};

export const copyToClipboard = ({ text, onCopy }: CopyToClipboardOptions, navigator_: Navigator = navigator) =>
  navigator_.clipboard?.writeText(text)
    .then(() => onCopy?.(text, true))
    .catch(() => onCopy?.(text, false));
