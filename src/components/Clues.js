import React, { Component } from 'react';
import { Orientation } from '../Common';

function Clue(props) {
    return <li className="clue">
      <div className="input-group">
        <div className="input-group-addon">{props.clue.id}</div>
        <input className="form-control" value={props.clue.text} onChange={(evt) => props.handleChange(evt.target.value)}/>
      </div>
    </li>;
};

class Clues extends Component {
  renderClue(dir, key, clue) {
    return <Clue key={key} clue={clue} handleChange={(value) => this.props.handleChange(clue.id, dir, key, value)}/>
  }
  renderClueArray(orientation, clues) {
    //turn clue number -> clue map into an array
    var arr = [];
    for (var key in clues) {
      var clue = clues[key];
      arr.push(this.renderClue(orientation, key, clue));
    }
    return arr;
  }
  render() {
    var across = this.renderClueArray(Orientation.ROW, this.props.clues.across);
    var down = this.renderClueArray(Orientation.COL, this.props.clues.down);

    return <div className="row">
            <div className="col-md-5" id="across">
              <h3 className="clue-header">Across</h3>
              <ol className="clue-list">
                {across}
              </ol>
            </div>
            <div className="col-md-5" id="down">
              <h3 className="clue-header">Down</h3>
              <ol className="clue-list">
                {down}
              </ol>
            </div>
          </div>;
  }
};

export default Clues;
