import React from 'react';
import ReactDOM from 'react-dom';
import Puzzle from './components/Puzzle';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css';

ReactDOM.render(
  <Puzzle size={15}/>,
  document.getElementById('root')
);
