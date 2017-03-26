import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

/*
TODOs:
- when a square is filled, jump to next one automatically
- fix arrow navigation - skip black squares
- fix focus - if a square isn't in focus, it shouldn't be highlighted
- error checking (connectedness, word length, etc)
- clues!
*/

/* Enum for direction */
var direction = {
  ROW: 0,
  COL: 1
};

/* State of one square */
class SquareValue {
  constructor(isBlack, char) {
    this.isBlack = isBlack;
    this.char = char;
  }

  getIsBlack() {
    return this.isBlack;
  }

  getChar() {
    if (this.isBlack) {
      return "";
    } else {
      return this.char;
    }
  }
}

/* Components */

class Square extends Component {
  componentDidMount() {
    if (this.props.isSelected) {
      this.refs.squareInput.focus();
    }
  }
  componentDidUpdate() {
    if (this.props.isSelected) {
      this.refs.squareInput.focus();
    }
  }
  render() {
    var classes = "text-center";
    if (this.props.squareValue.getIsBlack()) {
      classes += " black";
    }

    if (this.props.isSelected) {
      classes += " highlight";
    } else if (this.props.isLineSelected) {
      classes += " weak-highlight"
    }

    return (
      <td className="square">
        <input className={classes}
          value={this.props.squareValue.getChar()}
          disabled={this.props.squareValue.getIsBlack()}
          ref="squareInput"
          onChange={(evt) => this.props.handleKeyPress(evt.target.value)}
          onKeyDown={(evt) => this.props.handleKeyDown(evt.keyCode)}
          onClick={() => this.props.handleClick()}/>
      </td>
    );
  }
}

class Grid extends Component {
  renderSquare(x, y) {
    const isSelected =
      (x===this.props.selectedSquare[0]) &&
      (y===this.props.selectedSquare[1]);

    let isLineSelected = false;

    if ((this.props.direction === direction.ROW
      && x===this.props.selectedSquare[0]) ||
      (this.props.direction === direction.COL
      && y===this.props.selectedSquare[1])) {
        isLineSelected = true;
    }

    return <Square squareValue={this.props.letters[x][y]}
      handleKeyPress={(c) => this.props.handleKeyPress(x,y,c)}
      handleClick={() => this.props.handleClick(x,y)}
      handleKeyDown={(keyCode) => this.props.handleKeyDown(keyCode)}
      isSelected={isSelected}
      isLineSelected={isLineSelected}
      key={[x,y]}/>;
  }
  renderRow(x) {
    //TODO - use list comprehension?
    const squares = [];
    for (var y = 0; y < this.props.size; y++) {
      squares.push(this.renderSquare(x,y));
    }
    return <tr key={x}>{squares}</tr>;
  }
  render() {
    //TODO - use list comprehension?
    const rows = [];
    for (var i = 0; i < this.props.size; i++) {
      rows.push(this.renderRow(i));
    }
    return <table className="table"><tbody>{rows}</tbody></table>;
  }
}

