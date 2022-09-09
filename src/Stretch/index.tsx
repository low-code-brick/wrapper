import { useContext, useEffect, useRef, forwardRef } from 'react';
import WrapperContext from '@src/Wrapper/Context';
import classNames from 'classnames';
import { setStyle } from '@src/utils';
import { Pan, Manager } from 'hammerjs';
import styles from './style.module.less';
import type { Delta } from '@src/utils';
import type { Refs } from '@src/Wrapper';

interface StretchProps extends PlainNode {
  refs: Refs;
}

const Stretch = forwardRef((props: StretchProps, ref) => {
  const {
    refs: { draggle },
  } = props;
  const consume = useContext(WrapperContext);
  const wrapperRef = useRef<HTMLElement | null>();
  const { identify } = consume;

  useEffect(() => {
    // 获取容器
    const wrapper = (wrapperRef.current = document.querySelector(
      `.${identify}`,
    ) as HTMLElement);
    if (wrapper == null) return;

    // 拉伸事件
    const managers: InstanceType<typeof Manager>[] = [];
    [
      'lineRight',
      'lineBottom',
      'lineLeft',
      'lineTop',
      'circleTopLeft',
      'circleBottomRight',
      'circleTopRight',
      'circleBottomLeft',
    ].forEach((direction) => {
      const line = document.querySelector(
        `.${identify} .${styles[direction]}`,
      ) as HTMLElement;
      const mc = new Manager(line);
      managers.push(mc);
      mc.add(new Pan());

      let rect: DOMRect;
      let position: { left: number; top: number };
      mc.on('panstart', () => {
        rect = wrapper.getBoundingClientRect();
        const left = Number.parseFloat(wrapper.style.left);
        const top = Number.parseFloat(wrapper.style.top);
        position = { left, top };

        draggle.get().setPopperVisible(true);
      });

      mc.on('panmove', (event) => {
        const { height, width } = rect;
        const { left, top } = position;

        let delta: Delta;
        switch (direction) {
          case 'lineBottom':
            delta = {
              height: height + event.deltaY,
            };
            break;
          case 'lineRight':
            delta = {
              width: width + event.deltaX,
            };
            break;
          case 'lineLeft':
            delta = {
              width: width - event.deltaX,
              left: left + event.deltaX,
            };
            break;
          case 'lineTop':
            delta = {
              height: height - event.deltaY,
              top: top + event.deltaY,
            };
            break;
          case 'circleTopLeft':
            delta = {
              width: width - event.deltaX,
              left: left + event.deltaX,
              height: height - event.deltaY,
              top: top + event.deltaY,
            };
            break;
          case 'circleBottomRight':
            delta = {
              width: width + event.deltaX,
              height: height + event.deltaY,
            };
            break;
          case 'circleTopRight':
            delta = {
              top: top + event.deltaY,
              width: width + event.deltaX,
              height: height - event.deltaY,
            };
            break;
          case 'circleBottomLeft':
            delta = {
              left: left + event.deltaX,
              width: width - event.deltaX,
              height: height + event.deltaY,
            };
            break;
        }

        // TODO: 优化动画, 操作DOM不该在这里
        // @ts-ignore
        setStyle(wrapper, delta);
        draggle.get().popper?.update();
      });

      mc.on('panend', () => {
        draggle.get().setPopperVisible(false);
      });

      // 自定义事件
      ['panStart', 'panMove', 'panEnd'].forEach((eventName) => {
        // @ts-ignore
        const event = consume[eventName];
        if (event) {
          mc.on(eventName.toLowerCase(), event);
        }
      });
    });

    return () => {
      managers.forEach((o) => o.destroy());
    };
  }, []);

  return (
    <>
      <div className={classNames('line', styles.line, styles.lineTop)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleTopCenter,
          )}
        />
      </div>
      <div className={classNames('line', styles.line, styles.lineRight)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleRightCenter,
          )}
        />
      </div>
      <div className={classNames('line', styles.line, styles.lineBottom)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleBottomCenter,
          )}
        />
      </div>
      <div className={classNames('line', styles.line, styles.lineLeft)}>
        <div
          className={classNames(
            'circle',
            styles.circle,
            styles.circleLeftCenter,
          )}
        />
      </div>
      <div
        className={classNames('circle', styles.circle, styles.circleTopLeft)}
      />
      <div
        className={classNames('circle', styles.circle, styles.circleTopRight)}
      />
      <div
        className={classNames('circle', styles.circle, styles.circleBottomLeft)}
      />
      <div
        className={classNames(
          'circle',
          styles.circle,
          styles.circleBottomRight,
        )}
      />
    </>
  );
});

export default Stretch;