import { forwardRef } from 'react';
import type { Refs } from '@src/Wrapper';

interface RotateProps extends PlainNode {
  refs: Refs;
}

const Rotate = forwardRef((props: RotateProps) => {
  console.log('Rotate render');
  return <div>Rotate</div>;
});

export default Rotate;
