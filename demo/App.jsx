import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import Wrapper, { liveLocation } from '../src';
// import { Text } from '@low-code-brick/bricks';

const Test = () => {
  return (
    <div
      style={{
        // height: `100px`,
        // maxWidth: `300px`,
        display: 'inline-block',
      }}
    >
      这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本这是一个文本
    </div>
  );
};

const App = () => {
  return (
    <Modal visible title="Wrapper Demo" footer={null} width="1100px">
      <div
        className="app-container"
        style={{
          minHeight: '60vh',
          position: 'relative',
        }}
      >
        ========================================================================================
        <br />
        ========================================================================================
        <br />
        ========================================================================================
        <Wrapper
          container=".app-container"
          tooltip={{ title: '9090' }}
          defaultStyle={{
            width: 300,
            height: 100,
          }}
          plugins={[
            liveLocation(),
            // liveLocation(({ x, y }) => (
            //   <>
            //     自定义文本: {x}, {y}
            //   </>
            // )),
          ]}
        >
          <Test />
        </Wrapper>
      </div>
    </Modal>
  );
};

export default App;
