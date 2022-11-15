import styles from './style.module.less';

export function toRadian(rotate: number) {
  return (rotate / 180) * Math.PI;
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
) {
  const tagDirection = tagIndex % 2;
  const radian = toRadian(to360(originRotate));
  const methods = [Math.sin, Math.cos];
  const mapping = [1, -1, -1, 1][tagIndex];

  if (tagDirection) {
    methods.reverse();
  }

  const distance =
    (methods[0](radian) * event.deltaX +
      methods[1](radian) * event.deltaY * (tagDirection ? 1 : -1)) *
    -mapping;
  const y = (distance / 2) * Math.sin(radian);
  const x = (distance / 2) * (1 + Math.cos(radian) * mapping);

  // 水平方向
  if (tagDirection === 0) {
    return {
      x: y,
      y: x * mapping,
      height: -distance,
      width: 0,
    };
  }

  // 垂直方向
  return {
    x: -x * mapping,
    y,
    width: distance,
    height: 0,
  };
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
    .reduce(
      (result, cur) => {
        let k: keyof typeof result;
        console.log(cur);
        for (k in result) {
          result[k] += cur[k] ?? 0;
        }
        return result;
      },
      { x: 0, y: 0, height: 0, width: 0 },
    );
}
