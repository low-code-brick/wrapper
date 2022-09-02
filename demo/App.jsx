import { useState, useEffect, useCallback } from 'react';
import { Modal } from 'antd';
import Wrapper from '../src';
import { Text } from '@low-code-brick/bricks';

const App = () => {
  return (
    <Modal visible title="Wrapper Demo" footer={null} width="1100px">
      <div
        className="app-container"
        style={{
          minHeight: '60vh',
        }}
      >
        <Wrapper container=".app-container">
          <Text>这是一个文本</Text>
        </Wrapper>
      </div>
    </Modal>
  );
};

export default App;
