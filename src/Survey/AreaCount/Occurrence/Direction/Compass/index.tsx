import './styles.scss';

type Props = {
  direction: any;
};

const Compass = ({ direction }: Props) => {
  return (
    <div id="compass">
      <div
        className="compassWindRose"
        style={{
          transform: `rotate(${direction}deg)`,
        }}
      >
        {[...Array(10)].map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div className="compassMark" key={i} />
        ))}
        <div className="compassMark--directionH" />
        <div className="compassMark--directionV" />
      </div>
      <div className="compassArrowContainer">
        <div className="compassArrow" />
      </div>
    </div>
  );
};

export default Compass;
