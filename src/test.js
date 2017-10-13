const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

function spider(url) {
  http.get(url, function(res) {
    let html = ''; // 用来存储请求网页的整个html内容
    let titles = [];
    res.setEncoding('utf-8'); // 防止中文乱码
    // 监听data事件，每次取一块数据
    res.on('data', function (chunk) {
      html += chunk;
    });

    res.on('end', function () {
      const $ = cheerio.load(html); // 采用cheerio模块解析html


      $('.article-content img').each(function (index, item) {
        const imgtitle = 'test'
        const imgfilename = imgtitle + '.jpg';

        const imgsrc =
        'https://img3.doubanio.com/view/photo/l/public/p2185866487.webp'; // + $(this).attr('src'); // 获取图片的url

        // 采用request模块，向服务器发起一次请求，获取图片资源
        request.head(imgsrc, function (err, res, body) {
          if (err) {
            console.log(err);
          }
        });
        request(imgsrc).pipe(fs.createWriteStream('./image/' + '---' + imgfilename));
      });
    });
  });
}

spider();
