import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

/*
TODOs:
- find another way to manage focus in the grid
- fix entering last letter in row/column
- make arrow navigation skip over black squares
- hide cursor
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

function Navbar(props) {
  return <nav className="navbar navbar-inverse navbar-static-top">
           <a className="navbar-brand" href="#">Gridlock</a>
           <div id="navbar" className="collapse navbar-collapse"></div>
         </nav>;
}

function Toolbar(props) {
  return <div className="row toolbar">
          <div className="col-md-9">
            <div className="btn-group" data-toggle="buttons">
              <label className={props.mode ? "btn btn-primary" : "btn btn-primary active"}>
                <input type="radio"
                  id="edit-letters"
                  autoComplete="off"
                  defaultChecked={!props.mode}
                  onClick={() => props.setMode(mode.TEXT)}/>
                Edit Letters
              </label>
              <label className={props.mode ? "btn btn-primary active" : "btn btn-primary"}>
                <input type="radio"
                  id="fill-squares"
                  autoComplete="off"
                  defaultChecked={props.mode}
                  onClick={() => props.setMode(mode.BLOCK)}/>
                Square Fill
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary">Download</button>
          </div>
        </div>;
}

function PuzzleInfo(props) {
    return <div>
      <h1>{props.title} <small>{props.author}</small></h1>
    </div>;
}

class Square extends Component {
  /*
  componentDidMount() {
    if (this.props.isSelected) {
      this.refs.square.focus();
    }
  }

  componentDidUpdate() {
    if (this.props.isSelected) {
      this.refs.square.focus();
    }
  }
  */
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
        <span className="clueNum"><sup>{this.props.squareValue.clueNum}</sup></span>
        <input className={classes}
          ref="input"
          value={this.props.squareValue.char}
          onKeyPress={(evt) => this.props.handleKeyPress(evt.key)}
          onKeyUp={(evt) => this.props.handleKeyUp(evt.key)}
          onFocus={() => this.props.handleFocus()}
          onClick={() => this.props.handleClick()}
          disabled={this.props.squareValue.isBlack}/>
      </td>
    );
  }
}

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "currentSquare" : [0,1],
      "direction" : direction.COL
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
  handleKeyUp(key) {
    let newDirection = this.state.direction;
    let newSquare = this.state.currentSquare.slice();
    switch (key) {
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
      }

      var newSquareRef = this.refs[newSquare.toString()];
      console.log(newSquareRef);
      var input = newSquareRef.refs.input;
      console.log(input);
      input.focus();

  }
  handleKeyPress(key) {
    if (this.props.mode === mode.TEXT) {
      //first update internal state (i.e. selected square)
      var x = this.state.currentSquare[0];
      var y = this.state.currentSquare[1];
      var x2 = x;
      var y2 = y;
      do {
        if (this.state.direction === direction.ROW) {
           y2++;
         } else {
           x2++;
        }
      } while (this.props.letters[x2][y2].isBlack);

      this.setState({
        "currentSquare" : [x2,y2],
        "direction" : this.state.direction
      });

      //now change focus to new square
      var newSquare = this.refs[[x2,y2].toString()];
      console.log(newSquare);
      var input = newSquare.refs.input;
      console.log(input);
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
      handleKeyUp={(key) => this.handleKeyUp(key)}
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
    return <table className="table">
        <tbody>{rows}</tbody>
      </table>;
  }
}

class Clue extends Component {
  render() {
    return <li className="clue-list">
      {this.props.clue.id + ". " }
      <input value={this.props.clue.text} onChange={(evt) => this.props.handleChange(evt.target.value)}/>
    </li>
  }
}

class Clues extends Component {
  renderClue(dir, key, clue) {
    return <Clue key={key} clue={clue} handleChange={(value) => this.props.handleChange(dir, key, value)}/>
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
            <div className="col-md-6" id="across">
              <h3>Across</h3>
              <ol>
                {across}
              </ol>
            </div>
            <div className="col-md-6" id="down">
              <h3>Down</h3>
              <ol>
                {down}
              </ol>
            </div>
          </div>;
  }
}

class Puzzle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "title" : "Monday Mini",
      "author" : "Joel Fagliano",
      "letters" : [
        [l("T"), l("V"), l("S"), b(), l("T")],
        [l("H"), l("E"), l("L"), l("L"), l("O")],
        [l("R"), l("E"), l("E"), l("L"), l("S")],
        [l("E"), b(), l("E"), l("E"), l("S")],
        [l("E"), l("S"), l("P"), l("N"), b()]
      ],
      "clues" : {
        "across" : {
          "0,0" : {"text" : "foo"}
        },
        "down" : {}
      },
      "mode" : mode.TEXT
    }
  }
  updateLetters(letters) {
    this.setState({
      title: this.state.title,
      author: this.state.author,
      letters: letters,
      clues: this.state.clues,
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
    //look up whether it's black
    const currentlyBlack = letters[x][y].isBlack;

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
  setMode(mode) {
    if (mode !== this.state.mode) {
      this.setState({
        size: this.state.size,
        title: this.state.title,
        author: this.state.author,
        letters: this.state.letters,
        clues: this.state.clues,
        mode: mode,
      })
    }
  }
  handleClueChange(dir, key,value) {
    let cluesAcross = this.state.clues.across;
    let cluesDown = this.state.clues.down;
    if (dir === direction.ROW) {
      cluesAcross[key] = {"text":value};
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
  render() {
    var [letters, clues] = generateClueNumbers(this.props.size,
      this.state.letters, this.state.clues);
    return <div>
            <Navbar />
            <div className="container-fluid">
              <Toolbar mode={this.state.mode} setMode={this.setMode.bind(this)} />
              <div className="row puzzle">
                <div className="col-md-12">
                  <PuzzleInfo title={this.state.title} author={this.state.author}/>
                </div>
              </div>
              <div className="row puzzle">
                <div className="col-md-7">
                    <Grid size={this.props.size} mode={this.state.mode}
                      letters={letters}
                      handleKeyPress={(x,y,c) => this.handleKeyPress(x,y,c)}
                      handleClick={(x,y) => this.handleClick(x,y)}/>
                </div>
                <div className="col-md-5">
                  <Clues clues={clues} handleChange={(dir, key, value) => this.handleClueChange(dir, key, value)}/>
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

function b() {
  return {
    "isBlack" : true,
    "char" : ""
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

function generateClueNumbers(size, letters, clues) {
  //add clue numbers to letters in grid and to clues in map

  var currentClueNum = 1;

  for (var x = 0; x < size; x++) {
    for (var y = 0; y < size; y++) {
      var clueKey = [x,y].toString();

      var needsAcross = needsAcrossClue(letters, x, y);
      if (needsAcross) {
        var clue = clues.across[clueKey];
        if (!clue) {
          clue = {"text":""};
        }
        clue.id = currentClueNum;
        clues.across[clueKey] = clue;
      }

      var needsDown = needsDownClue(letters, x, y);
      if (needsDown) {
        var clue = clues.down[clueKey];
        if (!clue) {
          clue = {"text":""};
        }
        clue.id = currentClueNum;
        clues.down[clueKey] = clue;
      }

      if (needsAcross || needsDown) {
        letters[x][y].clueNum = currentClueNum;
        currentClueNum++;
      }
    }
  }

  return [letters, clues];
}

export default Puzzle;
