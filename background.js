// chrome.commands.onCommand.addListener(function(command) {
//   if (command === "search-tab") {
//     chrome.tabs.query({currentWindow: true}, function(tabs) {
//       chrome.windows.create({url: chrome.extension.getURL('tab-search.html'), type: 'popup', width: 400, height: 500});
//       chrome.runtime.onConnect.addListener(function(port) {
//         port.postMessage(tabs);
//       });
//     });
//   }
// });

// Listen for the browser action button to be clicked
chrome.action.onClicked.addListener((tab) => {
    // Send a message to the active tab to get its information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: 'openTabView' });
    });
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
      return true; // Required to make the message response asynchronous
    }
  });