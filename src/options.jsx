
import React from 'react';
import ReactDOM from 'react-dom';

import {
  useOptions,
  // log,
} from './common';


const App = () => {
  return (
    <div className="container mt-5">
      <h1>Simple New Tab Page</h1>
      <Options />
      <Utilities />
    </div>
  );
};


const Options = () => {

  const { options, setOption } = useOptions();

  const handleBookmarksInputChange = e => setOption('bookmarksPath', e.target.value);

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
            value={options?.bookmarksPath || ''}
            onChange={handleBookmarksInputChange}
          />
          <small id="bookmarksPathHelp" className="form-text text-muted">
            Path to bookmarks folder to use for new tab page.
          </small>
        </div>
      </form>
    </div>
  );
};


const Utilities = () => {

  return (
    <div className="utilities mt-5">
      <h2>Utilities</h2>
      <p>put utilities here</p>
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

