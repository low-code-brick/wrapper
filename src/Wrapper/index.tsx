import { useMemo, useRef, useEffect } from 'react';
import Draggable from '../Draggable';
import { Provider, Theme } from './Context';
import type { WrapperType } from './Context';
import styles from './style.module.less';
import classNames from 'classnames';

interface WrapperProps extends WrapperType, PlainNode {
  draggable?: boolean;
  rotate?: boolean;
  scale?: boolean;
}

let _id = 0;

const Wrapper = (props: WrapperProps) => {
  const {
    children,
    className,
    style,
    // TODO: 配置
    draggable = true,
    rotate = true,
    scale = true,
    tooltip = false,
  } = props;
  const identify = useMemo(() => `wrapper-${_id++}`, []);

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
      <div className={classNames(`wrapper-inner`, styles.inner)}>
        <Provider {...props} identify={identify}>
          {draggable && <Draggable>{children}</Draggable>}
        </Provider>
      </div>
    </div>
  );
};

export default Wrapper;
