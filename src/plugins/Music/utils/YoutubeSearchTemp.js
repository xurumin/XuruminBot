/* eslint-disable no-prototype-builtins */
const axios = require('axios').default;
const scrapper = async params => {
  const results = [];
  let data;

  const html = (await axios
  .get("https://www.youtube.com/results",{
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1"
    },
    params: {
      q: params, page: 1
    }
  })).data

  const parser = data => {
    return {
      id: data.videoId,
      thumbnail:
        data.thumbnail.thumbnails[data.thumbnail.thumbnails.length - 1].url,
      title: data.title.runs[0].text,
      duration: data.lengthText ? data.lengthText.simpleText : 'LIVE',
      url: `https://youtube.com${data.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    };
  };
  try {
    data = JSON.parse(
      html
        .substring(
          html.indexOf('window["ytInitialData"] = '),
          html.indexOf('window["ytInitialPlayerResponse"]')
        )
        .replace('window["ytInitialData"] = ', '')
        .replace(';', '')
    );
  } catch (e) {
    data = JSON.parse(
      html
        .split('ytInitialData = ')[1]
        .split('</script>')[0]
        .replace('// scraper_data_end', '')
        .replace(';', '')
    );
  }
  data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents
    .filter(x => x.hasOwnProperty('itemSectionRenderer'))
    .map(x => x.itemSectionRenderer.contents)[0]
    .filter(x => x.hasOwnProperty('videoRenderer'))
    .forEach(x => results.push(parser(x.videoRenderer)));
  return results;
};
module.exports = scrapper;