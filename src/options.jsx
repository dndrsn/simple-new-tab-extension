
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
// import { each, find, map } from 'lodash-es';
import log from 'loglevel';



log.setDefaultLevel('debug');


const { chrome } = window;


const App = () => {

  const [options, setOptions] = useState({});

  const setOption = (key, val) => setOptions(options => ({ ...options, [key]: val }));

  const handleBookmarksInputChange = e => setOption('bookmarksPath', e.target.value);

  useEffect(() => {
    chrome.storage.sync.get('options', data => setOptions(options => ({ ...data.options, ...options })));
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({ options });
  }, [options]);

  return (
    <div className="container mt-5">
      <h1>Simple New Tab Page</h1>
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


ReactDOM.render(<App />, document.getElementById('root'));