class Puzzle extends Component {
  constructor() {
    super();
    const size = 15; //TODO: prompt user for size on start
    this.state = {
      size : size, //15x15 square by default
      letters: Array(size).fill().map(() => Array(size).fill(new SquareValue(false, ""))), //2D array
      clues : Array(2).fill(null), //how to figure out how many clues???
      shadeMode: false, //in shade mode, player adds letters - otherwise toggle black/white squares
      selectedSquare: [null, null],
      direction: direction.ROW
    }
  }
  updateLetters(letters) {
    this.setState({
      size: this.state.size,
      letters: letters,
      clues: this.state.clues,
      shadeMode: this.state.shadeMode,
      selectedSquare: this.state.selectedSquare,
      direction: this.state.direction
    });
  }
  updateSelectedSquare(x,y) {
    this.setState({
      size: this.state.size,
      letters: this.state.letters,
      clues: this.state.clues,
      shadeMode: this.state.shadeMode,
      selectedSquare: [x,y],
      direction: this.state.direction
    });
  }
  handleKeyPress(x, y, c) {
    const letter = c.substring(0,1).toUpperCase();
    const letters = this.state.letters.slice();
    if (!this.state.shadeMode) {
      letters[x][y] = new SquareValue(false, letter);
    }
    this.updateLetters(letters);
  }
  handleClick(x, y) {
    const letters = this.state.letters.slice();
    //look up whether it's black
    const currentlyBlack = letters[x][y].getIsBlack();

    if (this.state.shadeMode) {
      //fill in specified square
      letters[x][y] = new SquareValue(!currentlyBlack, "");
      //enforce diagonal symmetry - fill in symmetrical square too!
      letters[this.state.size - x - 1][this.state.size - y - 1] = new SquareValue(!currentlyBlack, "");
      this.updateLetters(letters);
    } else if (!currentlyBlack){
      //make this the selected square
      this.updateSelectedSquare(x,y);
    }
    //if we're not in shadeMode, and the selected square is already black, don't select it
  }
  handleKeyDown(keyCode) {
    /* Navigate and change typing direction based on arrow keys */
    //TODO refactor this mess
    let newDirection = this.state.direction;
    let newSquare = this.state.selectedSquare.slice();
    switch (keyCode) {
      case 37:
        //left arrow
        if (this.state.direction === direction.ROW) {
          if (newSquare[1] > 0) {
            newSquare[1]--;
          }
        } else {
          newDirection = direction.ROW;
        }
        break;
      case 38:
        //up arrow
        if (this.state.direction === direction.COL) {
          if (newSquare[0] > 0) {
            newSquare[0]--;
          }
        } else {
          newDirection = direction.COL;
        }
        break;
      case 39:
        //right arrow
        if (this.state.direction === direction.ROW) {
          if (newSquare[1] < this.state.size - 1) {
            newSquare[1]++;
          }
        } else {
          newDirection = direction.ROW;
        }
        break;
      case 40:
        //down arrow
        if (this.state.direction === direction.COL) {
          if (newSquare[0] < this.state.size - 1) {
            newSquare[0]++;
          }
        } else {
          newDirection = direction.COL;
        }
        break;
      default:
        //do nothing
        break;
    }
    this.setState({
      size: this.state.size,
      letters: this.state.letters,
      clues: this.state.clues,
      shadeMode: this.state.shadeMode,
      selectedSquare: newSquare,
      direction: newDirection
    });
  }
  toggleShadeMode() {
    this.setState({
      size: this.state.size,
      letters: this.state.letters,
      clues: this.state.clues,
      shadeMode: !this.state.shadeMode,
      selectedSquare: this.state.selectedSquare,
      direction: this.state.direction
    })
  }
  setShadeMode(mode) {
    if (mode !== this.state.shadeMode) {
      this.setState({
        size: this.state.size,
        letters: this.state.letters,
        clues: this.state.clues,
        shadeMode: mode,
        selectedSquare: this.state.selectedSquare,
        direction: this.state.direction
      })
    }
  }
  render() {
    //TODO: radio buttons instead of button for shading toggle
    return <div className="row">
            <div className="col-md-3">
              <div className="btn-group" data-toggle="buttons">
                <label className={this.state.shadeMode ? "btn btn-primary" : "btn btn-primary active"}>
                  <input type="radio"
                    id="edit-letters"
                    autocomplete="off"
                    checked={!this.state.shadeMode}
                    onClick={() => this.setShadeMode(false)}/>
                  Edit Letters
                </label>
                <label className={this.state.shadeMode ? "btn btn-primary active" : "btn btn-primary"}>
                  <input type="radio"
                    id="fill-squares"
                    autocomplete="off"
                    checked={this.state.shadeMode}
                    onClick={() => this.setShadeMode(true)}/>
                  Square Fill
                </label>
              </div>
            </div>
            <div className="col-md-9">
              <Grid size={this.state.size} letters={this.state.letters}
                handleKeyPress={(x,y,c) => this.handleKeyPress(x,y,c)}
                handleClick={(x,y) => this.handleClick(x,y)}
                selectedSquare={this.state.selectedSquare}
                direction={this.state.direction}
                handleKeyDown={(keyCode) => this.handleKeyDown(keyCode)}/>
            </div>
          </div>;
  }
}

export default Puzzle;
