
import { each, includes } from 'lodash-es';

import {
  fetchImageAsDataUrl,
  getBookmarkGroups,
  setBookmarkIcon,
  log,
} from './common';


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.favIconUrl) handleFaviconUpdate(tab);
});


const handleFaviconUpdate = async ({ url, favIconUrl }) => {

  // check if the url origin matches the origin for any bookmarks
  const bookmarkOrigins = [];
  const bookmarkGroups = await getBookmarkGroups();
  each(bookmarkGroups, ({ bookmarks }) => each(bookmarks, bookmark => {
    bookmarkOrigins.push(new URL(bookmark.url).origin);
  }));

  const urlOrigin = new URL(url).origin;
  if (!includes(bookmarkOrigins, urlOrigin)) {
    log.debug('=== not an origin match:', urlOrigin);
    return;
  }

  const faviconDataUrl = await fetchImageAsDataUrl(favIconUrl);
  log.debug('=== tab url:', url);
  log.debug('=== favIconUrl:', favIconUrl);
  log.debug('=== faviconDataUrl:', faviconDataUrl);
  setBookmarkIcon(urlOrigin, faviconDataUrl);
};


