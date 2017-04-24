import React, { Component } from 'react';

class Square extends Component {
  render() {
    var classes = "content";

    if (this.props.squareValue.isBlack) {
      classes += " black";
    }

    //var classes = "text-center";
    if (this.props.isSelected) {
      classes += " highlight";
    } else if (this.props.isWordSelected) {
      classes += " weak-highlight";
    }
          //<input className={classes}
    return (
      <td className="square">
        <div className={classes}>
          <span className="clueNum"><sup>{this.props.squareValue.clueNum}</sup></span>
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
