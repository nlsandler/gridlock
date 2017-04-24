import React from 'react';

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

export default PuzzleInfo;
