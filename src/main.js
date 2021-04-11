
import log from 'loglevel';
import { each, find } from 'lodash-es';


const SNT_BOOKMARKS_PATH = 'Other Bookmarks/Favorites';


log.setDefaultLevel('debug');


const { chrome } = window;


// const parseBookmarksTreeNode = ({ title, url, children }) => ({
//   title,
//   url,
//   children: map(children, childNode => parseBookmarksTreeNode(childNode)),
// });


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


const main = async () => {
  const bookmarksTreeNode = await getBookmarksTreeNode(SNT_BOOKMARKS_PATH);
  log.debug('=== bookmarksTreeNode:', bookmarksTreeNode);
};


main();


/*
const bookmarks = chrome.bookmarks;
const div = document.querySelector('div.bookmarks');


bookmarks.search('Bookmarks Bar', nodes => {

  bookmarks.getChildren(nodes[0].id, function(groups) {

    each(groups, group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'group';
      const title = document.createElement('div');
      title.className = 'title';
      title.innerHTML = group.title;
      groupDiv.appendChild(title);
      const ul = document.createElement('ul');
      ul.class = 'links';
      groupDiv.appendChild(ul);
      div.appendChild(groupDiv);

      bookmarks.getChildren(group.id, children => {

        each(children, link => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="${link.url}">
              <img class="favicon" src="chrome://favicon/${link.url}" />${link.title}
            </a>
          `;
          ul.appendChild(li);
        });

      });
    });
  });
});
*/
