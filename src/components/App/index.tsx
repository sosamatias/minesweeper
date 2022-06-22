import { useEffect } from "react";

import Board from '../Board';

export default function App() {

  useEffect(() => {
    //preload images
    const imgNames = ['mine', 'fatal-mine', 'emoji-win', 'emoji-lose', 'emoji', 'X'];
    imgNames.forEach((imgName) => {
      preloadImage(imgName);
    });
    for (let i = 0; i < 9; i++) {
      preloadImage(i.toString());
    }
  }, []);

  function preloadImage(imgName: string) {
    const img = new Image();
    img.src = require(`../../img/${imgName}.png`);
  }

  return (
    <div className="app">
      <Board />
    </div>
  );
}
