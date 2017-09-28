import React, { Component } from 'react';

class Square extends Component {
  render() {
    var classes = "content";

    if (this.props.squareValue.isBlack) {
      classes += " black";
    }

    if (this.props.isSelected) {
      classes += " highlight";
    } else if (this.props.isWordSelected) {
      classes += " weak-highlight";
    }

    var widthStyle = {
      width: 100/this.props.gridSize + "%"
    };

    var clueNumStyle = {
      fontSize: 90 - 2*this.props.gridSize + "%",
      top: -this.props.gridSize/15+"em"
    }

    return (
      <td className="square" style={widthStyle}>
        <div className={classes}>
          <span className="clueNum">
            <sup style={clueNumStyle}>{this.props.squareValue.clueNum}</sup>
          </span>
          <input className="text-center"
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
};

export default Square;
