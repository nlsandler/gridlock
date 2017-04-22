import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

/*
TODOs:
- make it prettier
- make arrows skip black squares/don't focus on black squares
- make it less laggy!
- download!
- when a word is highlighted in grid, highlight corresponding clue (and vice versa)
- accessibility

- maybe make across/down scrollable?
*/

/* Enum for direction */
var direction = {
  ROW: 0,
  COL: 1
};

/* Enum for edit mode */
var mode = {
  TEXT: 0,
  BLOCK: 1
}

/* Components */
function Toolbar(props) {

  return <div className="toolbar" data-toggle="buttons">
    <label className={props.mode ? "btn btn-primary" : "btn btn-primary active"}>
      <input type="radio"
        id="edit-letters"
        autoComplete="off"
        defaultChecked={!props.mode}
        onClick={() => props.setMode(mode.TEXT)}/>
      <span className="glyphicon glyphicon-font" />
    </label>
    <label className={props.mode ? "btn btn-primary active" : "btn btn-primary"}>
      <input type="radio"
        id="fill-squares"
        autoComplete="off"
        defaultChecked={props.mode}
        onClick={() => props.setMode(mode.BLOCK)}/>
      <span className="glyphicon glyphicon-tint" />
    </label>
  </div>
}

function PuzzleInfo(props) {
    return <div className="puzzle-info">
              <input className="form-control" type="text" aria-label="Title" placeholder="Untitled"
              value={props.title} onChange={(evt) => props.updateTitle(evt.target.value)}/>
              <hr />
              <form className="form form-inline">
                <small>
                  <label>By:</label>
                  <input className="form-control" type="text" aria-label="Author" placeholder="Author"
              value={props.author} onChange={(evt) => props.updateAuthor(evt.target.value)} />
                </small>
              </form>
          </div>;
}

