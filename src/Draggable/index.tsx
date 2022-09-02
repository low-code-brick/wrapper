import {
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useContext,
} from 'react';
import WrapperContext from '@src/Wrapper/Context';
import Draggabilly from 'draggabilly';
import './style.module.less';

interface DraggableProps extends PlainNode {
  axis?: 'x' | 'y';
  containment?: ElementLike | boolean;
  grid?: [number, number];
  handle?: ElementLike | ElementLike[];
}

/**
 * @document https://draggabilly.desandro.com/
 */
const Draggable = forwardRef((props: DraggableProps, ref) => {
  const { className, style, children, ...otherProps } = props;
  const draggieRef = useRef();
  const { container, identify } = useContext(WrapperContext);

  useImperativeHandle(ref, () => draggieRef.current, []);

  useEffect(() => {
    const draggie = new Draggabilly(`.${identify}`, {
      containment: container,
      ...otherProps,
    });
    draggieRef.current = draggie;

    return () => {
      draggie.destroy();
    };
  }, []);

  return <>{children}</>;
});

export default Draggable;
