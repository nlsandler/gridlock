import React, { Component } from 'react';
import Grid from './Grid';
import Clues from './Clues';
import Toolbar from './Toolbar';
import PuzzleInfo from './PuzzleInfo';
import { Orientation, Mode } from '../Common';
import Download from '../Download';
//import logo from './logo.svg';
import '../App.css';

/*
TODOs:
- refactor
    reorganize each component
    take helper functions out of components, maybe?
    better variable names/style/etc
- download!
  -make sure it also works in windows (b/c newlines)
- fix bug that sometimes prevents moving left
- hide cursor when in square fill mode
- include some sort of tooltip/explanation of fill/letter modes
- make it less laggy!
- when a word is highlighted in grid, highlight corresponding clue (and vice versa)
- accessibility

- maybe make across/down clues scrollable?
*/

class Puzzle extends Component {
  constructor(props) {
    super(props);
    //load puzzle from localStorage if we have it
    const puzzleState = localStorage.getItem('puzzle');
    if (puzzleState) {
      this.state = JSON.parse(puzzleState);
    } else {
      //initialize array of letters
      let letters = Array(this.props.size).fill().map(() => Array(this.props.size).fill({
        "isBlack" : false,
        "char" : ""
      }));
      let clues = {
        "across" : {},
        "down" : {}
      };
      this.state = {
        "letters" : letters,
        "clues" : clues
      }
      //initialize clue numbers
      let [numberedLetters, numberedClues] = this.generateClueNumbers();
      this.state = {
        "title" : "",
        "author" : "",
        "letters" : numberedLetters,
        "clues" : numberedClues,
        "mode" : Mode.TEXT
      }
    }
  }
  componentDidUpdate(prevProps, prevState) {
    localStorage.setItem('puzzle', JSON.stringify(this.state));
  }
  /* Helpers for clue numbers */
  needsAcrossClue(x, y) {
    if (this.state.letters[x][y].isBlack) {
      return false;
    }
    if (y === 0) {
      return true;
    }

    if (this.state.letters[x][y-1].isBlack) {
        return true;
    }
    return false;
  }
  needsDownClue(x, y) {
    if (this.state.letters[x][y].isBlack) {
      return false;
    }

    if (x === 0) {
      return true;
    }

    if (this.state.letters[x-1][y].isBlack) {
        return true;
    }
    return false;
  }
  generateClueNumbers() {
    //add clue numbers to letters in grid and to clues in map
    let letters = this.state.letters.slice();
    let clues = {
      "across" : {},
      "down" : {}
    }
    var currentClueNum = 1;

    for (var x = 0; x < this.props.size; x++) {
      for (var y = 0; y < this.props.size; y++) {
        let clueKey = [x,y].toString();

        let needsAcross = this.needsAcrossClue(x, y);

        if (needsAcross) {
          let acrossClue = this.state.clues.across[clueKey];
          if (!acrossClue) {
            acrossClue = { "text" : "" };
          }
          acrossClue.id = currentClueNum;
          clues.across[clueKey] = acrossClue;
        }

        let needsDown = this.needsDownClue(x, y);

        if (needsDown) {
          let downClue = this.state.clues.down[clueKey];
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
  updateLetters(letters) {
    var [numberedLetters, numberedClues] = this.generateClueNumbers();
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
  render() {
    return <div>
            <div className="container-fluid">
              <div className="row puzzle">
                <div className="col-md-1">
                  <Toolbar mode={this.state.mode}
                    setMode={this.setMode.bind(this)}
                    download={this.download.bind(this)}/>
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



export default Puzzle;
