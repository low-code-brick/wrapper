import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import Wrapper, { liveLocation } from '../src';
// import { Text } from '@low-code-brick/bricks';

const Test = () => {
  return (
    <div
      style={{
        display: 'inline-block',
      }}
    >
      这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本
    </div>
  );
};

const deg = 250;

const App = () => {
  return (
    <Modal visible title="Wrapper Demo" footer={null} width="95vw">
      <div
        className="app-container"
        style={{
          minHeight: '85vh',
          position: 'relative',
        }}
      >
        <Wrapper
          container=".app-container"
          defaultStyle={{
            width: 300,
            height: 100,
          }}
          plugins={[liveLocation()]}
        >
          <Test />
        </Wrapper>
        <div
          style={{
            width: 300,
            height: 100,
            left: 400,
            top: 300,
            position: 'absolute',
            border: `1px solid green`,
            transform: `rotateZ(${deg}deg)`,
          }}
        />
        <Wrapper
          container=".app-container"
          defaultStyle={{
            width: 300,
            height: 100,
            left: 400,
            top: 300,
            transform: `rotateZ(${deg}deg)`,
          }}
          plugins={[
            liveLocation(({ x, y }) => (
              <>
                自定义文本: {x}, {y}
              </>
            )),
          ]}
        >
          <Test />
        </Wrapper>
      </div>
    </Modal>
  );
};

export default App;
