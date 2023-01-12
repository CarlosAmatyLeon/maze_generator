import React, {useState, useEffect} from 'react';
import _ from 'lodash';

import "../css/maze.css";

let cols = 0;
let rows = 0;
let status = 'blank';
//depth first helper variables
let df_trail = [];
let df_backtrail = [];
let df_visited = 0;
//kruskal helper varibles
let kr_walls = [];
let kr_visitedNodes = [];
let kr_sets = [];

const Maze = () => {
  const [tiles, setTiles] = useState({});
  const [createAlgorithm, setCreateAlgorithm] = useState('depthFirst');
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    cols = 20;//Math.floor((window.innerWidth-245)/20);
    rows = 20;//Math.floor((window.innerHeight-100)/20)
    createTiles();
    return () => {
      status = "blank";
      df_visited = 0;
      df_trail = [];
      df_backtrail = [];
      kr_walls = [];
      kr_visitedNodes = [];
      kr_sets = [];
    }
  }, []);

  const createTiles = () => {
    const tiles = {};
    let colArrSize = cols*2 + 1;
    let rowArrSize = rows*2 + 1;
    for (let i=0; i < rowArrSize; i++) {
      tiles[i] = {};
      for (let j=0; j < colArrSize; j++) {
        let baseClass = '';
        if (i%2 === 0 && j%2 === 0) baseClass = 'wall-node';
        else if (i%2 === 0) baseClass = 'wall-horizontal';
        else if (j%2 === 0) baseClass = 'wall-vertical';
        else baseClass = 'tile';
        tiles[i][j] = {baseClass ,color: 'tile-black'};
      }
    }
    setTiles(tiles);
  };

  const renderTiles = () => {
    if (_.isEmpty(tiles)) return;
    let colArrSize = cols*2 + 1;
    let rowArrSize = rows*2 + 1;
    let grid = [];
    for (let i=0; i < rowArrSize; i++) {
      let row = [];
      for (let j=0; j < colArrSize; j++) {
        row.push(<div key={`${i}-${j}`} id={`${i}-${j}`} className={`${tiles[i][j].baseClass} ${tiles[i][j].color}`} onClick={tileOnClick} ></div>);
      }
      grid.push(<div key={`row${i}`} style={{ display: "flex", flexDirection: "row" }}>{row}</div>);
    }
    return grid;
  };

  const renderOptions = () => {
    if (status === 'blank') {
      return (
        <div className="options-bar--content">
          <select className="dropdown" value={createAlgorithm} onChange={(e) => setCreateAlgorithm(e.target.value)} >
            <option value="depthFirst" >Depth First</option>
            <option value="kruskal" >Kruskal</option>
          </select>
          <label style={{marginRight: '50px'}}>
            <input
              type="checkbox"
              checked={animated}
              onChange={() => setAnimated(!animated)}
            />
            Animate
          </label>
          <button className="primary-button" onClick={createMaze} >Create Maze</button>
        </div>
      );
    } else if (status === 'generating') {
      let w = 0;
      if (createAlgorithm === 'depthFirst') {
        w = Math.ceil((df_visited/(cols*rows))*100);
      } else if (createAlgorithm === 'kruskal') {
        w = 100 - Math.ceil((kr_walls.length/(cols*(rows-1)+rows*(cols-1)))*100);
      }
      return (
        <div className="options-bar--content">
          <p className="blinking-text">generating</p>
          <div className="loading-bar">
            <div style={{height: '15px', width: `${w}%`, backgroundColor:'#4b3f72'}}></div>
          </div>
          <button className="primary-button" onClick={resetMaze} >Cancel</button>
        </div>
      );
    } else if (status === 'generated') {
      return (
        <div className="options-bar--content">
          <button className="primary-button" onClick={resetMaze} >Reset Maze</button>
        </div>
      );
    } else {
      return <h2>undefined</h2>;
    }
  };

  const tileOnClick = () => {

  };

  const createMaze = () => {
    status = "generating";
    switch (createAlgorithm) {
      case 'depthFirst':
        depthFirst();
        return;
      case 'kruskal':
        kruskal();
        return;
      default:
        return;
    }
  };

  const solveMaze = () => {
    console.log(status);
  };

  const resetMaze = () => {
    status = "blank";
    df_visited = 0;
    df_trail = [];
    df_backtrail = [];
    kr_walls = [];
    kr_visitedNodes = [];
    kr_sets = [];
    createTiles();
  }

  //Depth Frist
  const depthFirst = (prev, curr) => {
    if (df_visited <= rows*cols && status === 'generating') {
      const newTiles = { ...tiles };
      if (!curr) curr = [1,1];
      if (!df_trail.includes(coorToString(curr))) df_visited++;
      df_trail.push(coorToString(curr));
      let next = df_selectNextTile(curr);
      if (coorToString(next) === df_backtrail[df_backtrail.length-1]) df_backtrail.pop();
      else df_backtrail.push(coorToString(curr));
      newTiles[curr[0]][curr[1]].color = 'tile-head';
      if (prev) {
        newTiles[prev[0]][prev[1]].color = 'tile-white';
        if (curr[0] > prev[0]) newTiles[curr[0]-1][curr[1]].color = 'tile-white';
        if (curr[0] < prev[0]) newTiles[curr[0]+1][curr[1]].color = 'tile-white';
        if (curr[1] > prev[1]) newTiles[curr[0]][curr[1]-1].color = 'tile-white';
        if (curr[1] < prev[1]) newTiles[curr[0]][curr[1]+1].color = 'tile-white';
      }
      if(df_visited === rows*cols) {
        status = 'generated';
        newTiles[curr[0]][curr[1]].color = 'tile-white';
      }
      setTiles(newTiles);
      if (animated) setTimeout(() => { depthFirst(curr, next) }, 20);
      else depthFirst(curr, next);
    }
  };

  const df_selectNextTile = (currTile) => {
    let possibilities = [];
    let nextTile;
    if ((currTile[0] !== 1) && (!df_trail.includes((currTile[0]-2)+"-"+currTile[1]))) { possibilities.push("up"); }
    if ((currTile[0] !== rows*2-1) && (!df_trail.includes((currTile[0]+2)+"-"+currTile[1]))) { possibilities.push("down"); }
    if ((currTile[1] !== 1) && (!df_trail.includes(currTile[0]+"-"+(currTile[1]-2)))) { possibilities.push("left"); }
    if ((currTile[1] !== cols*2-1) && (!df_trail.includes(currTile[0]+"-"+(currTile[1]+2)))) { possibilities.push("right"); }
    if (possibilities.length > 0) {     
      let chosenDirection = possibilities[Math.floor(Math.random()*possibilities.length)];
      if (chosenDirection === "up") { nextTile = [currTile[0]-2,currTile[1]]; }
      if (chosenDirection === "down") { nextTile = [currTile[0]+2,currTile[1]]; }
      if (chosenDirection === "left") { nextTile = [currTile[0],currTile[1]-2]; }
      if (chosenDirection === "right") { nextTile = [currTile[0],currTile[1]+2]; }
    } else {
      nextTile = df_backtrail[df_backtrail.length-1].split("-").map(item => parseInt(item));
    }
    return nextTile;
  }

  //Kruskal
  const kruskal = () => {
    if (kr_walls.length === 0 && status === 'generating') kr_getWalls();
    if (kr_walls.length > 0 && status === 'generating') {
      //pick a random wall
      let selectedWall = Math.floor(Math.random()*kr_walls.length);
      let currWall = coordToArray(kr_walls.splice(selectedWall,1)[0]);

      //check adjacent nodes
      let [node1, node2] = kr_wallNodes(currWall);
      let node1check = false;
      let node2check = false;
      if (kr_visitedNodes.includes(coorToString(node1))) node1check = true;
      else kr_visitedNodes.push(coorToString(node1));
      if (kr_visitedNodes.includes(coorToString(node2))) node2check = true;
      else kr_visitedNodes.push(coorToString(node2));

      //add to sets and paint
      let newTiles = { ...tiles };
      if (!node1check && !node2check) {
        kr_sets.push([coorToString(node1),coorToString(node2)]);
        newTiles[node1[0]][node1[1]].color = 'tile-white';
        newTiles[node2[0]][node2[1]].color = 'tile-white';
        newTiles[currWall[0]][currWall[1]].color = 'tile-white';
      } else if (node1check && node2check) {
        let set1;
        let set2;
        for (let set in kr_sets) {
          if (kr_sets[set].includes(coorToString(node1))) set1 = set;
          if (kr_sets[set].includes(coorToString(node2))) set2 = set;
        }
        
        if (set1 !== set2) {
          let newSet = [];
          for (let set in kr_sets) {
            if (!(set === set1 || set === set2)) {
              newSet.push(kr_sets[set]);
            }
          }
          newSet.push(kr_sets[set1].concat(kr_sets[set2]));
          kr_sets = newSet;
          newTiles[node1[0]][node1[1]].color = 'tile-white';
          newTiles[node2[0]][node2[1]].color = 'tile-white';
          newTiles[currWall[0]][currWall[1]].color = 'tile-white';
        }
      } else {
        if (node1check) {
          for (let set of kr_sets) {
            if (set.includes(coorToString(node1))) {
              set.push(coorToString(node2));
            }
          }
          newTiles[node1[0]][node1[1]].color = 'tile-white';
          newTiles[node2[0]][node2[1]].color = 'tile-white';
          newTiles[currWall[0]][currWall[1]].color = 'tile-white';
        } else {
          for (let set of kr_sets) {
            if (set.includes(coorToString(node2))) {
              set.push(coorToString(node1));
            }
          }
          newTiles[node1[0]][node1[1]].color = 'tile-white';
          newTiles[node2[0]][node2[1]].color = 'tile-white';
          newTiles[currWall[0]][currWall[1]].color = 'tile-white';
        }
      }
      //check for end of maze creation
      if (kr_walls.length === 0) status = "generated";
      
      setTiles(newTiles);
      if (animated) setTimeout(() => { kruskal() }, 10);
      else kruskal();
    }
  };

  const kr_getWalls = () => {
    if (kr_walls.length === 0) {
      let colArrSize = cols*2 + 1;
      let rowArrSize = rows*2 + 1;
      for (let i=1; i<rowArrSize-1; i++) {
        if (i%2 === 0) {
          for (let j=1; j<colArrSize; j=j+2) {
            kr_walls.push(`${i}-${j}`);
          }
        } else {
          for (let j=2; j<colArrSize-1; j=j+2) {
            kr_walls.push(`${i}-${j}`);
          }
        }
      }
    }
  };

  const kr_wallNodes = (wall) => {
    let node1;
    let node2;
    if (wall[0]%2 === 0) [node1, node2] = [[wall[0]-1,wall[1]],[wall[0]+1,wall[1]]];
    else if (wall[1]%2 === 0) [node1, node2] = [[wall[0],wall[1]-1],[wall[0],wall[1]+1]];
    return [node1,node2];
  };

  //helper functions
  const coorToString = (coordinates) => {
    return `${coordinates[0]}-${coordinates[1]}`;
  };

  const coordToArray = (coordinates) => {
    return coordinates.split('-').map((item) => parseInt(item));
  };

  return (
    <div className="maze-container">
      <div className="options-bar">
        {renderOptions()}
      </div>
      <div className="tilebox">
        {renderTiles()}
      </div>
    </div>
  );  
};

export default Maze;