class Square extends Component {
  render() {
    var classes = "text-center";
    if (this.props.squareValue.isBlack) {
      classes += " black";
    }

    if (this.props.isSelected) {
      classes += " highlight";
    } else if (this.props.isWordSelected) {
      classes += " weak-highlight";
    }

    return (
      <td className="square">
        <div className="content">
          <span className="clueNum"><sup>{this.props.squareValue.clueNum}</sup></span>
          <input className={classes}
            ref="input"
            value={this.props.squareValue.char}
            onKeyPress={(evt) => this.props.handleKeyPress(evt.key)}
            onKeyDown={(evt) => this.props.handleKeyDown(evt.key)}
            onFocus={() => this.props.handleFocus()}
            onClick={() => this.props.handleClick()}/>
        </div>
      </td>
    );
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "currentSquare" : [0,0],
      "direction" : direction.ROW
    };
  }
  inSelectedWord(x,y) {
    if (this.state.direction === direction.ROW) {
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
    let newDirection = this.state.direction;
    let newSquare = this.state.currentSquare.slice();
    switch (key) {
      case "Backspace":
        let x = newSquare[0];
        let y = newSquare[1];
        let letter = this.props.letters[x][y];
        if (!letter.char) {
          if (this.state.direction === direction.ROW){
            //TODO refactor!
            if (newSquare[1] > 0) {
              newSquare[1]--;
            }
          } else {
            if (newSquare[0] > 0) {
              newSquare[0]--;
            }
          }
        }
        this.props.handleBackSpace(newSquare[0],newSquare[1]);
        break;
      case "ArrowLeft":
        if (this.state.direction === direction.ROW) {
          if (newSquare[1] > 0) {
            newSquare[1]--;
          }
        } else {
          newDirection = direction.ROW;
        }
        this.setState({
          "currentSquare" : newSquare,
          "direction" : newDirection
        });
        break;
      case "ArrowUp":
        if (this.state.direction === direction.COL) {
          if (newSquare[0] > 0) {
            newSquare[0]--;
          }
        } else {
          newDirection = direction.COL;
        }
        this.setState({
          "currentSquare" : newSquare,
          "direction" : newDirection
        });
        break;
      case "ArrowRight":
        if (this.state.direction === direction.ROW) {
          if (newSquare[1] < this.props.size - 1) {
            newSquare[1]++;
          }
        } else {
          newDirection = direction.ROW;
        }
        this.setState({
          "currentSquare" : newSquare,
          "direction" : newDirection
        });
        break;
      case "ArrowDown":
        if (this.state.direction === direction.COL) {
          if (newSquare[0] < this.props.size - 1) {
            newSquare[0]++;
          }
        } else {
          newDirection = direction.COL;
        }
        this.setState({
          "currentSquare" : newSquare,
          "direction" : newDirection
        });
        break;
      default:
        //intentional no-op
      }

      //TODO: refactor (same code is in arrow key handler)
      if (newSquare[0] < this.props.size && newSquare[1] < this.props.size) {
        var newSquareRef = this.refs[newSquare.toString()];
        var input = newSquareRef.refs.input;
        input.focus();
      }
  }
  handleKeyPress(key) {
    if (this.props.mode === mode.TEXT) {
      //first update internal state (i.e. selected square)
      var x = this.state.currentSquare[0];
      var y = this.state.currentSquare[1];
      var x2 = x;
      var y2 = y;
      do {
        if (this.state.direction === direction.ROW && y2 < this.props.size - 1) {
           y2++;
         } else if (this.state.direction === direction.COL && x2 < this.props.size - 1){
           x2++;
        }
      } while (x2 < this.props.size - 2 && y2 < this.props.size - 2 && this.props.letters[x2][y2].isBlack);

      this.setState({
        "currentSquare" : [x2,y2],
        "direction" : this.state.direction
      });

      //now change focus to new square
      var newSquare = this.refs[[x2,y2].toString()];
      var input = newSquare.refs.input;
      input.focus();

      //now update Puzzle state
      this.props.handleKeyPress(x,y,key);
    }
  }
  handleFocus(x,y) {
    if (!this.props.letters[x][y].isBlack) {
      this.setState({
        "currentSquare" : [x,y],
        "direction" : this.state.direction
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
}

class Clue extends Component {
  render() {
    return <li className="clue">
      <div className="input-group">
      <div className="input-group-addon">{this.props.clue.id}</div>
      <input className="form-control" value={this.props.clue.text} onChange={(evt) => this.props.handleChange(evt.target.value)}/>
      </div>
    </li>
  }
}

class Clues extends Component {
  renderClue(dir, key, clue) {
    return <Clue key={key} clue={clue} handleChange={(value) => this.props.handleChange(clue.id, dir, key, value)}/>
  }
  render() {
    var across = [];
    const acrossClues = this.props.clues.across;
    for (var key in acrossClues) {
      var clue = acrossClues[key];
      across.push(this.renderClue(direction.ROW, key, clue));
    }
    var down = [];
    const downClues = this.props.clues.down;
    for (var key in downClues) {
      var clue = downClues[key];
      down.push(this.renderClue(direction.COL, key, clue));
    }


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
}

class Puzzle extends Component {
  constructor(props) {
    super(props);
    //initialize array of letters
    let letters = Array(this.props.size).fill().map(() => Array(this.props.size).fill(l("")));
    let clues = {
      "across" : {},
      "down" : {}
    };
    //initialize clue numbers
    let [numberedLetters, numberedClues] = generateClueNumbers(this.props.size, letters, clues);
    this.state = {
      "title" : "",
      "author" : "",
      "letters" : numberedLetters,
      "clues" : numberedClues,
      "mode" : mode.TEXT
    }
  }
  updateLetters(letters) {
    var [numberedLetters, numberedClues] = generateClueNumbers(this.props.size, letters, this.state.clues);
    this.setState({
      title: this.state.title,
      author: this.state.author,
      letters: numberedLetters,
      clues: numberedClues,
      mode: this.state.mode
    });
  }
  handleKeyPress(x, y, c) {
    const letter = c.toUpperCase();
    const letters = this.state.letters.slice();
    if (this.state.mode === mode.TEXT) {
      letters[x][y] = { "char" : letter, "isBlack" : false };
      this.updateLetters(letters);
    }
  }
  handleClick(x, y) {
    const letters = this.state.letters.slice();

    if (this.state.mode === mode.BLOCK) {
      //fill in specified square
      letters[x][y] = {"char" : "", "isBlack": !(letters[x][y].isBlack)};
      //enforce diagonal symmetry - fill in symmetrical square too!
      const xprime = this.props.size - x - 1;
      const yprime = this.props.size - y - 1;
      letters[xprime][yprime] = {"char":"", "isBlack" : !(letters[xprime][yprime].isBlack)};
      this.updateLetters(letters);
    }
  }
  handleBackSpace(x, y) {
    const letters = this.state.letters.slice();
    let letter = letters[x][y];
    letter.char = "";
    this.updateLetters(letters);
  }
  setMode(mode) {
    if (mode !== this.state.mode) {
      this.setState({
        size: this.state.size,
        title: this.state.title,
        author: this.state.author,
        letters: this.state.letters,
        clues: this.state.clues,
        mode: mode,
      });
    }
  }
  handleClueChange(num,dir,key,value) {
    let cluesAcross = this.state.clues.across;
    let cluesDown = this.state.clues.down;
    if (dir === direction.ROW) {
      cluesAcross[key] = {
        "id" : num,
        "text": value
      };
    } else {
      cluesDown[key] = {"text":value};
    }

    this.setState({
      size: this.state.size,
      title: this.state.title,
      author: this.state.author,
      letters: this.state.letters,
      clues: {
        "across" : cluesAcross,
        "down" : cluesDown
      },
      mode: this.state.mode,
    });
  }
  updateAuthor(value) {
    this.setState({
      size: this.state.size,
      title: this.state.title,
      author: value,
      letters: this.state.letters,
      clues: this.state.clues,
      mode: this.state.mode,
    });
  }
  updateTitle(value) {
    this.setState({
      size: this.state.size,
      title: value,
      author: this.state.author,
      letters: this.state.letters,
      clues: this.state.clues,
      mode: this.state.mode,
    });
  }
  render() {
    return <div>
            <div className="container-fluid">
              <div className="row puzzle">
                <div className="col-md-1">
                  <Toolbar mode={this.state.mode} setMode={this.setMode.bind(this)} />
                </div>
                <div className="col-md-5">
                    <PuzzleInfo title={this.state.title} author={this.state.author}
                    updateAuthor={(value) => this.updateAuthor(value)}
                    updateTitle={(value) => this.updateTitle(value)}/>
                    <Grid size={this.props.size} mode={this.state.mode}
                      letters={this.state.letters}
                      handleKeyPress={(x,y,c) => this.handleKeyPress(x,y,c)}
                      handleBackSpace={(x,y) => this.handleBackSpace(x,y)}
                      handleClick={(x,y) => this.handleClick(x,y)}/>
                </div>
                <div className="col-md-6">
                  <Clues clues={this.state.clues} handleChange={(num, dir, key, value) => this.handleClueChange(num, dir, key, value)}/>
                </div>
              </div>
            </div>
          </div>;
    }
  }

function l(c) {
  return {
    "isBlack" : false,
    "char" : c
  }
}

function needsAcrossClue(letters, x, y) {
  if (letters[x][y].isBlack) {
    return false;
  }
  if (y === 0) {
    return true;
  }

  if (letters[x][y-1].isBlack) {
      return true;
    }
    return false;
}

function needsDownClue(letters, x, y) {
  if (letters[x][y].isBlack) {
    return false;
  }

  if (x === 0) {
    return true;
  }

  if (letters[x-1][y].isBlack) {
      return true;
    }
    return false;
}

function generateClueNumbers(size, origLetters, origClues) {
  //add clue numbers to letters in grid and to clues in map
  let letters = origLetters.slice();
  let clues = {
    "across" : {},
    "down" : {}
  }
  var currentClueNum = 1;

  for (var x = 0; x < size; x++) {
    for (var y = 0; y < size; y++) {
      let clueKey = [x,y].toString();

      let needsAcross = needsAcrossClue(letters, x, y);

      if (needsAcross) {
        let acrossClue = origClues.across[clueKey];
        if (!acrossClue) {
          acrossClue = { "text" : "" };
        }
        acrossClue.id = currentClueNum;
        clues.across[clueKey] = acrossClue;
      }

      let needsDown = needsDownClue(letters, x, y);

      if (needsDown) {
        let downClue = origClues.down[clueKey];
        if (!downClue) {
          downClue = {"text":""};
        }
        downClue.id = currentClueNum;
        clues.down[clueKey] = downClue;
      }

      let gridNum = null;
      if (needsAcross || needsDown) {
        gridNum = currentClueNum;
        currentClueNum++;
      }

      letters[x][y] = {
        "char": letters[x][y].char,
        "isBlack" : letters[x][y].isBlack,
        "clueNum": gridNum
      };
    }
  }

  return [letters, clues];
}

export default Puzzle;
