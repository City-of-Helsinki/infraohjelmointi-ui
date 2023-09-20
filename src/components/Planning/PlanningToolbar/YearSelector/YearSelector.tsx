import { IconAngleLeft, IconAngleRight } from 'hds-react';
import { memo, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { selectStartYear, setStartYear } from '@/reducers/planningSlice';
import './styles.css';

const iconRight = <IconAngleLeft className="left-year-button-icon" />;
const iconLeft = <IconAngleRight className="right-year-button-icon" />;
const currentYear = new Date().getFullYear();

const YearSelector = () => {
  const dispatch = useAppDispatch();
  const startYear = useAppSelector(selectStartYear);

  const startNumber = useMemo(() => {
    if (startYear === currentYear) {
      return -1;
    } else {
      return startYear - currentYear;
    }
  }, [startYear]);

  const numberList = useMemo(() => {
    const mylist = [];

    for (let i = startNumber; i < startNumber + 12; i++) {
      mylist.push(i);
    }

    return mylist;
  }, [startNumber]);

  const isStartInThePast = useMemo(() => startYear < currentYear, [startYear]);

  return (
    <div className="year-selector-container">
      {/* Labels */}
      <div className="selected-years-container">
        {numberList.map((y) => (
          <span key={y} className="selected-year-label">
            {y}
          </span>
        ))}
      </div>
      <div className="year-slider">
        <div className={`year-slider-selected ${isStartInThePast ? 'past-years' : ''}`}>
          <div className="year-slider-buttons-container">
            <button
              className="left-year-button"
              aria-label="Previous year"
              onClick={() => dispatch(setStartYear(startYear - 1))}
            >
              {iconRight}
            </button>
            <button
              className="right-year-button"
              aria-label="Next year"
              onClick={() => dispatch(setStartYear(startYear + 1))}
            >
              {iconLeft}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(YearSelector);
