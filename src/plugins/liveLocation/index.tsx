import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';
import Context, { Provider } from '@src/Wrapper/Context';
import { merge } from 'lodash';
import type { ReactNode } from 'react';
import type { WrapperType } from '@src/Wrapper/Context';
import type { Refs } from '@src/Wrapper';

type Location = { x: number; y: number };

const LocationText = ({ x, y }: Location) => {
  return (
    <>
      x: {x}
      <br />
      y: {y}
    </>
  );
};

const liveLocation = (render?: (location: Location) => ReactNode) => {
  return (Componet: React.FC, refs: Refs) => {
    return () => {
      const consume = useContext(Context);
      const { tooltip: userTooltip, identify } = consume;
      const wrapperEleRef = useRef();
      const [location, setLocation] = useState({ x: 0, y: 0 });
      const tooltip: WrapperType['tooltip'] = useMemo(() => {
        return merge(
          {
            placement: 'bottom-end',
          },
          userTooltip,
          {
            title: render ? (
              <>{render(location)}</>
            ) : (
              <LocationText {...location} />
            ),
          },
        );
      }, [userTooltip, location]);

      const dragMove = useCallback(() => {
        let wrapper: HTMLElement;
        if (wrapperEleRef.current) {
          wrapper = wrapperEleRef.current;
        } else {
          wrapper = document.querySelector(`.${identify}`) as HTMLElement;
        }
        const parentElement = wrapper.parentElement as HTMLElement;
        const { left: parentLeft, top: parentTop } =
          parentElement.getBoundingClientRect();
        const { left, top } = wrapper.getBoundingClientRect();
        setLocation({
          x: left - parentLeft,
          y: top - parentTop,
        });
      }, []);

      useEffect(() => {
        console.log(refs.draggle.get());
      }, []);

      return (
        <Provider dragMove={dragMove} tooltip={tooltip}>
          <Componet />
        </Provider>
      );
    };
  };
};

export default liveLocation;
