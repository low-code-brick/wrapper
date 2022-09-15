import {
  forwardRef,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import WrapperContext from '@src/Wrapper/Context';
import { Press, Manager } from 'hammerjs';
import TWEEN from '@tweenjs/tween.js';
import styles from './styles.module.less';
import type { Refs } from '@src/Wrapper';

interface RotateProps extends PlainNode {
  refs: Refs;
}

const groupTween = new TWEEN.Group();

const Rotate = forwardRef((props: RotateProps, ref) => {
  const consume = useContext(WrapperContext);
  const conditionRef = useRef({ rotate: 0 });
  const wrapperRef = useRef<HTMLElement | null>();
  // const []
  const { identify, container } = consume;

  const tween = useMemo(() => {
    return new TWEEN.Tween(conditionRef.current, groupTween)
      .repeat(Infinity)
      .easing(TWEEN.Easing.Linear.None)
      .to({ rotate: 360 }, 1000 * 3)
      .onUpdate((condition) => {
        const wrapper = wrapperRef.current as HTMLElement;
        wrapper.style.transform = `rotateZ(${Math.floor(condition.rotate)}deg)`;
        // wrapper.style.transform = matrix(Math.floor(condition.rotate));
      });
  }, []);

  const animate = useCallback(() => {
    if (tween.isPaused()) return;
    requestAnimationFrame(animate);
    groupTween.update();
  }, []);

  useEffect(() => {
    // 获取容器
    const wrapper = (wrapperRef.current = document.querySelector(
      `.${identify}`,
    ) as HTMLElement);
    if (wrapper == null) return;

    const managers: InstanceType<typeof Manager>[] = [];
    const press = document.querySelector(
      `.${identify} .${styles.rotate}`,
    ) as HTMLElement;
    const mc = new Manager(press);
    managers.push(mc);
    mc.add(new Press());

    // 旋转事件
    mc.on('press', () => {
      // start
      console.log(1);
      tween.isPlaying() ? tween.resume() : tween.start();
      animate();
    });
    // mc.on('pressup', () => {
    //   // end
    //   console.log(2);
    //   tween.pause();
    // });

    const close = () => {
      tween.pause();
    };

    let containerEl: HTMLElement;
    if (container) {
      containerEl =
        typeof container === 'string'
          ? (document.querySelector(container as string) as HTMLElement)
          : container;
    } else {
      containerEl = document.body;
    }
    containerEl.addEventListener('mouseup', close);

    return () => {
      managers.forEach((o) => o.destroy());
      groupTween.remove(tween);
      containerEl.removeEventListener('mouseup', close);
    };
  }, []);

  return (
    <>
      <div className={styles.wallpaper} />
      <div className={styles.rotate}>
        <svg
          className="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="12009"
          width="1em"
          height="1em"
          fill="currentColor"
        >
          <path
            d="M421.12 590.506667L362.666667 648.533333a329.386667 329.386667 0 0 1 23.466666-409.173333 8.533333 8.533333 0 0 0-9.813333-13.226667 310.186667 310.186667 0 0 0-83.2 492.373334L241.92 768a17.066667 17.066667 0 0 0 11.946667 29.013333h179.2a17.066667 17.066667 0 0 0 17.066666-17.066666v-179.2a17.066667 17.066667 0 0 0-29.013333-10.24zM602.88 433.493333L661.333333 375.466667a329.386667 329.386667 0 0 1-21.333333 409.173333 8.533333 8.533333 0 0 0 9.813333 13.226667 310.186667 310.186667 0 0 0 81.066667-492.373334L782.08 256a17.066667 17.066667 0 0 0-11.946667-29.013333h-179.2a17.066667 17.066667 0 0 0-17.066666 17.066666v179.2a17.066667 17.066667 0 0 0 29.013333 10.24z"
            p-id="12010"
          ></path>
        </svg>
      </div>
    </>
  );
});

export default Rotate;
