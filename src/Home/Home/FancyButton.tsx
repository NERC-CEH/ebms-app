import { useContext, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Trans as T } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { JSX } from '@ionic/core';
import { IonIcon, NavContext } from '@ionic/react';

type Props = {
  label: string;
  path: string;
  description?: string;
  icon: string;
} & JSX.IonButton;

const FancyButton = ({
  label,
  description,
  icon,
  path,
  ...otherProps
}: Props) => {
  const { pathname } = useLocation<any>();

  const ref = useRef<HTMLDivElement>(null);
  const [fullyVisible, setFullyVisible] = useState(true);
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const isOnActivePage = pathname === '/home/home';

    setTimeout(() => setIsAnimationActive(isOnActivePage), 100);
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // threshold 1.0 fires only when the element is 100% visible
    observerRef.current = new IntersectionObserver(
      ([entry]) => setFullyVisible(entry.intersectionRatio >= 1),
      { threshold: 1.0 }
    );

    observerRef.current.observe(el);

    // disconnect observer when component unmounts
    return () => observerRef.current?.disconnect(); // eslint-disable-line consistent-return
  }, []);

  const { navigate } = useContext(NavContext);

  const onClick = () => navigate(path);

  return (
    <div
      className={clsx(
        'flex justify-between items-center w-full p-3 pl-6.25 shadow-[0_20px_50px_rgba(0,0,0,0.35),0_5px_10px_rgba(0,0,0,0.35)] overflow-hidden rounded-xl bg-white',
        isAnimationActive && 'transition-opacity duration-300',
        !fullyVisible ? 'opacity-70' : 'opacity-100'
      )}
      color="light"
      onClick={onClick}
      {...otherProps}
      ref={ref}
    >
      <div className="flex flex-col">
        <div className="font-bold text-xl line-clamp-1">
          <T>{label}</T>
        </div>
        {description && (
          <span className="text-sm line-clamp-1">
            <T>{description}</T>
          </span>
        )}
      </div>

      <IonIcon
        src={icon}
        className="size-13 ml-2.5 bg-warning-200/40 rounded-xl p-1 shrink-0"
      />
    </div>
  );
};

export default FancyButton;
