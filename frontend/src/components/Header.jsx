import React from 'react';
import { VscAccount, VscPlay } from 'react-icons/vsc';
import { SlSettings } from 'react-icons/sl';
import './Header.css';

const Header = ({ onRun, isRunDisabled }) => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">IDE</div>
        <nav className="menu">
          <button className="menu-item">File</button>
          <button className="menu-item">Edit</button>
          <button className="menu-item">View</button>
          <button className="menu-item">Go</button>
          <button className="menu-item">Terminal</button>
          <button className="menu-item">Help</button>
        </nav>
      </div>
      <div className="header-center">
        <button className="run-button" onClick={onRun} disabled={isRunDisabled}>
          <VscPlay size={20} />
          <span>Run</span>
        </button>
      </div>
      <div className="header-right">
        <button className="icon-button">
          <SlSettings size={20} />
        </button>
        <button className="icon-button">
          <VscAccount size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
