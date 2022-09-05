import { useCallback, useContext, useRef } from 'react';
import Context, { Provider } from '@src/Wrapper/Context';
import type { ReactNode } from 'react';

const liveLocation = (children: ReactNode) => {
  const consume = useContext(Context);
  const { tooltip, identify } = consume;
  const wrapperEleRef = useRef();
  console.log('consume', consume);

  const dragMove = useCallback(() => {
    let wrapper: HTMLElement;
    if (wrapperEleRef.current) {
      wrapper = wrapperEleRef.current;
    } else {
      wrapper = document.querySelector(`.${identify}`) as HTMLElement;
    }
    console.log(
      'wrapper',
      document.querySelector(`.${identify}`),
      identify,
      wrapperEleRef,
    );
    const parentElement = wrapper.parentElement as HTMLElement;
    const { left: parentLeft, top: parentTop } =
      parentElement.getBoundingClientRect();
    const { left, top } = wrapper.getBoundingClientRect();
    console.log(left - parentLeft, top - parentTop);
  }, []);

  return <Provider dragMove={dragMove}>{children}</Provider>;
};

export default liveLocation;
