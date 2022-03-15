
// eslint-disable-next-line no-console
const log = { debug: console.log, error: console.error };

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'image-to-data-url') {
    log.debug('received request for image-to-data-url');
    const dataUrl = await imageUrlToDataUrl(request.url);
    sendResponse({ dataUrl });
  }
});

const imageUrlToDataUrl = async imgUrl => {
  try {
    const response = await fetch(imgUrl);
    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(response.blob);
    });
    return dataUrl;
  }
  catch (error) {
    log.error(error);
  }
};
