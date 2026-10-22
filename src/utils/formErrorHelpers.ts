import { FieldErrors, FieldValues } from 'react-hook-form';

/**
 * React-hook-form error helpers used to scroll/focus the first invalid field on submit.
 * Shared between forms that edit project data (e.g. ProjectForm and MyWorkloadEditDialog) so the
 * "scroll to first error" behaviour stays consistent.
 */

const isHtmlElement = (value: unknown): value is HTMLElement =>
  typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;

export const collectErrorElements = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
) => {
  const visitedObjects = new WeakSet<object>();
  const elements: HTMLElement[] = [];

  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (visitedObjects.has(value as object)) {
      return;
    }

    visitedObjects.add(value as object);

    if ('ref' in value && isHtmlElement((value as { ref?: unknown }).ref)) {
      elements.push((value as { ref: HTMLElement }).ref);
    }

    for (const nestedValue of Object.values(value)) {
      visit(nestedValue);
    }
  };

  visit(errors);

  return elements;
};

export const collectErrorFieldNames = <TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
) => {
  const visitedObjects = new WeakSet<object>();
  const fieldNames = new Set<string>();

  const visit = (value: unknown, path: string[] = []) => {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (visitedObjects.has(value as object)) {
      return;
    }

    visitedObjects.add(value as object);

    for (const [key, nestedValue] of Object.entries(value)) {
      if (key === 'ref' || key === 'type' || key === 'message') {
        continue;
      }

      const nextPath = [...path, key];

      if (nestedValue && typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
        if ('message' in nestedValue || 'type' in nestedValue || 'ref' in nestedValue) {
          fieldNames.add(nextPath.join('.'));
        }

        visit(nestedValue, nextPath);
        continue;
      }

      fieldNames.add(nextPath.join('.'));
    }
  };

  visit(errors);

  return [...fieldNames];
};

/**
 * Scrolls and focuses the first invalid field within a form/container, in document order.
 * Works regardless of whether the container itself scrolls (e.g. a dialog) or the page does.
 */
export const scrollToFirstField = (
  container: HTMLElement | null,
  preferredElements: HTMLElement[] = [],
  fieldNames: string[] = [],
  options: { focus?: boolean } = {},
) => {
  if (!container) {
    return;
  }

  const { focus = true } = options;

  const focusableSelector =
    'input:not([type="hidden"]), textarea, select, [role="combobox"], button, [tabindex]:not([tabindex="-1"])';

  const candidatesToSort =
    preferredElements.length > 0
      ? preferredElements
      : fieldNames
          .map((fieldName) => container.querySelector<HTMLElement>(`[data-testid="${fieldName}"]`))
          .filter((element): element is HTMLElement => Boolean(element));

  const candidates = candidatesToSort
    .map((candidate) => candidate.querySelector<HTMLElement>(focusableSelector) ?? candidate)
    .sort((first, second) => {
      const firstTop = first.getBoundingClientRect().top;
      const secondTop = second.getBoundingClientRect().top;

      if (firstTop !== secondTop) {
        return firstTop - secondTop;
      }

      const firstLeft = first.getBoundingClientRect().left;
      const secondLeft = second.getBoundingClientRect().left;
      return firstLeft - secondLeft;
    });

  const focusTarget = candidates[0];

  if (!focusTarget) {
    return;
  }

  if (typeof focusTarget.scrollIntoView === 'function') {
    focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    const absoluteTop = focusTarget.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(absoluteTop - 120, 0), behavior: 'smooth' });
  }

  if (focus && typeof focusTarget.focus === 'function') {
    focusTarget.focus({ preventScroll: true });
  }
};
