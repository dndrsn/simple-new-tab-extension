
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { debounce, each, find, map } from 'lodash-es';
import log from 'loglevel';


log.setDefaultLevel('debug');


const { chrome } = window;


const getStorage = (...args) => chrome.storage.sync.get(...args);


const setStorage = debounce((...args) => chrome.storage.sync.set(...args), 250);


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


let _bookmarkIcons, _getBookmarkIconsPromise;


const getBookmarkIcons = async () => {
  if (!_getBookmarkIconsPromise) _getBookmarkIconsPromise = new Promise(resolve => {
    log.debug('=== fetching bookmark icons from storage');
    getStorage('bookmarkIcons', data => {
      _bookmarkIcons = data.bookmarkIcons;
      resolve(_bookmarkIcons);
    });
  });
  return _getBookmarkIconsPromise;
};


const setBookmarkIcons = bookmarkIcons => {
  _bookmarkIcons = bookmarkIcons;
  setStorage({ bookmarkIcons });
};


const setBookmarkIcon = (origin, url) => {
  setBookmarkIcons({ ..._bookmarkIcons, [origin]: url });
};


const loadImage = async url => new Promise(resolve => {
  const image = new window.Image();
  // image.crossOrigin = 'anonymous';
  image.addEventListener('error', () => resolve());
  image.addEventListener('load', () => resolve(image));
  image.src = url;
});


// const imgToDataUrl = img => {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
//   canvas.width = img.width;
//   canvas.height = img.height;
//   ctx.drawImage(img, 0, 0);
//   return canvas.toDataURL();
// };




const useBookmarkIconUrl = pageUrl => {

  const [iconUrl, setIconUrl] = useState('/assets/icons/globe-gray.svg');

  const updateBookmarkIconUrl = async () => {
    const { origin } = new URL(pageUrl);

    const bookmarkIcons = await getBookmarkIcons();
    if (bookmarkIcons[origin]) return setIconUrl(bookmarkIcons[origin]);

    each(['/favicon.ico'/*, '/favicon.png', '/favicon-16x16.png' */], async path => {
      const url = origin + path;

      chrome.runtime.sendMessage(
        { type: 'image-to-data-url', url },
        response => {
          log.debug('=== response:', response);
        },
      );

      const img = await loadImage(url);
      if (img) {
        // const dataUrl = imgToDataUrl(img);
        const dataUrl = url;
        setBookmarkIcon(origin, dataUrl);
        setIconUrl(dataUrl);
        return false;
      }
    });
  };

  useEffect(() => {
    updateBookmarkIconUrl();
  }, [pageUrl]);
  return iconUrl;
};


const BookmarkIcon = ({ url }) => {

  // const iconUrl = (
  //   `https://t1.gstatic.com/faviconV2` +
  //   `?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=128&url=${url}`
  // );

  const iconUrl = useBookmarkIconUrl(url);

  return (
    <span className="mr-2 d-block">
      <img className="bookmark__icon d-block" alt="favicon" src={iconUrl} />
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

  const [options, setOptions] = useState();
  const [bookmarksTreeNode, setBookmarksTreeNode] = useState(false);

  useEffect(() => {
    getStorage('options', data => setOptions(options => ({ ...data.options, ...options })));
  }, []);

  useEffect(async () => {
    if (options?.bookmarksPath) setBookmarksTreeNode(await getBookmarksTreeNode(options.bookmarksPath));
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

