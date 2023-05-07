// Listen for the browser action button to be clicked
chrome.action.onClicked.addListener((tab) => {
    // Create a new window to show the tab view
    const width = 600;
    const height = 400;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    const url = chrome.runtime.getURL('index.html');
    window.open(url, 'myPopup', `width=${width}, height=${height}, left=${left}, top=${top}`);
  });
  
  // Listen for messages from the tabSearch.js script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'searchTabs') {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const matchingTabs = tabs.filter((tab) =>
          tab.title.toLowerCase().includes(request.query.toLowerCase())
        );
        sendResponse(matchingTabs);
      });
      return true; // asynchronous response
    }

  // chrome.scripting.executeScript(
  //   {
  //     target: { tabId: _data.tabId },
  //     files: ['custom-elements.min.js']
  //   },
  //   () => {
  //     chrome.scripting.executeScript({
  //       target: { tabId: _data.tabId },
  //       files: ['tabSearch.js']
  //     })
  //   }
  // )

  // chrome.scripting.insertCSS({
  //   target: { tabId: _data.tabId },
  //   files: ['style/inject.css']
  // })

});