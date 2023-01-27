import { useAppDispatch, useAppSelector } from '@/hooks/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { planProjectValues } from '@/mocks/common';
import { getProjectPhasesThunk } from '@/reducers/listsSlice';
import { RootState } from '@/store';
import {
  IconCheck,
  IconCross,
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';
import { FC, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import PlanningGroupsTableCell from './PlanningGroupsTableCell';

/**
 * RED CELLS
 * background: 'var(--color-suomenlinna-light)'
 * borderBottom: '4px solid var(--color-suomenlinna)'
 *
 * GREEN CELLS
 * ?
 *
 * BLUE CELLS
 * ?
 */

interface IPlanningProjectsTableProps {
  project: IProject;
}

const CircleIcon = ({ value }: { value: string }) => (
  <div className="circle-number-icon">
    {value}
    <div className="circle-number-icon-indicator">!</div>
  </div>
);

/**
 * We're only mapping the project name here for now since the values aren't yet implemented
 */
const PlanningGroupsTableRow: FC<IPlanningProjectsTableProps> = ({ project }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const navigateToProject = () => navigate(`/project/${project.id}/basics`);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const phases = useAppSelector((state: RootState) => state.lists.phase);

  const toggleStatusDialog = useCallback(() => setShowStatusDialog((current) => !current), []);

  useEffect(() => {
    dispatch(getProjectPhasesThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <tr>
      {/* HEADER */}
      <th className="project-header-cell">
        <div className="project-header-cell-container">
          {/* LEFT */}
          <div className="left">
            <IconMenuDots size="xs" style={{ cursor: 'pointer' }} onClick={toggleStatusDialog} />
            {showStatusDialog && (
              <div
                style={{
                  position: 'absolute',
                  maxWidth: '16rem',
                  background: 'var(--color-white)',
                  border: '0.1rem solid var(--color-black)',
                  zIndex: '999',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  transform: 'translateX(1.5rem)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    borderBottom: '0.08rem solid var(--color-black-20)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '0.3rem 0',
                  }}
                >
                  <div>
                    <p style={{ paddingLeft: '0.6rem' }}>Hakaniemenpuiston esirak...</p>
                    <p style={{ fontWeight: 'bold', paddingLeft: '0.6rem' }}>Nykystatus</p>
                  </div>
                  <IconCross
                    style={{ paddingRight: '0.6rem', cursor: 'pointer' }}
                    onClick={toggleStatusDialog}
                  />
                </div>

                <div
                  style={{
                    borderBottom: '0.08rem solid var(--color-black-20)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.7rem 0 0 0',
                  }}
                >
                  {phases.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        background:
                          project?.phase?.id === p.id ? 'var(--color-bus-medium-light)' : 'white',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          paddingLeft: '0.7rem',
                          alignItems: 'center',
                          gap: '0.7rem',
                          overflow: 'hidden',
                        }}
                      >
                        <IconPlaybackRecord style={{ minWidth: '1.5rem' }} />
                        <p
                          style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            fontSize: '14px',
                            fontWeight: project?.phase?.id === p.id ? 'bold' : 'normal',
                            paddingRight: project?.phase?.id === p.id ? '0' : '2rem',
                          }}
                        >
                          {t(`enums.${p.value}`)}
                        </p>
                      </div>
                      {project?.phase?.id === p.id && (
                        <IconCheck style={{ paddingRight: '0.7rem', minWidth: '1.5rem' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <IconDocument size="xs" />
            <button className="project-name-button" onClick={navigateToProject}>
              {project.name}
            </button>
          </div>
          {/* RIGHT */}
          <div className="right">
            <div className="project-header-left">
              <CircleIcon value={planProjectValues.readiness} />
              <IconPlaybackRecord size="xs" />
              <IconSpeechbubbleText size="xs" />
            </div>
            <div className="project-header-right">
              <span>{planProjectValues.value1}</span>
              <span>{planProjectValues.value2}</span>
            </div>
          </div>
        </div>
      </th>
      {planProjectValues.sums.map((p, i) => (
        <PlanningGroupsTableCell key={i} value={p} />
      ))}
    </tr>
  );
};

export default PlanningGroupsTableRow;
