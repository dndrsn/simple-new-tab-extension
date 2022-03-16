
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { each, find, map, orderBy } from 'lodash-es';
import log from 'loglevel';
import urlJoin from 'url-join';


log.setDefaultLevel('debug');


const { chrome } = window;
const _state = {};


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


const getBookmarkIcons = () => {
  if (!_state.bookmarkIcons) _state.bookmarkIcons = JSON.parse(window.localStorage.getItem('bookmarkIcons') || '{}');
  return _state.bookmarkIcons;
};


const setBookmarkIcons = bookmarkIcons => {
  _state.bookmarkIcons = bookmarkIcons;
  window.localStorage.setItem('bookmarkIcons', JSON.stringify(bookmarkIcons));
};


const setBookmarkIcon = (origin, url) => {
  setBookmarkIcons({ ..._state.bookmarkIcons, [origin]: url });
};


const arrayBufferToBase64 = buffer => {
  const bytes = [].slice.call(new Uint8Array(buffer));
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};


const fetchImageAsDataUrl = async url => {
  if (!url) return;
  try {
    const response = await fetch(url);
    if (response.status >= 400) return;
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image')) return;
    const arrayBuffer = await response.arrayBuffer();
    const dataUrl = `data:${contentType};base64,${arrayBufferToBase64(arrayBuffer)}`;
    return dataUrl;
  }
  catch (err) {
    log.error('Error fetching image data URL:', url);
    console.error(err); // eslint-disable-line no-console
  }
};


const fetchPageFaviconUrl = async pageUrl => {
  if (!pageUrl) return;
  try {
    const response = await fetch(pageUrl);
    const redirectUrl = response.redirected && response.url;
    // if (redirectUrl) log.debug(`=== this is a redirect:\n${pageUrl}\n${redirectUrl}`);
    if (response.status >= 400) return;
    const body = await response.text();
    const faviconLinkElemMatches = body.match(/<link [^>]*?rel="icon"[^>]*?\/?>/ig);
    if (faviconLinkElemMatches) {
      const faviconLinks = orderBy(
        map(faviconLinkElemMatches, fle => ({
          url: fle.match(/href="(.+?)"/i)?.[1],
          sizes: fle.match(/sizes="(.+?)"/i)?.[1],
        })),
        ({ sizes }) => {
          const sizeMatch = sizes?.match(/^(\d+)x(\d+)/);
          if (sizeMatch) return Math.abs(63 - Number(sizeMatch[1]));
          return 99999;
        },
        'asc',
      );
      const iconPageUrl = redirectUrl || pageUrl;
      let url = faviconLinks[0].url;
      if (url.startsWith('/')) {
        const { origin } = new URL(iconPageUrl);
        url = urlJoin(origin, url);
      }
      else if (!url.match(/^[\w.+_-]+:/i)) {
        const { origin, pathname } = new URL(iconPageUrl);
        url = urlJoin(origin, pathname.replace(/\/[^/]*$/, ''), url);
      }
      return url;
    }
  }
  catch (err) {
    log.error('Error fetching favicon for url:', pageUrl);
    console.error(err); // eslint-disable-line no-console
  }
};


const useBookmarkIconUrl = pageUrl => {

  const { origin } = new URL(pageUrl);

  const bookmarkIcons = getBookmarkIcons();
  const cachedIcon = bookmarkIcons[origin];
  const defaultIcon = '/assets/icons/globe-gray.svg';

  const [iconUrl, setIconUrl] = useState(cachedIcon || defaultIcon);

  const updateIconUrl = async () => {
    const dataUrl = (
      await fetchImageAsDataUrl(await fetchPageFaviconUrl(origin)) ||
      await fetchImageAsDataUrl(urlJoin(origin, '/favicon.ico')) ||
      await fetchImageAsDataUrl(urlJoin(origin.replace(/\/\/[^.]+\./, '//'), '/favicon.ico'))
    );
    // if (!dataUrl) return;
    setBookmarkIcon(origin, dataUrl || defaultIcon);
    setIconUrl(dataUrl || defaultIcon);
  };

  useEffect(() => {
    if (!cachedIcon) {
      log.debug('=== updating icon for:', origin);
      updateIconUrl();
    }
  }, []);

  return iconUrl;
};


const BookmarkIcon = ({ url }) => {
  const iconUrl = useBookmarkIconUrl(url);
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
    chrome.storage.sync.get('options', data => setOptions(options => ({ ...data.options, ...options })));
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

