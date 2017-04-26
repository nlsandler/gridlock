import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { Mode } from '../Common';

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    }
  }
  openModal() {
    this.setState({
      showModal: true
    });
  }
  closeModal() {
    this.setState({
      showModal: false
    });
  }
  reset () {
    this.props.clearPuzzle();
    this.closeModal();
  }
  render() {
    return <div className="toolbar">
      <button className="btn btn-primary"
              onClick={() => this.openModal()}>
        <span className="glyphicon glyphicon-repeat" />
      </button>
      <button className="btn btn-primary"
              onClick={() => this.props.download()}>
        <span className="glyphicon glyphicon-save" />
      </button>
      <div className="btn-group" data-toggle="buttons">
        <label className={this.props.mode ? "btn btn-primary" : "btn btn-primary active"}>
          <input type="radio"
            id="edit-letters"
            autoComplete="off"
            defaultChecked={!this.props.mode}
            onClick={() => this.props.setMode(Mode.TEXT)}/>
          <span className="glyphicon glyphicon-font" />
        </label>
        <label className={this.props.mode ? "btn btn-primary active" : "btn btn-primary"}>
          <input type="radio"
            id="fill-squares"
            autoComplete="off"
            defaultChecked={this.props.mode}
            onClick={() => this.props.setMode(Mode.BLOCK)}/>
          <span className="glyphicon glyphicon-tint" />
        </label>
      </div>
      <Modal show={this.state.showModal}
        onHide={() => this.closeModal()}>
        <Modal.Header closeButton>
          <Modal.Title>Start Over?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to start over? Your current puzzle will be lost!
        </Modal.Body>
        <Modal.Footer>
          <button className="btn"
            onClick={() => this.closeModal()}>Cancel</button>
          <button className="btn btn-primary"
            onClick={() => this.reset()}>Start Over</button>
        </Modal.Footer>
      </Modal>
    </div>
  }
};

export default Toolbar;
