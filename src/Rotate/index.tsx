import { forwardRef } from 'react';

const Rotate = forwardRef(() => {
  console.log('Rotate render');
  return <div>Rotate</div>;
});

export default Rotate;
