import saveAs from 'save-as';

//convert clue map to string of newline-separated clues,
//suitable to include in PUZ file
function getClueList(clueMap) {
  console.log(clueMap);
  let clues = Object.values(clueMap);
  clues.sort((a, b) => (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0 );
  return clues.map((clue) => clue.text).join("\n");
}

function createPuz(title, author, letters, clues) {

  const year = new Date().getFullYear();

  //construct the grid
  //TODO would reduce be better here?
  const grid = letters.map((row) =>
    row.map((square) =>
              square.isBlack ? "." : square.char)
              .join(""))
              .join("\n");

  const acrossClues = getClueList(clues.across);
  const downClues = getClueList(clues.down);

  let puz =
`<ACROSS PUZZLE V2>
<TITLE>
${title}
<AUTHOR>
${author}
<COPYRIGHT>
${year} ${author}
<SIZE>
15x15
<GRID>
${grid}
<ACROSS>
${acrossClues}
<DOWN>
${downClues}
<NOTEPAD>
Created using Gridlock (https://github.com/nlsandler/gridlock)`;

  return puz;
}

function savePuz(puz) {
  const puzBlob = new Blob([puz], { type: 'text/plain;charset=utf-8' });
  saveAs(puzBlob, 'puzzle.txt');
}

function Download(title, author, letters, clues) {
  const puz = createPuz(title, author, letters, clues);
  savePuz(puz);
}

export default Download;
