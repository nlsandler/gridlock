import React from 'react';
import { Mode } from '../Common';

function Toolbar(props) {
  return <div className="toolbar">
    <button className="btn btn-primary"
            onClick={() => props.clearPuzzle()}>
      <span className="glyphicon glyphicon-repeat" />
    </button>
    <button className="btn btn-primary"
            onClick={() => props.download()}>
      <span className="glyphicon glyphicon-save" />
    </button>
    <div className="btn-group" data-toggle="buttons">
      <label className={props.mode ? "btn btn-primary" : "btn btn-primary active"}>
        <input type="radio"
          id="edit-letters"
          autoComplete="off"
          defaultChecked={!props.mode}
          onClick={() => props.setMode(Mode.TEXT)}/>
        <span className="glyphicon glyphicon-font" />
      </label>
      <label className={props.mode ? "btn btn-primary active" : "btn btn-primary"}>
        <input type="radio"
          id="fill-squares"
          autoComplete="off"
          defaultChecked={props.mode}
          onClick={() => props.setMode(Mode.BLOCK)}/>
        <span className="glyphicon glyphicon-tint" />
      </label>
    </div>
  </div>
};

export default Toolbar;
