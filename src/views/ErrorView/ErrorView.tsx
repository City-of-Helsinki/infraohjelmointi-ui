import { Paragraph, Title } from '@/components/shared';
import { useNavigate } from 'react-router';

const ErrorView = () => {
  const navigate = useNavigate();
  return (
    <>
      <Title size="xl" text="error.404" />
      <Paragraph size="xl" text="error.pageNotFound" />
      <button onClick={() => navigate(-1)}>
        <Paragraph size="xl" text="error.returnToPrevious" />
      </button>
    </>
  );
};

export default ErrorView;
