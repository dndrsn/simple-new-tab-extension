
import { debounce } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useOptions } from './common';


const App = () => {

  const { options, setOption } = useOptions();

  if (!options) return null;

  return (
    <div className="container mt-5">
      <h1>Simple New Tab Page</h1>
      <Options {...{ options, setOption }} />
    </div>
  );
};


const Options = ({ options, setOption }) => {

  const [bookmarksInputValue, setBookmarksInputValue] = useState(options.bookmarksPath || '');

  const debouncedSetOption = useCallback(debounce((key, value) => setOption(key, value), 500), []);

  const handleBookmarksInputChange = e => {
    const value = e.target.value;
    setBookmarksInputValue(value);
    debouncedSetOption('bookmarksPath', value);
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
            value={bookmarksInputValue}
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


const root = createRoot(document.getElementById('root'));
root.render(<App />);

