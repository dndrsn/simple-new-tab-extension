
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
// import favicon from 'favicon';

import log from 'loglevel';
import { each, find, map } from 'lodash-es';


import './main.scss';


const SNT_BOOKMARKS_PATH = 'Other Bookmarks/Favorites';


log.setDefaultLevel('debug');


const { chrome } = window;


const getBookmarksTree = async () => new Promise(resolve => chrome.bookmarks.getTree(resolve));


const getBookmarksTreeNode = async path => {
  const bookmarksTree = await getBookmarksTree();
  const pathElems = path.split('/');
  let pathNode = bookmarksTree[0];
  each(pathElems, pathElem => {
    pathNode = find(pathNode?.children, { title: pathElem });
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
      <h2 className="h5 mx-3">{title}</h2>
      <div className="list-group">
        {map(children, (child, i) => (
          <Bookmark key={child.url + '_' + i} {...child} />
        ))}
      </div>
    </div>
  );
};


const BookmarkGroups = () => {

  const [bookmarksTreeNode, setBookmarksTreeNode] = useState();

  useEffect(async () => {
    setBookmarksTreeNode(await getBookmarksTreeNode(SNT_BOOKMARKS_PATH));
  }, []);

  if (!bookmarksTreeNode) return null;

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
    <div className="container-xxl mt-4">
      <h1 className="d-none">Simple New Tab Page</h1>
      <BookmarkGroups />
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById('root'));

