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
  console.log('--2', horizontal, area.x * area.y);

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
    // userDistance ??
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
  debugger;
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
  return `rotateZ(${rotate}deg) translateX(${ax + bx}px) translateY(${ay + by
    }px)`;
}

export function to360(rotate: number) {
  return ((rotate % 360) + 360) % 360;
}

// 获取角度大致方向. 上: 0, 右: 1, 下: 2, 左: 3
export function rotateDirection(rotate: number) {
  return Math.floor(((to360(rotate) / 45 + 1) % 8) / 2);
}

// 根据象限获取相近的移动距离. 上下(取Y): 1, 左右(取X): 0
export function nearDistance(rotate: number) {
  return rotateDirection(rotate) % 2;
}

export function rectVectorTransfrom(
  originRotate: number,
  event: HammerInput,
  /**
   * 触发元素所处的位置
   * 上有下左: 0123.
   */
  tagIndex: number,
  userDeltaDistance?: number,
) {
  const tagDirection = tagIndex % 2;
  const rotate = to360(originRotate);
  const direction = rotateDirection(rotate);
  const point = [event.deltaX, event.deltaY];
  const deltaDistance = userDeltaDistance ?? point[direction % 2 ? tagDirection : +!tagDirection];
  const nd = nearDistance(rotate);
  const mapping =
    ([0, 1].includes(tagIndex) ? 1 : -1) * (tagDirection ? -1 : 1);
  const distanceDirection = (tagDirection ? [3] : [0, 2, 3]).includes(direction)
    ? mapping
    : -mapping;
  // console.log(tagIndex, direction % 2 ? tagDirection : +!tagDirection);
  const distance =
    (deltaDistance /
      (nd === 1
        ? 1 - Math.cos(toRadian(rotate))
        : Math.cos(toRadian(rotate)))) *
    distanceDirection;
  const y = (distance / 2) * Math.sin(toRadian(rotate));
  const x = (distance / 2) * (1 + Math.cos(toRadian(rotate)) * mapping);

  if (tagDirection === 0) {
    return {
      x: y,
      y: x * mapping,
      height: -distance,
      width: 0,
    };
  }
  return {
    x: -x * mapping,
    y,
    width: distance,
    height: 0,
  }
}

export function rectVectorWithTags(
  rotate: number,
  event: HammerInput,
  tagIndexs: number | number[],
) {
  if (typeof tagIndexs === 'number') {
    return rectVectorTransfrom(rotate, event, tagIndexs);
  }

  return tagIndexs
    .map((tagIndex) => rectVectorTransfrom(rotate, event, tagIndex))
    .reduce((result, cur) => {
      let k: keyof typeof result;
      console.log(cur);
      for (k in result) {
        result[k] += cur[k] ?? 0;
      }
      return result;
    }, { x: 0, y: 0, height: 0, width: 0 })
}
