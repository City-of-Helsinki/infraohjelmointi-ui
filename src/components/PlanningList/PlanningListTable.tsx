import { Paragraph, Title } from '@/components/shared';
import { Button } from 'hds-react/components/Button';
import { FC, useState } from 'react';
import PlanningListTableHeader from './PlanningListTableHeader';
import PlanningListTableRow from './PlanningListTableRow';
import PlanningListYearsTable from './PlanningListYearsTable';

const randomProjects = ['project1', 'project2', 'project3'];

const PlanningListTable: FC = () => {
  const [isProjectsVisible, setIsProjectsVisible] = useState(true);

  const handleProjectsVisible = () => setIsProjectsVisible(!isProjectsVisible);

  return (
    <div className="planning-list-table-container">
      {/* CONTENT & YEARS TABLE */}
      <div style={{ display: 'flex' }}>
        <div className="planning-table-info" style={{ flex: '1 1' }}>
          <div id="planningTableTitle">
            <Title text="Talousarvioehdotusten valmistelu" size="s" />
          </div>
          <div id="planningTableButton">
            <Button variant="success" style={{ height: '44px', width: '239px' }}>
              Määrärahojen valmistelu
            </Button>
            <span>Käynnissä 20.6.2020 asti</span>
          </div>

          <div id="group-info">
            <span className="group-info-text">Uudisrak. Pohj.SP</span>
            <span>keur</span>
          </div>

          <div id="basic-info">
            <span>{'>< Perustiedot <> KA ja ohj.'}</span>
          </div>
        </div>
        <PlanningListYearsTable />
      </div>
      {/* <div style={{ display: 'flex' }}>
        <table style={{ flex: '1 1' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>
                <Title text="Talousarvioehdotusten valmistelu" size="s" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Button variant="success">Määrärahojen valmistelu</Button>
              </td>
              <td>
                <p className="group-info-text">Uudisrak. Pohj.SP</p>
                <p>keur</p>
              </td>
            </tr>
            <tr>
              <td>
                <Paragraph size="m" text="Käynnissä 20.6.2020 asti" />
              </td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>
                <p className="basic-info-text">{'>< Perustiedot <> KA ja ohj.'}</p>
              </td>
            </tr>
          </tbody>
        </table>
        <PlanningListYearsTable />
      </div> */}
      {/* PROJECTS TABLE */}
      <table className="planning-list-table" cellSpacing={0}>
        {/* HEAD */}
        <thead>
          {/* GROUP */}
          <PlanningListTableHeader
            isProjectsVisible={isProjectsVisible}
            handleProjectsVisible={handleProjectsVisible}
          />
        </thead>
        {/* BODY */}
        <tbody>
          {/* PROJECT ROWS */}
          {isProjectsVisible && randomProjects.map((rp) => <PlanningListTableRow key={rp} />)}
        </tbody>
      </table>
    </div>
  );
};

export default PlanningListTable;
