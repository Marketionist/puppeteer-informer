# puppeteer-informer

[![Build Status](https://travis-ci.org/Marketionist/puppeteer-informer.svg?branch=master)](https://travis-ci.org/Marketionist/puppeteer-informer)
[![NPM License](https://img.shields.io/github/license/Marketionist/puppeteer-informer.svg)](https://github.com/Marketionist/puppeteer-informer/blob/master/LICENSE)

Puppeteer Informer is a Node.js script that scrapes information from a provided website using Chrome or
Chromium. For now only scraping weather from accuweather.com is supported - for selectors and actions see
[`accuweatherPage` and `parseWeather`](https://github.com/Marketionist/puppeteer-informer/blob/master/page_objects/accuweather.page.js).

## Supported versions
[Node.js](http://nodejs.org/):
- 8.x
- 9.x
- 10.x
- 11.x
- 12.x

## ❯ Installation
```
git clone https://github.com/Marketionist/puppeteer-informer.git
cd puppeteer-informer/
npm install
```

## ❯ Usage
Just run in terminal:

```
node index.js https://www.accuweather.com/en/europe-weather png
```

Where:
- the 2nd argument is mandatory - it should be a URL (for example from accuweather.com) to parse
- the 3rd argument is optional - it can be `png` or `pdf` to save a screenshot of the page in provided format

Then select a city you want to fetch in the console. To skip the city selection just add `--yes` flag like this:

```
node index.js --yes https://www.accuweather.com/en/europe-weather png
```

Also you can skip selection and set the city via prepending `CITY` parameter:

```
CITY='Amsterdam' node index.js --yes https://www.accuweather.com/en/europe-weather png
```

> To emulate devices see `emulate()` in [article 1](https://flaviocopes.com/puppeteer/) or
> [article 2](https://www.aymen-loukil.com/en/blog-en/google-puppeteer-tutorial-with-examples/) and
> [a full list of devices](https://github.com/GoogleChrome/puppeteer/blob/master/lib/DeviceDescriptors.js)

## Thanks
If this script was helpful for you, please give it a **★ Star**
on [github](https://github.com/Marketionist/puppeteer-informer)
