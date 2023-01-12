import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Maze  from './Maze';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <div>
          <Route path="/" exact component={Maze} />
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;