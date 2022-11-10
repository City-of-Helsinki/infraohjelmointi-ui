import React, { FC } from 'react';
import { Button } from 'hds-react/components/Button';
import { RootState } from './store';
import { useAppDispatch, useAppSelector } from './hooks/common';
import { newMessage, oldMessage } from './reducers/testSlice';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const message = useAppSelector((state: RootState) => state.test.message);
  const setMessage = () =>
    message === 'Hello World' ? dispatch(newMessage()) : dispatch(oldMessage());

  return (
    <div>
      <h1>{message}</h1>
      <Button onClick={() => setMessage()}>Change message</Button>
    </div>
  );
};

export default App;
