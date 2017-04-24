import React, { Component } from 'react';
import Square from './Square';
import { Orientation, Mode } from '../Common';

/* Enum for arrow key navigation */
const direction = {
  BACK: 0,
  FORWARD: 1
};

/* Utility functions */
function focusOnSquare(component, square) {
  var squareRef = component.refs[square.toString()];
  var input = squareRef.refs.input;
  input.focus();
}

/* BUG - doesn't handle end of row/column properly */
function navigateHorizontal(x, y, letters, dir, size) {
  let newY = y;
  if (dir === direction.FORWARD && y < size - 1) {
    do {
      newY++;
    } while (newY < size - 2 && letters[x][newY].isBlack)
  } else if (dir === direction.BACK && y > 0) {
    do {
      newY--;
    } while (newY > 1 && letters[x][newY].isBlack)
  }

  if (letters[x][newY].isBlack) {
    //we've hit start or end of row without finding a new square, so just stay put 
    return y;
  } else {
    return newY;
  }
}

function navigateVertical(x, y, letters, dir, size) {
  let newX = x;
  if (dir === direction.FORWARD && x < size - 1) {
    do {
      newX++;
    } while (newX < size - 2 && letters[newX][y].isBlack)
  } else if (dir === direction.BACK && x > 0) {
    do {
      newX--;
    } while (newX > 0 && letters[newX][y].isBlack)
  }


    if (letters[newX][y].isBlack) {
      //we've hit start or end of column without finding a new square, so just stay put
      return x;
    } else {
      return newX;
    }
}

function navigate(orient, direct, currentOrientation, currentSquare, letters, size) {
  let newOrient = orient, newX = currentSquare[0], newY = currentSquare[1];
  if (orient === currentOrientation) {
    if (orient === Orientation.ROW) {
      //newY = navigateInDirection(newY, direct, size);
      newY = navigateHorizontal(newX, newY, letters, direct, size);
    } else {
      //newX = navigateInDirection(newX, direct, size);
      newX = navigateVertical(newX, newY, letters, direct, size);
    }
  } else {
    //don't move cursor, just change oirentation
    newOrient = orient;
  }

  let newSquare = [newX, newY];
  return [newOrient, newSquare];
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "currentSquare" : [0,0],
      "orientation" : Orientation.ROW
    };
  }
  inSelectedWord(x,y) {
    if (this.state.orientation === Orientation.ROW) {
      if (x === this.state.currentSquare[0]) {
        //make sure there are no black squares between currentSquare and this square
        for (var idx = Math.min(y, this.state.currentSquare[1]);
          idx < Math.max(y, this.state.currentSquare[1]); idx++) {
            if (this.props.letters[x][idx].isBlack) {
              return false;
            }
          }

          return true;
      } else {
        return false;
      }
    } else {
      if (y === this.state.currentSquare[1]) {
        //make sure there are no black squares between currentSquare and this square
        for (var idx = Math.min(x, this.state.currentSquare[0]);
          idx < Math.max(x, this.state.currentSquare[0]); idx++) {
            if (this.props.letters[idx][y].isBlack) {
              return false;
            }
          }

          return true;
      } else {
        return false;
      }
    }
  }
  handleKeyDown(key) {
    let newOrientation = this.state.orientation;
    let newSquare = this.state.currentSquare.slice();
    switch (key) {
      case "Backspace":
        [newOrientation, newSquare] = navigate(newOrientation, direction.BACK,
          newOrientation, newSquare, this.props, this.props.letters, this.props.size);
        this.props.handleBackSpace(newSquare[0],newSquare[1]);
        break;
      case "ArrowLeft":
        [newOrientation, newSquare] = navigate(Orientation.ROW, direction.BACK,
          newOrientation, newSquare, this.props.letters, this.props.size);
        this.setState({
          "currentSquare" : newSquare,
          "orientation" : newOrientation
        });
        break;
      case "ArrowUp":
        [newOrientation, newSquare] = navigate(Orientation.COL, direction.BACK,
          newOrientation, newSquare, this.props.letters, this.props.size);
        this.setState({
          "currentSquare" : newSquare,
          "orientation" : newOrientation
        });
        break;
      case "ArrowRight":
      [newOrientation, newSquare] = navigate(Orientation.ROW, direction.FORWARD,
        newOrientation, newSquare, this.props.letters, this.props.size);
        this.setState({
          "currentSquare" : newSquare,
          "orientation" : newOrientation
        });
        break;
      case "ArrowDown":
      [newOrientation, newSquare] = navigate(Orientation.COL, direction.FORWARD,
        newOrientation, newSquare, this.props.letters, this.props.size);
        this.setState({
          "currentSquare" : newSquare,
          "orientation" : newOrientation
        });
        break;
      default:
        //intentional no-op
      }

      if (newSquare[0] < this.props.size && newSquare[1] < this.props.size) {
        focusOnSquare(this, newSquare);
      }
  }
  handleKeyPress(key) {
    if (this.props.mode === Mode.TEXT) {
      let x = this.state.currentSquare[0];
      let y = this.state.currentSquare[1];

      //first update internal state (i.e. selected square)
      let newSquare = navigate(this.state.orientation, direction.FORWARD, this.state.orientation,
        this.state.currentSquare, this.props.letters, this.props.size)[1];

      this.setState({
        "currentSquare" : newSquare,
        "orientation" : this.state.orientation
      });

      //now change focus to new square
      focusOnSquare(this, newSquare);

      //now update Puzzle state
      this.props.handleKeyPress(x,y,key);
    }
  }
  handleFocus(x,y) {
    if (!this.props.letters[x][y].isBlack) {
      this.setState({
        "currentSquare" : [x,y],
        "orientation" : this.state.orientation
      })
    }
  }
  renderSquare(x, y) {
    const isSelected =
      (x===this.state.currentSquare[0]) &&
      (y===this.state.currentSquare[1]);
    const isWordSelected = (!isSelected && this.inSelectedWord(x,y));
    return <Square squareValue={this.props.letters[x][y]}
      isSelected={isSelected}
      isWordSelected={isWordSelected}
      handleKeyPress={(char) => this.handleKeyPress(char)}
      handleKeyDown={(key) => this.handleKeyDown(key)}
      handleFocus={() => this.handleFocus(x,y)}
      handleClick={() => this.props.handleClick(x,y)}
      ref={[x,y].toString()}
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
    return <div className="table-responsive">
      <table className="table">
        <tbody>{rows}</tbody>
      </table>
    </div>;
  }
};

export default Grid;
