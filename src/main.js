
import log from 'loglevel';
import { each } from 'lodash-es';


log.setDefaultLevel('debug');


const { chrome } = window;
const bookmarks = chrome.bookmarks;
const div = document.querySelector('div.bookmarks');


bookmarks.search('Favorites', nodes => {

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

