import styles from './style.module.less';

// 获取 resize 后的偏移量
export function misregistration(
  distance: number,
  rotate: number,
  topOrBottomArea: 1 | -1 = 1,
  reverse?: boolean,
) {
  rotate = toRadian(rotate);
  const y = distance * Math.sin(rotate);
  const x = distance * (1 - topOrBottomArea * Math.cos(rotate));
  return reverse
    ? {
        x: y,
        y: x,
      }
    : { x, y };
}

export function toRadian(rotate: number) {
  return (rotate / 180) * Math.PI;
}

// export function areaDeg(rotate) {
//   rotate = toRadian(rotate);
//   const sin = Math.sin(rotate);
//   const cos = Math.cos(rotate);
//   console.log(sin, cos)
//   if (sin > 0 && cos > 0) {
//     return 1;
//   }
//   if (sin < 0 && cos > 0) {
//     return 4;
//   }
//   if (sin < 0 && cos < 0) {
//     return 3;
//   }
//   if (sin > 0 && cos < 0) {
//     return 2;
//   }
// }

// 区间方向, 用于区分象限
export function areaDirection(rotate: number) {
  rotate = toRadian(rotate);
  const sin = Math.sin(rotate) > 0 ? 1 : -1;
  const cos = Math.cos(rotate) > 0 ? 1 : -1;
  return {
    x: sin,
    y: cos,
  };
}

export function setCursor(
  targetClassName: string,
  target: HTMLElement,
  rotate: number,
) {
  const areaDirection = Math.cos((rotate / 180) * Math.PI);
  // console.log('areaDirection', areaDirection, targetClassName, rotate);
  target.classList.remove(styles.ns);
  target.classList.remove(styles.ew);
  target.classList.remove(styles.nwse);
  target.classList.remove(styles.nesw);
  switch (targetClassName) {
    case 'lineBottom':
      target.classList.add(areaDirection > 0 ? styles.ns : styles.ew);
      break;
    case 'lineRight':
      target.classList.add(areaDirection < 0 ? styles.ns : styles.ew);
      break;
    case 'lineLeft':
      target.classList.add(areaDirection < 0 ? styles.ns : styles.ew);
      break;
    case 'lineTop':
      target.classList.add(areaDirection > 0 ? styles.ns : styles.ew);
      break;
    case 'circleTopLeft':
      target.classList.add(areaDirection < 0 ? styles.nesw : styles.nwse);
      break;
    case 'circleBottomRight':
      target.classList.add(areaDirection < 0 ? styles.nesw : styles.nwse);
      break;
    case 'circleTopRight':
      target.classList.add(areaDirection > 0 ? styles.nesw : styles.nwse);
      break;
    case 'circleBottomLeft':
      target.classList.add(areaDirection > 0 ? styles.nesw : styles.nwse);
      break;
  }
}

// 获取每次的偏移矢量
export function getVector(
  {
    area,
    event,
  }: {
    area: ReturnType<typeof areaDirection>;
    event: HammerInput;
  },
  radian: number,
  horizontal = true,
) {
  const methods = [Math.cos, Math.sin];
  const point = [event.deltaX, event.deltaY];

  if (!horizontal) {
    point.reverse();
  }

  if (radian === 0) {
    return area.x * area.y > 0 ? point[0] : point[1];
  }

  return area.x * area.y > 0
    ? point[0] / Math.abs(methods[0](radian))
    : point[1] / Math.abs(methods[1](radian));
}

type Direction = 1 | -1;
// 鼠标的移动方向
const revMap: Record<number, Direction> = {
  16: 1, // 下
  4: 1, // 右
  8: -1, // 上
  2: -1, // 左
  1: 1, // 原地
};

export function getRectChange(
  event: HammerInput,
  rotate: number,
  [
    // 是否水平方向
    vOrH = true,
    // 触发元素处于哪个上下半区
    topOrBottomArea = 1,
  ]: [boolean, Direction, boolean],
  [
    // 触发元素的偏移方向
    x,
    y,
    // lineLeft比较特殊. -1: left.
    t = 1,
  ]: [Direction, Direction, Direction?],
  offsetRotate: number = 0,
  // 自定义步进距离
  userDistance?: number,
) {
  const radian = toRadian(rotate);
  const area = areaDirection(rotate + 45);
  const halfArea = rotate > 135 && rotate < 315 ? -1 : 1;
  // 水平方向2条线, 旋转90度. 方向会反过来
  const fixOffsetDirection = vOrH ? 1 : area.x * area.y;

  const distance =
    userDistance ??
    getVector(
      {
        area,
        event,
      },
      radian,
      vOrH,
    );
  const translate = misregistration(
    (t * distance * halfArea) / 2,
    rotate,
    topOrBottomArea,
    !vOrH,
  );
  return {
    distance: distance * fixOffsetDirection,
    translate,
    rotate,
    halfArea,
    x: x * translate.x * fixOffsetDirection,
    y: y * translate.y * fixOffsetDirection,
  };
}

export function toTransform(translate: ReturnType<typeof getRectChange>) {
  const { rotate, x, y } = translate;
  return `rotateZ(${rotate}deg) translateX(${x}px) translateY(${y}px)`;
}

export function mergeTransform(
  translateA: ReturnType<typeof getRectChange>,
  translateB: ReturnType<typeof getRectChange>,
) {
  const { x: ax, y: ay, rotate } = translateA;
  const { x: bx, y: by } = translateB;
  return `rotateZ(${rotate}deg) translateX(${ax + bx}px) translateY(${
    ay + by
  }px)`;
}
