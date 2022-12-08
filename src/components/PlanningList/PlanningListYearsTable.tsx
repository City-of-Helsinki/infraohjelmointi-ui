const yearsTableData = [
  {
    title: 'kuluva TA',
    year: '2022',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
    otherVal3: '340 200',
  },
  {
    title: 'TAE',
    year: '2023',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'TSE',
    year: '2024',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'TSE',
    year: '2025',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'kuluva TA',
    year: '2026',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'alustava',
    year: '2027',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'alustava',
    year: '2028',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'alustava',
    year: '2029',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'alustava',
    year: '2030',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'alustava',
    year: '2031',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
  {
    title: 'alustava',
    year: '2032',
    sum: '341 400',
    otherVal1: '+400',
    otherVal2: '1400',
  },
];

const PlanningListYearsTable = () => {
  return (
    <table cellSpacing={0} style={{ flex: '2 1' }}>
      <thead>
        <tr>
          {yearsTableData.map((o, i) => (
            <td key={i}>
              <p>{o.title}</p>
              <p style={{ fontWeight: 'bold' }}>{`<> ${o.year}`}</p>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {yearsTableData.map((o, i) => (
            <td
              key={i}
              style={{ background: 'var(--color-bus)', color: 'white', padding: '0.5rem 1rem' }}
            >
              {o.sum}
            </td>
          ))}
        </tr>
        <tr>
          {yearsTableData.map((o, i) => (
            <td key={i}>{o.otherVal3 && o.otherVal3}</td>
          ))}
        </tr>
        <tr>
          {yearsTableData.map((o, i) => (
            <td key={i}>
              <p>{o.otherVal1}</p>
              <p>{o.otherVal2}</p>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default PlanningListYearsTable;
