const BubbleIcon = ({ value, size, color }: { value: string; color?: string; size?: string }) => (
  <div
    className={`bubble-icon${size === 's' ? '-s' : '-m'} ${color === 'white' ? 'white' : 'black'}`}
  >
    {value}
  </div>
);

export default BubbleIcon;
