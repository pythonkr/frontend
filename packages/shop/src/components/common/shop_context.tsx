import * as React from 'react';

import ShopContext from '../../contexts';

type ShopContextProps = {
  options: ShopContext.ContextOptions;
  children: React.ReactNode;
}

export const ShopContextProvider: React.FC<ShopContextProps> = (props) => <ShopContext.context.Provider value={props.options}>
  {props.children}
</ShopContext.context.Provider>;
