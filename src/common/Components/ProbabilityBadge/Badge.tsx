import clsx from 'clsx';
import config from 'common/config';

type Props = {
  probability?: number;
  className?: string;
  onClick?: any;
};

const ProbabilityBadge = ({ probability, className, onClick }: Props) => {
  if (!probability) return null;

  let color;
  if (probability > config.positiveThreshold) {
    color = 'bg-[var(--classifier-success)]';
  } else if (probability > config.possibleThreshold) {
    color = 'bg-[var(--classifier-plausible)]';
  } else {
    color = 'bg-[var(--classifier-unlikely)]';
  }

  return (
    <div
      className={clsx(
        'size-5 p-0.75 rounded-full shrink-0 m-0.5 bg-white',
        className
      )}
      onClick={onClick}
    >
      <div className={clsx('size-full rounded-full shrink-0', color)} />
    </div>
  );
};

export default ProbabilityBadge;
