
import React from 'react';
import { createRoot } from 'react-dom/client';

import { useOptions } from './common';


const App = () => {

  return (
    <div className="container mt-5">
      <h1>Simple New Tab Page</h1>
      <Options />
    </div>
  );
};


const Options = () => {

  const { options = {}, setOption } = useOptions();

  const handleInputChange = e => {
    const key = e.target.id;
    const value = e.target.value;
    setOption(key, value);
  };

  return (
    <div className="options mt-5">
      <h2>Options</h2>
      <form>
        <div className="form-group">
          <label htmlFor="bookmarksPath">Bookmarks path</label>
          <input
            id="bookmarksPath"
            className="form-control"
            type="text"
            aria-describedby="bookmarksPathHelp"
            value={options.bookmarksPath || ''}
            onChange={handleInputChange}
          />
          <small id="bookmarksPathHelp" className="form-text text-muted">
            Path to bookmarks folder to use for new tab page.
          </small>
        </div>
      </form>
    </div>
  );
};


const root = createRoot(document.getElementById('root'));
root.render(<App />);

