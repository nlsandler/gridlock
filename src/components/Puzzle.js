import React, { Component } from 'react';
import Grid from './Grid';
import Clues from './Clues';
import Toolbar from './Toolbar';
import PuzzleInfo from './PuzzleInfo';
import { Orientation, Mode } from '../Common';
import Download from '../Download';
import { Modal } from 'react-bootstrap';
//import logo from './logo.svg';
import '../App.css';

/* Helpers for clue numbers */
function needsAcrossClue(x, y, letters) {
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

function needsDownClue(x, y, letters) {
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


function generateClueNumbers(letters, numberlessClues, size) {
  //add clue numbers to letters in grid and to clues in map
  let clues = {
    "across" : {},
    "down" : {}
  }
  var currentClueNum = 1;

  for (var x = 0; x < size; x++) {
    for (var y = 0; y < size; y++) {
      let clueKey = [x,y].toString();

      let needsAcross = needsAcrossClue(x, y, letters);

      if (needsAcross) {
        let acrossClue = numberlessClues.across[clueKey];
        if (!acrossClue) {
          acrossClue = { "text" : "" };
        }
        acrossClue.id = currentClueNum;
        clues.across[clueKey] = acrossClue;
      }

      let needsDown = needsDownClue(x, y, letters);

      if (needsDown) {
        let downClue = numberlessClues.down[clueKey];
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

function initializeStateForSize(size) {
  let letters = Array(size).fill().map(() => Array(size).fill({
    "isBlack" : false,
    "char" : ""
  }));
  let clues = {
    "across" : {},
    "down" : {}
  };
  let [numberedLetters, numberedClues] = generateClueNumbers(letters, clues, size);
  return {
    "title" : "",
    "author" : "",
    "newPuzzle": false,
    "size": size,
    "letters" : numberedLetters,
    "clues" : numberedClues,
    "mode" : Mode.TEXT
  }
}

class Puzzle extends Component {
  constructor(props) {
    super(props);
    //load puzzle from localStorage if we have it
    const puzzleState = localStorage.getItem('puzzle');
    if (puzzleState) {
      this.state = JSON.parse(puzzleState);
    } else {
      this.state = {
        newPuzzle: true
      }
    }
  }
  componentDidUpdate(prevProps, prevState) {
    localStorage.setItem('puzzle', JSON.stringify(this.state));
  }
  updateLetters(letters) {
    var [numberedLetters, numberedClues] = generateClueNumbers(
      this.state.letters, this.state.clues, this.props.size);
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
    if (this.state.mode === Mode.TEXT) {
      letters[x][y] = { "char" : letter, "isBlack" : false };
      this.updateLetters(letters);
    }
  }
  handleClick(x, y) {
    const letters = this.state.letters.slice();

    if (this.state.mode === Mode.BLOCK) {
      //fill in specified square
      letters[x][y] = {"char" : "", "isBlack": !(letters[x][y].isBlack)};
      //enforce diagonal symmetry - fill in symmetrical square too!
      const xprime = this.props.size - x - 1;
      const yprime = this.props.size - y - 1;
      //if square is in the exact center of the grid
      //symmetrical square will be the same square, so don't change it
      if (!(x === xprime && y === yprime )) {
        letters[xprime][yprime] = {"char":"", "isBlack" : !(letters[xprime][yprime].isBlack)};
      }
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
  handleClueChange(num,ori,key,value) {
    let cluesAcross = this.state.clues.across;
    let cluesDown = this.state.clues.down;
    if (ori === Orientation.ROW) {
      cluesAcross[key] = {
        "id" : num,
        "text": value
      };
    } else {
      cluesDown[key] = {
        "id": num,
        "text":value
      };
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
  download() {
    //download the puzzle as an acrosslite file
    Download(this.state.title, this.state.author, this.state.letters, this.state.clues);
  }
  clearPuzzle() {
    this.setState({
      "newPuzzle": true
    });
  }
  render() {
    if (this.state.newPuzzle) {
      return <Modal show={this.state.newPuzzle}>
              <Modal.Header>New Puzzle</Modal.Header>
              <Modal.Body>
                Choose the dimensions for your puzzle.
                <input type="number"
                  id="puzzle-dimension"
                  min={"9"}
                  max={"100"}
                  defaultValue={"15"}>
                </input>
              </Modal.Body>
              <Modal.Footer>
                <button className="btn"
                  onClick={() =>
                    this.setState(
                      initializeStateForSize(
                        parseInt(
                          document.getElementById("puzzle-dimension").value
                        )
                      )
                    )
                  }>Okay</button>
              </Modal.Footer>
            </Modal>
    } else {
      return <div>
              <div className="container-fluid">
                <div className="row puzzle">
                  <div className="col-md-1">
                    <Toolbar mode={this.state.mode}
                      setMode={this.setMode.bind(this)}
                      download={this.download.bind(this)}
                      clearPuzzle={this.clearPuzzle.bind(this)}/>
                  </div>
                  <div className="col-md-5">
                      <PuzzleInfo title={this.state.title} author={this.state.author}
                      updateAuthor={(value) => this.updateAuthor(value)}
                      updateTitle={(value) => this.updateTitle(value)}/>
                      <Grid size={this.state.size} mode={this.state.mode}
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
}

export default Puzzle;
