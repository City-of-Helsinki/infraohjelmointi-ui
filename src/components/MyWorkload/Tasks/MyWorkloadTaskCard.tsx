import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import classes from '../styles.module.css';

import type { MyWorkloadTaskItem } from '@/interfaces/myWorkloadInterfaces';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  Card,
  IconCalendarClock,
  IconCalendarRecurring,
  IconHammers,
  IconMoneyBag,
  IconPen,
} from 'hds-react';
import { formatBudgetEuro } from '@/utils/currencyUtils';

interface MyWorkloadTaskCardProps {
  task: MyWorkloadTaskItem;
}

const MyWorkloadTaskCard: FC<MyWorkloadTaskCardProps> = ({ task }) => {
  const { t } = useTranslation();
  const onButtonClick = () => {
    // Todo: Find out what button click is supposed to do and handle it here
  };

  return (
    <Card heading={task.projectName} className={classes.taskCard}>
      <div className={classes.taskDetails}>
        <div className={classes.taskColumns}>
          <p>
            <IconCalendarClock aria-hidden="true" />
            {`${t('myWorkloadView.tasks.planningPeriod')}: ${task.planningPeriod}`}
          </p>
          <p>
            <IconCalendarRecurring aria-hidden="true" />
            {`${t('myWorkloadView.tasks.constructionPeriod')}: ${task.constructionPeriod}`}
          </p>
        </div>
        <div className={classes.taskColumns}>
          <p>
            <IconMoneyBag aria-hidden="true" />
            {`${t('myWorkloadView.tasks.budget')}: ${formatBudgetEuro(task.budget)}`}
          </p>
          <p>
            <IconHammers aria-hidden="true" />
            {`${t('myWorkloadView.tasks.constructionProcurementMethod')}: ${
              task.constructionProcurementMethod
            }`}
          </p>
        </div>
        <div className={classes.taskColumns}>
          <Button
            variant={ButtonVariant.Primary}
            theme={ButtonPresetTheme.Bus}
            onClick={onButtonClick}
            iconStart={<IconPen />}
          >
            {t(`myWorkloadView.${task.taskDescription}`)}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MyWorkloadTaskCard;
