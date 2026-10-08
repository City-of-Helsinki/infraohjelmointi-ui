import { useState } from 'react';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { HookFormRulesType } from '@/interfaces/formInterfaces';
import { toSafeUrl } from '@/utils/urlUtils';
import TextField from './TextField';

interface ILinkFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  rules?: HookFormRulesType;
}

/**
 * A form field component for entering and displaying a link.
 * Shows the link as a clickable anchor when not focused and without validation errors.
 */
export default function LinkField<TFieldValues extends FieldValues>({
  name,
  label,
  rules,
}: Readonly<ILinkFieldProps<TFieldValues>>) {
  const [isFocused, setIsFocused] = useState(false);
  const {
    field: { value },
    fieldState: { error },
  } = useController<TFieldValues>({ name });

  const href = toSafeUrl(value);
  const showLink = !isFocused && !error && href !== null;

  return (
    <div className="relative">
      <div
        className={showLink ? '[&_input]:!text-transparent' : ''}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
      >
        <TextField name={name} label={label} size="full" rules={rules} />
      </div>
      {showLink && (
        <div className="pointer-events-none absolute bottom-0 left-[calc(var(--spacing-s)+2px)] right-[calc(var(--spacing-s)+2px)] z-[2] flex h-14 items-center">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto truncate text-l text-bus underline"
          >
            {String(value).trim()}
          </a>
        </div>
      )}
    </div>
  );
}
