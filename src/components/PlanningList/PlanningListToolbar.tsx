import { Button } from 'hds-react/components/Button';
import { useLocation, useNavigate } from 'react-router';
import { Toolbar } from '../shared';

const PlanningListToolbar = () => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const changeCoordinatorView = () => {
    navigate(pathname.includes('planner') ? '../coordinator' : '../planner');
  };
  return (
    <Toolbar
      left={
        <Button onClick={changeCoordinatorView} size="small">
          Vaihda näkymää
        </Button>
      }
    />
  );
};

export default PlanningListToolbar;
