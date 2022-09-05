import * as React from 'react';
import type { ReactNode } from 'react';
import type { Tooltip } from '@src/Draggable';

export enum Theme {
  dark = 'dark',
  light = 'light',
}

export type WrapperType = {
  container?: ElementLike;
  identify?: string;
  tooltip?: Tooltip | false;
};

const WrapperContext = React.createContext<WrapperType>({});

export interface WrapperProviderProps extends WrapperType {
  children?: ReactNode;
}

export const Provider: React.FC<WrapperProviderProps> = (props) => {
  const { children } = props;

  return (
    <WrapperContext.Provider value={props}>{children}</WrapperContext.Provider>
  );
};

export default WrapperContext;
