import {
  IconDocument,
  IconMenuDots,
  IconPlaybackRecord,
  IconSpeechbubbleText,
} from 'hds-react/icons';

const randomNumbers = ['460', '460', '460', '460', '460', '460', '460', '460', '460', '460', '460'];

const PlanningListTableRow = () => {
  return (
    <tr>
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
      {randomNumbers.map((rn, i) => (
        <td key={i} className="project-cell">
          {rn}
        </td>
      ))}
    </tr>
  );
};

export default PlanningListTableRow;
