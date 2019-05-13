# puppeteer-informer

[![Build Status](https://travis-ci.org/Marketionist/puppeteer-informer.svg?branch=master)](https://travis-ci.org/Marketionist/puppeteer-informer)
[![NPM License](https://img.shields.io/github/license/Marketionist/puppeteer-informer.svg)](https://github.com/Marketionist/puppeteer-informer/blob/master/LICENSE)

Puppeteer Informer is a Node.js script which provides a way to scrape information from any website using Chrome or Chromium

## Supported versions
[Node.js](http://nodejs.org/):
- 8.x
- 9.x
- 10.x
- 11.x

## Installation
`npm install`

## Usage
Just run in terminal:

```
node index.js https://www.accuweather.com/en/nl/amsterdam/249758/daily-weather-forecast/249758 png
```

Where:
- the 2nd argument is mandatory - it should be a URL (for example from accuweather.com) to parse
- the 3rd argument is optional - it can be `png` or `pdf` to save a screenshot of the page in provided format

## Thanks
If this script was helpful for you, please give it a **★ Star**
on [github](https://github.com/Marketionist/puppeteer-informer)
