const sharp = require('sharp');
const uuid = require('uuid');
const path = require('path');

class Resize {
  constructor(folder, fileName) {
    this.folder = folder;
    this.fileName = fileName;
  }
  async save(buffer) {
    const filepath = this.filepath(this.fileName);
    await sharp(buffer).toFile(filepath);
    return filepath;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }
}
module.exports = Resize;
