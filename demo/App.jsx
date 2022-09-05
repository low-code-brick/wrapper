import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import Wrapper, { liveLocation } from '../src';
import { Text } from '@low-code-brick/bricks';

const Test = () => {
  return (
    <div
      style={{
        height: `100px`,
        maxWidth: `300px`,
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
        }}
      >
        ========================================================================================
        <br />
        ========================================================================================
        <br />
        ========================================================================================
        <Wrapper
          container=".app-container"
          tooltip={{ title: '9090', placement: 'top' }}
          plugins={[liveLocation]}
        >
          <Test />
        </Wrapper>
      </div>
    </Modal>
  );
};

export default App;
