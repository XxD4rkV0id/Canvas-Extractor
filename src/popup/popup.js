(function () {
  const COMMANDS = {
    GET_CANVAS_INFO_LIST: "GET_CANVAS_INFO_LIST",
    GET_CANVAS_DATA: "GET_CANVAS_DATA",
  };

  let canvasInfoList = [];

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      command: COMMANDS.GET_CANVAS_INFO_LIST,
    });
  });

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.canvasInfoList) {
      canvasInfoList = canvasInfoList.concat(message.canvasInfoList);
      drawContent(canvasInfoList);
      canvasInfoList.forEach((canvasInfo) => {
        downloadAll(canvasInfo);
      });
    }
  });

  function downloadAll(canvasInfoList) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          command: COMMANDS.GET_CANVAS_DATA,
          data: {
            frame: canvasInfoList.frameId,
            index: canvasInfoList.index,
            type: canvasInfoList.type,
          },
        },
        function (response) {
          chrome.downloads.download({
            url: response.dataURL,
            filename: "canvas." + "image/jpeg".substring(6),
            saveAs: false,
          });
        }
      );
    });
  }

  function drawContent(canvasInfoList) {
    let section = document.getElementsByTagName("section")[0];

    if (canvasInfoList.length > 0) {
      let html = [];

      html.push('<table  class="table is-narrow">');
      html.push("<tr>");
      html.push("<th>");
      html.push("Preview");
      html.push("</th>");
      html.push("</tr>");
      html.push("</table>");

      section.innerHTML = html.join("\n");
    } else {
      section.innerText = "No canvas was found on the page.";
    }
  }
})();
