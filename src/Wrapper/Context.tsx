import React, { useContext } from 'react';
import type { ReactNode } from 'react';
import type { Tooltip } from '@src/Draggable';

export enum Theme {
  dark = 'dark',
  light = 'light',
}

type MoveVector = {
  x: number;
  y: number;
};

export interface WrapperType {
  container?: ElementLike;
  identify?: string;
  tooltip?: Tooltip | false;
  layout?: {
    default?: React.FC;
    inner?: React.FC;
  };
  dragStart?: (event: Event, pointer: MouseEvent) => void;
  dragMove?: (
    event: Event,
    pointer: MouseEvent,
    moveVector: MoveVector,
  ) => void;
  dragEnd?: (event: Event, pointer: MouseEvent) => void;
  pointerDown?: (event: Event, pointer: MouseEvent) => void;
  pointerMove?: (
    event: Event,
    pointer: MouseEvent,
    moveVector: MoveVector,
  ) => void;
  pointerUp?: (event: Event, pointer: MouseEvent) => void;
}

const WrapperContext = React.createContext<WrapperType>({});

export interface WrapperProviderProps extends WrapperType {
  children?: ReactNode;
}

export const Provider: React.FC<WrapperProviderProps> = (props) => {
  const consume = useContext(WrapperContext);
  const { children } = props;

  return (
    <WrapperContext.Provider value={{ ...consume, ...props }}>
      {children}
    </WrapperContext.Provider>
  );
};

export default WrapperContext;
