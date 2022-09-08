import React, { useContext } from 'react';
import type { ReactNode } from 'react';

type PopperType = {
  visible: boolean;
};

const PopperContext = React.createContext<PopperType>({
  visible: false,
});

export interface PopperProviderProps extends PopperType {
  children?: ReactNode;
}

export const Provider: React.FC<PopperProviderProps> = (props) => {
  const originVisible = useContext(PopperContext);
  const { children, visible } = props;

  return (
    <PopperContext.Provider value={originVisible || visible}>
      {children}
    </PopperContext.Provider>
  );
};

export default PopperContext;
