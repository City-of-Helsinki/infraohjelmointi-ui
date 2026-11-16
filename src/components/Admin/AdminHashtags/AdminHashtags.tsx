import { memo, useCallback, useMemo, useState, MouseEvent } from 'react';
import AdminHashtagsToolbar from './AdminHashtagsToolbar';
import AdminHashtagsTable from './AdminHashtagsTable';
import { useAppSelector } from '@/hooks/common';
import { selectAllHashtags } from '@/reducers/hashTagsSlice';
import AdminHashtagsPagination from './AdminHashtagsPagination';
import AddHashtagDialog from './AddHashtagDialog';

const ITEMS_PER_PAGE = 10;

interface IAdminHashtagsState {
  searchWord: string;
  page: number;
  startIndex: number;
  endIndex: number;
  isAddHashtagDialogOpen: boolean;
}

const AdminHashtags = () => {
  const allHashtags = useAppSelector(selectAllHashtags);

  const [state, setState] = useState<IAdminHashtagsState>({
    searchWord: '',
    page: 0,
    startIndex: 0,
    endIndex: 10,
    isAddHashtagDialogOpen: false,
  });

  const { startIndex, endIndex, searchWord, page, isAddHashtagDialogOpen } = state;

  const onSetSearchWord = useCallback(
    (value: string) =>
      setState((current) => ({
        ...current,
        searchWord: value,
        page: value ? 0 : current.page,
        startIndex: value ? 0 : current.startIndex,
        endIndex: value ? ITEMS_PER_PAGE : current.endIndex,
      })),
    [],
  );

  // Set next page and new slice indexes when pagination is clicked
  const onPageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>, page: number) => {
      event.preventDefault();
      const startIndex = page * ITEMS_PER_PAGE;
      setState((current) => ({
        ...current,
        page,
        startIndex,
        endIndex: startIndex + ITEMS_PER_PAGE,
      }));
    },
    [],
  );

  const onToggleAddHashtagDialog = useCallback(() => {
    setState((current) => ({
      ...current,
      isAddHashtagDialogOpen: !current.isAddHashtagDialogOpen,
    }));
  }, []);

  // Filter and slice hashtags based on the start and end indexes and search word
  const { hashtags, pageCount } = useMemo(() => {
    const hashtagsForSearchWord = searchWord
      ? allHashtags.filter((c) => c.value.toLowerCase().includes(searchWord.toLowerCase()))
      : allHashtags;

    const hashtagsAmount = hashtagsForSearchWord.length;

    return {
      hashtags:
        hashtagsAmount <= ITEMS_PER_PAGE
          ? hashtagsForSearchWord
          : hashtagsForSearchWord.slice(startIndex, endIndex),
      pageCount: Math.ceil(hashtagsAmount / ITEMS_PER_PAGE),
    };
  }, [allHashtags, searchWord, startIndex, endIndex]);

  return (
    <div data-testid="admin-hashtags">
      <AdminHashtagsToolbar
        onSetSearchWord={onSetSearchWord}
        onToggleAddHashtagDialog={onToggleAddHashtagDialog}
      />
      <AdminHashtagsTable hashtags={hashtags} />
      <AdminHashtagsPagination pageCount={pageCount} onPageChange={onPageChange} page={page} />
      <AddHashtagDialog
        isOpen={isAddHashtagDialogOpen}
        onToggleAddHashtagDialog={onToggleAddHashtagDialog}
      />
    </div>
  );
};

export default memo(AdminHashtags);
