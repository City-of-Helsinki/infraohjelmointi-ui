export const defaultFilter = (option: { label: string }, filterText: string) =>
  option.label.toLocaleLowerCase().includes(filterText.toLocaleLowerCase());
