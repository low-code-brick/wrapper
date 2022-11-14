import { useContext, useEffect, useRef, forwardRef } from 'react';
import WrapperContext from '@src/Wrapper/Context';
import classNames from 'classnames';
import { setStyle, getRotate } from '@src/utils';
import {
  misregistration,
  setCursor,
  areaDirection,
  toRadian,
  getRectChange,
  toTransform,
  mergeTransform,
  rotateDirection,
  nearDistance,
} from './core';
import { Pan, Manager } from 'hammerjs';
import styles from './style.module.less';
import type { Delta } from '@src/utils';
import type { Refs } from '@src/Wrapper';

interface StretchProps extends PlainNode {
  refs: Refs;
}

type Translate = {
  x: number;
  y: number;
};

// 鼠标的移动方向
const revMap: Record<number, 1 | -1> = {
  16: 1, // 下
  4: 1, // 右
  8: -1, // 上
  2: -1, // 左
  1: 1, // 原地
};

function getDistance(
  {
    area,
    event,
  }: { area: ReturnType<typeof areaDirection>; event: HammerInput },
  radian: number,
  horizontal = true,
) {
  const methods = [Math.cos, Math.sin];
  if (!horizontal) {
    methods.reverse();
  }
  return area.x * area.y > 0
    ? event.deltaX / Math.abs(methods[0](radian))
    : event.deltaY / Math.abs(methods[1](radian));
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

    const observer = new ResizeObserver(function (entries) {
      // entries.forEach();
    });

    // 拉伸事件
    const managers: InstanceType<typeof Manager>[] = [];
    const lines = ['lineTop', 'lineRight', 'lineBottom', 'lineLeft'];
    const circles = [
      'circleTopLeft',
      'circleBottomRight',
      'circleTopRight',
      'circleBottomLeft',
    ];
    const eles = [...lines, ...circles];
    eles.forEach((tag, tagIndex) => {
      const line = document.querySelector(
        `.${identify} .${styles[tag]}`,
      ) as HTMLElement;
      const mc = new Manager(line);
      managers.push(mc);
      mc.add(new Pan());

      // let rect: DOMRect;
      let position: {
        left: number;
        top: number;
        width: number;
        height: number;
      };
      let rotate = getRotate(wrapper) % 360;

      // 这里没有办法直接获取到 transform 值.
      // 通过监听 resize 来获取.
      observer.observe(wrapper.querySelector(`.${styles[tag]}`)!);

      mc.on('panstart', () => {
        // rect = wrapper.getBoundingClientRect();
        const left = Number.parseFloat(getComputedStyle(wrapper).left);
        const top = Number.parseFloat(getComputedStyle(wrapper).top);
        // const { height, width } = rect; // 这里
        const width = Number.parseFloat(wrapper.style.width);
        const height = Number.parseFloat(wrapper.style.height);
        position = { left, top, width, height };
        rotate = getRotate(wrapper) % 360;
        draggle.get().setPopperVisible(true);

        // 设置鼠标样式, TODO: 移动到外部
        setCursor(tag, wrapper.querySelector(`.${styles[tag]}`)!, rotate);
      });
      mc.on('panmove', (event: HammerInput) => {
        const { left, top, height, width } = position;
        const area = areaDirection(rotate + 45);
        // const direction = rotate > 135 && rotate < 315 ? -1 : 1;
        const radian = toRadian(rotate);
        const direction = rotateDirection(rotate);
        const point = [event.deltaX, event.deltaY];
        const tagDirection = tagIndex % 2;
        const nd = nearDistance(rotate + 180);

        let delta: Delta;
        let changed: ReturnType<typeof getRectChange>;
        let changedA: ReturnType<typeof getRectChange>;
        let changedB: ReturnType<typeof getRectChange>;
        let cx: number;
        let cy: number;
        // TODO: 数值保留1位小数
        // TODO: 鼠标样式随旋转变化
        // TODO: 转换为 matrix
        switch (tag) {
          case 'lineBottom':
            break;
          case 'lineRight':
            break;
          case 'lineLeft':
            // console.log(Math.sin(radian), Math.cos(radian));
            // const point = [event.deltaX, event.deltaY];
            // const distance = point[0] / Math.cos(toRadian(rotate));
            // const y = (-distance / 2) * Math.sin(toRadian(rotate));
            // const x = (-distance / 2) * (1 + Math.cos(toRadian(rotate)));
            // delta = {
            //   transform: toTransform({
            //     rotate,
            //     x: -x,
            //     y,
            //   }),
            //   width: width - distance,
            // };

            // const point = [event.deltaX, event.deltaY].reverse();
            // const distance = point[0] / (1 - Math.cos(toRadian(rotate)));
            // const y = (-distance / 2) * Math.sin(toRadian(rotate));
            // const x = (-distance / 2) * (1 + Math.cos(toRadian(rotate)));
            // delta = {
            //   transform: toTransform({
            //     rotate,
            //     x: -x,
            //     y,
            //   }),
            //   width: width - distance,
            // };

            // const nd = nearDistance(rotate);
            // // const distanceDirection = direction / 2 > 1 ? 1 : -1;
            // const distanceDirection = nd === tagDirection ? 1 : -1;
            // // const distanceDirection = -1;
            // console.log(
            //   tagIndex,
            //   direction,
            //   // direction,
            //   // tagIndex,
            //   // direction === (tagIndex + 2) % 4 ? -1 : 1,
            //   // tagIndex % 2,
            //   // Math.floor(direction / 2) === 0 ? 1 : -1,
            // );
            // const distance =
            //   (point[direction % 2 ? tagDirection : +!tagDirection] /
            //     (nd === 1
            //       ? 1 - Math.cos(toRadian(rotate))
            //       : Math.cos(toRadian(rotate)))) *
            //   distanceDirection;
            // const y = (distance / 2) * Math.sin(toRadian(rotate));
            // const x = (distance / 2) * (1 + Math.cos(toRadian(rotate)));
            // delta = {
            //   transform: toTransform({
            //     rotate,
            //     x: -x,
            //     y,
            //   }),
            //   // 必须加
            //   width: width + distance,
            // };

            // changed = getRectChange(
            //   event,
            //   rotate,
            //   [true, -1, false],
            //   [-1, 1, -1],
            // );
            // delta = {
            //   transform: toTransform(changed),
            //   width: width - changed.distance,
            // };
            break;
          case 'lineTop':
            // const point = [event.deltaX, event.deltaY].reverse();
            // const distance = point[0] / Math.cos(toRadian(rotate));
            // const y = (distance / 2) * Math.sin(toRadian(rotate));
            // const x = (distance / 2) * (1 + Math.cos(toRadian(rotate)));
            // delta = {
            //   transform: toTransform({
            //     rotate,
            //     x: y,
            //     y: x,
            //   }),
            //   height: height - distance,
            //   // width,
            // };

            // console.log(Math.sin(radian), Math.cos(radian));
            // const point = [event.deltaX, event.deltaY];
            // const distance = point[0] / (1 - Math.cos(toRadian(rotate)));
            // const y = (distance / 2) * Math.sin(toRadian(rotate));
            // const x = (distance / 2) * (1 + Math.cos(toRadian(rotate)));
            // delta = {
            //   transform: toTransform({
            //     rotate,
            //     x: y,
            //     y: x,
            //   }),
            //   height: height - distance,
            //   // width,
            // };

            // const nd = nearDistance(rotate);
            // const tagDirection = tagIndex % 2;
            // const distanceDirection = direction === 1 ? -1 : 1;
            // // console.log(
            // //   event,
            // //   // direction,
            // //   // tagIndex,
            // //   // direction === (tagIndex + 2) % 4 ? -1 : 1,
            // //   // tagIndex % 2,
            // //   // Math.floor(direction / 2) === 0 ? 1 : -1,
            // // );
            // const distance =
            //   (point[direction % 2 ? tagDirection : +!tagDirection] /
            //     (nd === 1
            //       ? 1 - Math.cos(toRadian(rotate))
            //       : Math.cos(toRadian(rotate)))) *
            //   distanceDirection;
            // const y = (distance / 2) * Math.sin(toRadian(rotate));
            // const x = (distance / 2) * (1 + Math.cos(toRadian(rotate)));
            // console.log(distance, event.angle);
            // delta = {
            //   transform: toTransform({
            //     rotate,
            //     x: y,
            //     y: x,
            //   }),
            //   height: height - distance,
            // };

            // changed = getRectChange(event, rotate, [false, -1, true], [1, 1]);
            // // delta = {
            // //   transform: toTransform(changed),
            // //   height: height - changed.distance,
            // // };
            break;
          case 'circleTopLeft':
            break;
          case 'circleBottomRight':
            break;
          case 'circleTopRight':
            break;
          case 'circleBottomLeft':
            break;
        }
        // @ts-ignore
        if (delta == null) return;

        // TODO: 优化动画, 操作DOM不该在这里
        // @ts-ignore
        // if (delta.width < 0 || delta.height < 0) {
        //   console.log('out');
        //   return;
        // }
        setStyle(wrapper, delta!);
        draggle.get().popper?.update();
      });

      mc.on('panend', () => {
        // translate => position
        const transform = getComputedStyle(wrapper).transform;
        const left = Number.parseFloat(getComputedStyle(wrapper).left);
        const top = Number.parseFloat(getComputedStyle(wrapper).top);
        const match = transform.match(/matrix\((?<matrix>.+)\)$/);

        if (match) {
          let tx = 0;
          let ty = 0;
          const matrix = match.groups!.matrix.split(/\s*,\s*/);
          switch (matrix.length) {
            case 6:
              tx = +matrix.at(-2)!;
              ty = +matrix.at(-1)!;
              break;
            case 16:
              tx = +matrix.at(-4)!;
              ty = +matrix.at(-3)!;
              break;
          }

          setStyle(wrapper, {
            left: left + tx,
            top: top + ty,
            transform: `rotateZ(${rotate}deg)`,
          });
        }

        // TODO: 抽离出去
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

    // 获取不到样式
    // console.log(
    //   'wrappe22222r',
    //   wrapper,
    //   wrapper.style.transform,
    //   window.getComputedStyle(wrapper).transform,
    // );

    // 设置鼠标样式
    // setCursor(
    //   tag,
    //   wrapper.querySelector(`.${styles[tag]}`)!,
    //   rotate,
    // );
    // 监听rotate变化时间, 设置鼠标样式

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
      <div className={classNames('line', styles.line, styles.lineLeft)} data->
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
