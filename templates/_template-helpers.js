'use strict';

const fs = require('fs');
const path = require('path');
const TEMPLATE_DIR = 'templates/';
const PARTIAL_DIR = 'partials/';

/**
 * Get partials from partial directory
 * @param {string} [directory=''] - Child directory name inside partial directory
 * @return {Object} - Object containing all partials
 */
function getPartials(directory = '') {
  const partialsFullDir = process.cwd() + '/' + TEMPLATE_DIR + PARTIAL_DIR + directory;

  const partialsPathList = fs.readdirSync(partialsFullDir);
  return partialsPathList.reduce((acc, partialPath) => {
    try {
      const partialFullPath = partialsFullDir + '/' + partialPath;
      const parsedPartial = path.parse(partialFullPath);
      const partialStat = fs.lstatSync(partialFullPath);
      const isJSFile = partialStat.isFile() && parsedPartial.ext === '.js';

      if (isJSFile) {
        acc[directory + parsedPartial.name] = require(partialFullPath);
      } else if (partialStat.isDirectory()) {
        Object.assign(acc, getPartials(directory + partialPath + '/'));
      }
    } catch (error) {
       console.error(error);
    }
    return acc;
  }, {});
}

const partials = getPartials();

module.exports = {
  partials
};
