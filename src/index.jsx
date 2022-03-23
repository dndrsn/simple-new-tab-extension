
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { map } from 'lodash-es';

import {
  getBookmarkIcon,
  useBookmarkGroups,
  useOptions,
  // log,
} from './common.js';


const BookmarkIcon = ({ url }) => {

  const defaultIcon = '/assets/icons/globe-gray.svg';

  const [iconUrl, setIconUrl] = useState(defaultIcon);

  useEffect(async () => {
    setIconUrl(await getBookmarkIcon(url) || defaultIcon);
  }, []);


  return (
    <span className="mr-2 d-block">
      <img className="bookmark__icon d-block" alt="" src={iconUrl} />
    </span>
  );
};


const Bookmark = ({ title, url }) => {
  return (
    <a className="bookmark list-group-item list-group-item-action px-3 py-2" href={url}>
      <div className="d-flex align-items-center">
        <BookmarkIcon url={url} />
        {title}
      </div>
    </a>
  );
};


const BookmarkGroup = ({ title, bookmarks }) => {
  return (
    <div className="bookmark-group mb-4">
      <div className="list-group">
        <div className="bookmark-group__title list-group-item px-3 py-2">
          <h2 className="h5 mb-0">{title}</h2>
        </div>
        {map(bookmarks, (bookmark, i) => (
          <Bookmark key={bookmark.url + '_' + i} {...bookmark} />
        ))}
      </div>
    </div>
  );
};


const BookmarkGroups = () => {

  const { options } = useOptions();
  const bookmarkGroups = useBookmarkGroups(options?.bookmarksPath);

  if (!options) return null;

  if (!options.bookmarksPath) return (
    <div className="alert alert-info" role="alert">
      Bookmarks folder not set.
      Update the <a href="/options.html">extension options</a> to set the path of boomarks folder to display.
    </div>
  );

  if (bookmarkGroups === false) return (
    <div className="alert alert-warning" role="alert">
      Bookmarks folder not found: &quot;{options.bookmarksPath}&quot;.
      Update the <a href="/options.html">extension options</a> to set the path of boomarks folder to display.
    </div>
  );

  if (!bookmarkGroups) return null;

  return (
    <div className="row">
      {map(bookmarkGroups, ({ title, bookmarks }) => (
        <div key={title} className="col-sm-6 col-md-4 col-lg-3">
          <BookmarkGroup {...{ title, bookmarks }} />
        </div>
      ))}
    </div>
  );
};


const App = () => {
  return (
    <div className="container-xxl mt-5">
      <h1 className="d-none">Simple New Tab Page</h1>
      <BookmarkGroups />
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

