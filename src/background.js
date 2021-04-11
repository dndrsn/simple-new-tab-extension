
import log from 'loglevel';


const { chrome } = window;


window.getBookmarks = function() {
  return chrome.bookmarks;
};

chrome.bookmarks.getTree(tree => {
  log.debug('==== bookmarks tree:', tree);
});


