
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { each } from 'lodash-es';

import {
  getBookmarkIconDataUrl,
  setBookmarkIcon,
  useBookmarkGroups,
  useIsMounted,
  useOptions,
  // log,
} from './common';


const App = () => {

  const { options, setOption } = useOptions();

  return (
    <div className="container mt-5">
      <h1>Simple New Tab Page</h1>
      <Options {...{ options, setOption }} />
      <Utilities {...{ options }} />
    </div>
  );
};


const Options = ({ options, setOption }) => {

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


const Utilities = ({ options }) => {

  const [updatingIcons, setUpdatingIcons] = useState(false);
  const bookmarkGroups = useBookmarkGroups(options?.bookmarksPath);
  const updateIconsDisabled = !bookmarkGroups || updatingIcons;

  const isMounted = useIsMounted();

  const updateBookmarkIcon = async bookmarkUrl => {
    const bookmarkIconDataUrl = await getBookmarkIconDataUrl(bookmarkUrl);
    if (bookmarkIconDataUrl) {
      setBookmarkIcon(bookmarkUrl, bookmarkIconDataUrl);
    }
  };

  const updateBookmarkIcons = async () => {
    setUpdatingIcons(true);
    const promises = [];
    each(bookmarkGroups, ({ bookmarks }) => each(bookmarks, bookmark => {
      promises.push(updateBookmarkIcon(bookmark.url));
    }));
    await Promise.all(promises);
    isMounted && setUpdatingIcons(false);
  };

  return (
    <div className="utilities mt-5">
      <h2>Utilities</h2>
      <p>
        <button className="btn btn-primary" onClick={updateBookmarkIcons} disabled={updateIconsDisabled}>
          Update Bookmark Icons
        </button>
      </p>
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

