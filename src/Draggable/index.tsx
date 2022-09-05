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
import type { ReactNode } from 'react';
import type { Instance as Popper } from '@popperjs/core';

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

enum Placement {
  right = 'right',
  left = 'left',
  bottom = 'bottom',
  top = 'top',
}

export interface Tooltip {
  title: ReactNode;
  theme?: Theme;
  placement?: Placement;
  // visible?: boolean;
}

const events = [
  'dragStart',
  'dragMove',
  'dragEnd',
  'pointerDown',
  'pointerMove',
  'pointerUp',
];

/**
 * @document https://draggabilly.desandro.com/
 */
const Draggable = forwardRef((props: DraggableProps, ref) => {
  const { className, style, children, ...otherProps } = props;
  const consume = useContext(WrapperContext);
  const { container, identify, tooltip } = consume;
  const [visible, setVisible] = useState(
    // (tooltip && tooltip?.visible) ?? false,
    false,
  );
  const draggieRef = useRef();
  const popperRef = useRef<Popper>();

  const tooltipIsReactNode = useMemo(
    () => React.isValidElement(tooltip),
    [tooltip],
  );
  const theme = useMemo<Theme>(() => {
    if (tooltipIsReactNode) {
      return Theme.dark;
    }
    return tooltip ? tooltip.theme ?? Theme.dark : Theme.dark;
  }, [tooltip, tooltipIsReactNode]);
  const placement = useMemo<Placement>(() => {
    if (tooltipIsReactNode) {
      return Placement.right;
    }
    return tooltip ? tooltip.placement ?? Placement.right : Placement.right;
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

    // 悬浮显示
    // TODO: 延迟
    const mouseenter = () => setVisible(true);
    const mouseleave = () => setVisible(false);
    wrapper.addEventListener('mouseenter', mouseenter);
    wrapper.addEventListener('mouseleave', mouseleave);

    // 注册事件
    events.forEach((eventName) => {
      // @ts-ignore
      const event = consume[eventName];
      event && draggie.on(eventName, event);
    });

    return () => {
      draggie.destroy();
      draggieRef.current = undefined;
      wrapper.removeEventListener('mouseenter', mouseenter);
      wrapper.removeEventListener('mouseleave', mouseleave);
    };
  }, []);

  // tooltip
  useEffect(() => {
    let popper: Popper;
    const destroy = () => {
      console.log(111);
      popper?.destroy();
      popperRef.current = undefined;
    };

    if (!tooltip) return destroy;

    if (popperRef.current) {
      popper = popperRef.current;
      popper.update();
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
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    );

    return destroy;
  }, [visible]);

  return (
    <>
      {tooltip && visible && (
        <div
          className={classNames(styles.tooltip, theme && styles[theme])}
          role="tooltip"
        >
          <>
            {tooltipIsReactNode ? tooltip : tooltip.title}
            <div className={styles.arrow} data-popper-arrow></div>
          </>
        </div>
      )}
      {children}
    </>
  );
});

export default Draggable;
