---
---

(() => {
  const pages = {{ site.data.standalone_pages | jsonify }};

  function renderStandalonePages() {
    const baseUrl = {{ site.baseurl | default: '' | jsonify }};
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    const homePath = `${baseUrl}/`.replace(/\/+/g, '/');

    if (currentPath !== homePath || !Array.isArray(pages) || pages.length === 0) {
      return;
    }

    const postList = document.getElementById('post-list');
    if (!postList) return;

    const section = document.createElement('section');
    section.className = 'standalone-pages';
    section.setAttribute('aria-label', '独立页面');

    ['Tools', 'Pages', 'Games'].forEach((groupName) => {
      const groupPages = pages.filter((page) => page.group === groupName);
      if (groupPages.length === 0) return;

      const group = document.createElement('div');
      group.className = 'standalone-pages-group';

      const heading = document.createElement('h2');
      heading.textContent = groupName;

      const grid = document.createElement('div');
      grid.className = 'standalone-pages-grid';

      groupPages.forEach((page) => {
        const link = document.createElement('a');
        link.className = 'standalone-page-card';
        link.href = `${baseUrl}${page.url}`.replace(/\/+/g, '/');

        const icon = document.createElement('i');
        icon.className = `fas ${page.icon || 'fa-file-lines'}`;
        icon.setAttribute('aria-hidden', 'true');

        const copy = document.createElement('span');
        const title = document.createElement('strong');
        const description = document.createElement('small');
        title.textContent = page.title;
        description.textContent = page.description || '';
        copy.append(title, description);

        const arrow = document.createElement('i');
        arrow.className = 'fas fa-arrow-right standalone-page-arrow';
        arrow.setAttribute('aria-hidden', 'true');

        link.append(icon, copy, arrow);
        grid.append(link);
      });

      group.append(heading, grid);
      section.append(group);
    });

    postList.parentNode.insertBefore(section, postList);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderStandalonePages);
  } else {
    renderStandalonePages();
  }
})();
