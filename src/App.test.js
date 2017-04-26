import React from 'react';
import ReactDOM from 'react-dom';
import Puzzle from './components/Puzzle';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Puzzle />, div);
});
