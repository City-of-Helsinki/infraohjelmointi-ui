import PlanningListHeader from '@/components/PlanningList/PlanningListToolbar';
import { IconButton, Paragraph, Title } from '@/components/shared';
import {
  IconAngleDown,
  IconAngleUp,
  IconCopy,
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';
import { Button } from 'hds-react/components/Button';
import { FC, useState } from 'react';
import './styles.css';

const randomNumbers = [
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
  '463 000',
];
const randomNumbers1 = [
  '360',
  '360',
  '360',
  '360',
  '360',
  '360',
  '360',
  '360',
  '360',
  '360',
  '360',
];
const randomNumbers2 = [
  '460',
  '460',
  '460',
  '460',
  '460',
  '460',
  '460',
  '460',
  '460',
  '460',
  '460',
];

const randomProjects = ['project1', 'project2', 'project3'];

const PlanningListView: FC = () => {
  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = () => setIsProjectsVisible(!isProjectsVisible);

  return (
    <div>
      <PlanningListHeader />
      <div className="planning-list-table-container">
        <table className="planning-list-table" cellSpacing={0}>
          {/* HEAD */}
          <thead>
            {/* HEAD ROW (title & button) */}
            <tr>
              <td style={{ width: '35%' }}>
                <Title text="Talousarvioehdotusten valmistelu" size="s" />
                <Button variant="success">Määrärahojen valmistelu</Button>
                <Paragraph size="m" text="Käynnissä 20.6.2020 asti" />
              </td>
              {/* CELLS */}
              {randomNumbers.map((rn, i) => (
                <td key={i}>{rn}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* GROUP */}
            <tr>
              {/* HEADER */}
              <th className="group-header-cell">
                <div className="left">
                  <IconButton
                    icon={isProjectsVisible ? IconAngleUp : IconAngleDown}
                    color="white"
                    onClick={handleProjectsVisible}
                  />
                  <IconMenuDots />
                  <Title size="s" text="Hakaniemi" color="white" /> <IconCopy />
                </div>
                <div className="right">
                  <span>3 400</span>
                  <span style={{ fontWeight: '300' }}>2 700</span>
                </div>
              </th>
              {/* CELLS */}
              {randomNumbers1.map((rn, i) => (
                <td key={i} className="group-cell">
                  {rn}
                </td>
              ))}
            </tr>
            {isProjectsVisible &&
              randomProjects.map((rp) => (
                <>
                  {/* PROJECTS */}
                  <tr key={rp}>
                    {/* HEADER */}
                    <th className="project-header-cell">
                      {/* LEFT */}
                      <div className="left">
                        <IconMenuDots />
                        <IconDocument />
                        Hakaniementori
                      </div>
                      {/* RIGHT */}
                      <div className="right">
                        <div className="project-header-left">
                          <div className="circle-number-icon">1</div>
                          <IconPlaybackRecord />
                          <IconSpeechbubbleText />
                        </div>
                        <div className="project-header-right">
                          <span>3 400</span>
                          <span style={{ fontWeight: '300' }}>2 700</span>
                        </div>
                      </div>
                    </th>
                    {randomNumbers2.map((rn, i) => (
                      <td key={i} className="project-cell">
                        {rn}
                      </td>
                    ))}
                  </tr>
                </>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanningListView;
