import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useState,
} from 'react';
import WrapperContext from '@src/Wrapper/Context';
import Draggabilly from 'draggabilly';
import { createPopper } from '@popperjs/core';
import classNames from 'classnames';
import styles from './style.module.less';
import { delay, merge } from 'lodash';
import type { ReactNode } from 'react';
import type { Instance as Popper, Placement } from '@popperjs/core';

interface DraggableProps extends PlainNode {
  axis?: 'x' | 'y';
  containment?: ElementLike | boolean;
  grid?: [number, number];
  handle?: ElementLike | ElementLike[];
}

enum Theme {
  dark = 'dark',
  light = 'light',
}

export interface Tooltip {
  title: ReactNode;
  theme?: Theme;
  placement?: Placement;
  modifiers?: any[];
  delay?: number;
}

export enum Events {
  dragStart = 'dragStart',
  dragMove = 'dragMove',
  dragEnd = 'dragEnd',
  pointerDown = 'pointerDown',
  pointerMove = 'pointerMove',
  pointerUp = 'pointerUp',
}

type Options = Required<Pick<Tooltip, 'theme' | 'placement' | 'delay'>>;

const events = Object.keys(Events);

const defaultOptions: Options = {
  theme: Theme.dark,
  placement: 'right',
  delay: 300,
};

/**
 * @document https://draggabilly.desandro.com/
 * @document https://popper.js.org/
 */
const Draggable = forwardRef((props: DraggableProps, ref) => {
  const { className, style, children, ...otherProps } = props;
  const consume = useContext(WrapperContext);
  const { container, identify, tooltip } = consume;
  const [visible, setVisible] = useState(false);
  const draggieRef = useRef();
  const popperRef = useRef<Popper>();
  const popperEleRef = useRef<HTMLDivElement>(null);

  const tooltipIsReactNode = useMemo(
    () => React.isValidElement(tooltip),
    [tooltip],
  );
  const {
    theme,
    placement,
    delay: delayTime,
  } = useMemo<Options>(() => {
    if (tooltipIsReactNode || tooltip === false) {
      return merge({}, defaultOptions);
    }
    return merge({}, defaultOptions, {
      theme: tooltip?.theme,
      placement: tooltip?.placement,
      delay: tooltip?.delay,
    });
  }, [tooltip, tooltipIsReactNode]);

  useImperativeHandle(
    ref,
    () => () => ({
      draggie: draggieRef.current,
      popper: popperRef.current,
    }),
    [],
  );

  // draggabilly
  useEffect(() => {
    const wrapper = document.querySelector(`.${identify}`);
    if (wrapper == null) return;

    const draggie = new Draggabilly(wrapper, {
      containment: container,
      ...otherProps,
    });

    // 拖动显示
    const open = () => {
      setVisible(true);
      if (popperEleRef.current == null) return;
      const { classList } = popperEleRef.current;
      classList.remove(styles.fadeOut);
    };
    const close = () => {
      if (popperEleRef.current) {
        const { classList } = popperEleRef.current;
        classList.add(styles.fadeOut);
      }
      delay(setVisible, delayTime, false);
    };
    draggie.on(Events.dragMove, open);
    draggie.on(Events.dragEnd, close);

    // 注册用户事件
    events.forEach((eventName) => {
      // @ts-ignore
      const event = consume[eventName];
      event && draggie.on(eventName, event);
    });

    return () => {
      draggie.destroy();
      draggieRef.current = undefined;
    };
  }, []);

  // tooltip
  useEffect(() => {
    if (!visible) return;

    let popper: Popper;
    const destroy = () => {
      popper?.destroy();
      popperRef.current = undefined;
    };

    if (!tooltip) return destroy;

    if (popperRef.current) {
      return destroy;
    }
    const popcornEle = document.querySelector(`.${identify}`);
    const tooltipEle = document.querySelector(
      `.${identify} .${styles.tooltip}`,
    );

    if (popcornEle == null || tooltipEle == null) return;

    popper = popperRef.current = createPopper(
      popcornEle,
      tooltipEle as HTMLElement,
      {
        placement,
        modifiers: [
          ...(typeof tooltip === 'object' ? tooltip.modifiers ?? [] : []),
        ],
      },
    );

    return destroy;
  }, [visible]);

  return (
    <>
      {tooltip && (
        <div
          ref={popperEleRef}
          className={classNames(styles.tooltip, theme && styles[theme])}
          role="tooltip"
          style={{
            display: visible ? 'block' : 'none',
            animationDuration: `${delayTime}ms`,
          }}
        >
          <>
            {visible && tooltipIsReactNode ? tooltip : tooltip.title}
            <div className={styles.arrow} data-popper-arrow></div>
          </>
        </div>
      )}
      {children}
    </>
  );
});

export default Draggable;
