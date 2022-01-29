
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { each, find, map } from 'lodash-es';
import log from 'loglevel';


// const SNT_BOOKMARKS_PATH = 'Other Bookmarks/Favorites';


log.setDefaultLevel('debug');

log.debug('=== here');


const { chrome } = window;


const getBookmarksTree = async () => new Promise(resolve => chrome.bookmarks.getTree(resolve));


const getBookmarksTreeNode = async bookmarksPath => {
  const bookmarksTree = await getBookmarksTree();

  const pathElems = bookmarksPath.split('/');
  let pathNode = bookmarksTree[0];
  each(pathElems, pathElem => {
    pathNode = find(pathNode?.children, { title: pathElem });
    if (!pathNode) {
      log.warn('Unable to find boomarks path node:', pathElem);
      return false;
    }
  });
  return pathNode;
};


const BookmarkIcon = ({ className, url }) => {
  return (
    <span className={className}>
      <img className="bookmark__icon mt-1" alt="favicon" src={`chrome://favicon/${url}`} />
    </span>
  );
};


const Bookmark = ({ title, url }) => {
  return (
    <a className="bookmark list-group-item list-group-item-action px-3 py-2" href={url}>
      <div className="d-flex">
        <BookmarkIcon className="mr-2" url={url} />
        {title}
      </div>
    </a>
  );
};


const BookmarkGroup = ({ title, children }) => {
  return (
    <div className="bookmark-group mb-4">
      <div className="list-group">
        <div className="bookmark-group__title list-group-item px-3 py-2">
          <h2 className="h5 mb-0">{title}</h2>
        </div>
        {map(children, (child, i) => (
          <Bookmark key={child.url + '_' + i} {...child} />
        ))}
      </div>
    </div>
  );
};


const BookmarkGroups = () => {

  const [options, setOptions] = useState({});
  const [bookmarksTreeNode, setBookmarksTreeNode] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('options', data => setOptions(options => ({ ...data.options, ...options })));
  }, []);

  useEffect(async () => {
    if (options.bookmarksPath) setBookmarksTreeNode(await getBookmarksTreeNode(options.bookmarksPath));
  }, [options]);

  if (!options) return null;

  if (!options.bookmarksPath) return (
    <div className="alert alert-info" role="alert">
      Bookmarks folder not set.
      Update the <a href="/options.html">extension options</a> to set the path of boomarks folder to display.
    </div>
  );

  if (bookmarksTreeNode === false) return null;

  if (!bookmarksTreeNode) return (
    <div className="alert alert-warning" role="alert">
      Bookmarks folder not found: &quot;{options.bookmarksPath}&quot;.
      Update the <a href="/options.html">extension options</a> to set the path of boomarks folder to display.
    </div>
  );

  return (
    <div className="row">
      {map(bookmarksTreeNode.children, childNode => (
        <div key={childNode.title} className="col-sm-6 col-md-4 col-lg-3">
          <BookmarkGroup {...childNode} />
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

