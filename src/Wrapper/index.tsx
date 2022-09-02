import { useMemo } from 'react';
import Draggable from '../Draggable';
import { Provider } from '../Wrapper/Context';
import styles from './style.module.less';
import type { WrapperType } from './Context';
import classNames from 'classnames';

interface WrapperProps extends WrapperType, PlainNode {}

let _id = 0;

const Wrapper = (props: WrapperProps) => {
  const { children, className, style } = props;
  const identify = useMemo(() => `wrapper-container-${_id++}`, []);

  return (
    <div
      className={classNames(
        className,
        `wrapper-container`,
        styles.container,
        identify,
      )}
      style={style}
    >
      <Provider {...props} identify={identify}>
        <Draggable>{children}</Draggable>
      </Provider>
    </div>
  );
};

export default Wrapper;
