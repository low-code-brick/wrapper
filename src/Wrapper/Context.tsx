import * as React from 'react';
import type { ReactNode } from 'react';

export type WrapperType = {
  container?: ElementLike;
  identify?: string;
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
