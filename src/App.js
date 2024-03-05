import logo from './logo.svg';
import './App.css';
import ColorPicker from './components/ColorPicker';
import React from 'react';


function App() {
  const colorNum = 10;
  return (
    <div className="App" style={{display: 'flex' , alignItems: 'center', justifyContent: 'center'}}>
        <ColorPicker colorNum={colorNum}/>
    </div>
  );
}

export default App;
