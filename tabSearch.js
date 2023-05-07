showAllTabs();

const searchBox = document.getElementById('searchBox');
searchBox.addEventListener('input', () => {
  const query = searchBox.value.trim();
  if (query.length === 0) {
    // Clear the search results and show all tabs at the front
    showAllTabs();
    main.classList.remove('blur');
    const mainElement = document.querySelector('main');
    mainElement.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    // Send a message to the background script to search for matching tabs
    chrome.runtime.sendMessage({ action: 'searchTabs', query }, (matchingTabs) => {
      // Show the matching tabs and hide the rest
      const tabElements = document.querySelectorAll('.tab');
      let firstVisibleTab = null;
      for (const tabElement of tabElements) {
        const tabId = parseInt(tabElement.dataset.tabId);
        if (matchingTabs.some((tab) => tab.id === tabId)) {
          // Found a matching tab
          if (firstVisibleTab) {
            // Move this matching tab before the first visible matching tab
            firstVisibleTab.parentElement.insertBefore(tabElement, firstVisibleTab);
        } else {
            // This is the first visible matching tab
            firstVisibleTab = tabElement;
          }
          // Show the matching tab and unblur it
          tabElement.classList.remove('hidden');
          tabElement.classList.remove('blur');
        } else {
          // Hide the non-matching tab and blur it
          tabElement.classList.add('hidden');
          tabElement.classList.add('blur');
        }
      }
      if (firstVisibleTab) {
        // Scroll to the first visible matching tab
        firstVisibleTab.scrollIntoView({ behavior: 'smooth' });
      }
      // Blur the main container if there are any hidden tabs
      if (matchingTabs.length < tabElements.length) {
        main.classList.add('blur');
      } else {
        main.classList.remove('blur');
      }
    });
  }
});

// Show all open tabs in the view
function showAllTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const tabList = document.getElementById('tabList');
      tabList.innerHTML = '';
      const numTabsToShow = tabs.length;
      const numTabs = tabs.length;
      let startIdx = 0;
      let endIdx = numTabsToShow;
      for (let i = startIdx; i < endIdx; i++) {
        const tabElement = createTabElement(tabs[i]);
        tabList.appendChild(tabElement);
      }
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const scrollHeight = document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        if (scrollTop + clientHeight >= scrollHeight) {
          startIdx += numTabsToShow;
          endIdx += numTabsToShow;
          if (endIdx > numTabs) {
            endIdx = numTabs;
          }
          for (let i = startIdx; i < endIdx; i++) {
            const tabElement = createTabElement(tabs[i]);
            tabList.appendChild(tabElement);
          }
        }
      });
    });
  }
  
  // Open a new window with the tab list
  chrome.action.onClicked.addListener((tab) => {
    chrome.windows.create({ 
      url: 'index.html', 
      type: 'popup', 
      height: 600, 
      width: 800 
    }, () => {
      showAllTabs();
    });
  });

// Create an element to display a tab
function createTabElement(tab) {
  const tabElement = document.createElement('div');
  tabElement.className = 'tab';
  tabElement.dataset.tabId = tab.id;

  function faviconURL(u) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
  }
  
  const faviconElement = document.createElement('img');
  faviconElement.className = 'favicon';
  faviconElement.src = faviconURL(tab.url);
  tabElement.appendChild(faviconElement);

  // Add an event listener to open the tab when clicked
  tabElement.addEventListener('click', () => {
    chrome.tabs.update(tab.id, { active: true });
  });
  
  const titleElement = document.createElement('div');
  titleElement.className = 'title';
  const path = new URL(tab.url).pathname;
  const slashHandle = path.replace(/\//g, " ");
  const dashHandle = slashHandle.replace(/-/g, ' ');
  const title = dashHandle.replace(/(\b[a-z](?!\s))/g, function(x){
    return x.toUpperCase();
  });
  const hostnameParts = new URL(tab.url).hostname.split('.').reverse();
  const domain = hostnameParts[1] + '.' + hostnameParts[0];
  titleElement.textContent = title.replace(domain, '').trim();
  tabElement.appendChild(titleElement);
  
  // add CSS to show and hide the titleElement only on hover
  // titleElement.style.display = 'none';
//   tabElement.addEventListener('mouseenter', () => {
//     titleElement.style.display = 'block';
//   });
//   tabElement.addEventListener('mouseleave', () => {
//     titleElement.style.display = 'none';
//   });
  
  return tabElement;
}