/**
 * Created by axetroy on 2017/7/2.
 */
const path = require('path');
const fs = require('fs-extra');
const postcss = require('postcss');
const precss = require('precss');
const cssnano = require('cssnano');
const Builder = require('../Builder');
const CONFIG = require('../config')();

class CssBuilder extends Builder {
  constructor() {
    super();
    this.name = 'css';
    this.ouputExt =
      CONFIG.type === 'wechat'
        ? '.wxss'
        : CONFIG.type === 'alipay' ? '.axss' : '.css';
  }

  async one(absFile) {
    const relativeFilePath = path.relative(CONFIG.paths.src, absFile);
    const distFilePath = path
      .join(CONFIG.paths.dist, relativeFilePath)
      .replace(/\.scss$/, this.ouputExt)
      .replace(/\.less$/, this.ouputExt)
      .replace(/\.sass$/, this.ouputExt)
      .replace(/\.wxss/, this.ouputExt)
      .replace(/\.axss/, this.ouputExt)
      .replace(/\.css$/, this.ouputExt);

    await fs.ensureFile(distFilePath);

    if (relativeFilePath === 'app.css') {
      await fs.copyFile(absFile, distFilePath);
    } else {
      const result = await postcss(
        [require('postcss-each'), precss()].concat(
          // 生产环境下压缩css
          CONFIG.isProduction ? [cssnano({ preset: 'default' })] : []
        )
      ).process(await fs.readFile(absFile, 'utf8'), {
        from: absFile,
        to: distFilePath
      });

      await fs.writeFile(distFilePath, result.css, 'utf8');
    }
  }
}

module.exports = CssBuilder;
