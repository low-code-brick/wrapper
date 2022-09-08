import { useContext, useEffect, forwardRef } from 'react';
import WrapperContext from '@src/Wrapper/Context';
import classNames from 'classnames';
import styles from './style.module.less';

const Stretch = forwardRef(() => {
  const consume = useContext(WrapperContext);
  const { identify } = consume;

  useEffect(() => {
    const wrapper = document.querySelector(`.${identify}`);
    if (wrapper == null) return;
    return () => {};
  }, []);

  return (
    <>
      <div className={classNames(styles.line, styles.lineTop)}>
        <div className={classNames(styles.circle, styles.circleTopCenter)} />
      </div>
      <div className={classNames(styles.line, styles.lineRight)}>
        <div className={classNames(styles.circle, styles.circleRightCenter)} />
      </div>
      <div className={classNames(styles.line, styles.lineBottom)}>
        <div className={classNames(styles.circle, styles.circleBottomCenter)} />
      </div>
      <div className={classNames(styles.line, styles.lineLeft)}>
        <div className={classNames(styles.circle, styles.circleLeftCenter)} />
      </div>
      <div className={classNames(styles.circle, styles.circleTopLeft)} />
      <div className={classNames(styles.circle, styles.circleTopRight)} />
      <div className={classNames(styles.circle, styles.circleBottomLeft)} />
      <div className={classNames(styles.circle, styles.circleBottomRight)} />
    </>
  );
});

export default Stretch;
