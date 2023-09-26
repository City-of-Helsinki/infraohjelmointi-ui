import { memo, useCallback, useEffect, useState, MouseEvent } from 'react';
import AdminHashtagsToolbar from './AdminHashtagsToolbar';
import AdminHashtagsTable from './AdminHashtagsTable';
import { IHashTag } from '@/interfaces/hashTagsInterfaces';
import { useAppSelector } from '@/hooks/common';
import { selectAllHashtags } from '@/reducers/hashTagsSlice';
import AdminHashtagsPagination from './AdminHashtagsPagination';
import AddHashtagDialog from './AddHashtagDialog';

const ITEMS_PER_PAGE = 10;

interface IAdminHashtagsState {
  hashtags: Array<IHashTag>;
  searchWord: string;
  page: number;
  pageCount: number;
  startIndex: number;
  endIndex: number;
  isAddHashtagDialogOpen: boolean;
}

const AdminHashtags = () => {
  const allHashtags = useAppSelector(selectAllHashtags);

  const [state, setState] = useState<IAdminHashtagsState>({
    hashtags: [],
    searchWord: '',
    pageCount: 0,
    page: 0,
    startIndex: 0,
    endIndex: 10,
    isAddHashtagDialogOpen: false,
  });

  const { hashtags, startIndex, endIndex, pageCount, searchWord, page, isAddHashtagDialogOpen } =
    state;

  const onSetSearchWord = useCallback(
    (value: string) => setState((current) => ({ ...current, searchWord: value })),
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

  // Filter, slice and set hashtags and pagination variables based on the start and end indexes and search word
  useEffect(() => {
    const hashtagsForSearchWord = searchWord
      ? allHashtags.filter((c) => c.value.includes(searchWord))
      : allHashtags;

    const hashtagsAmount = hashtagsForSearchWord.length;

    const filteredHashtags =
      hashtagsAmount <= ITEMS_PER_PAGE
        ? hashtagsForSearchWord
        : hashtagsForSearchWord.slice(startIndex, endIndex);

    setState((current) => ({
      ...current,
      hashtags: filteredHashtags,
      pageCount: Math.ceil(hashtagsAmount / ITEMS_PER_PAGE),
      page: searchWord ? 0 : current.page,
      startIndex: searchWord ? 0 : current.startIndex,
      endIndex: searchWord ? ITEMS_PER_PAGE : current.endIndex,
    }));
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
