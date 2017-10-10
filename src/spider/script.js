const request = require('request');
const fs = require('fs');
const http = require('https');
const cheerio = require('cheerio');
const uuid = require('uuid');
const spg = require('../lib/scriptpg');

const urlLink = 'https://movie.douban.com/celebrity/1003494/';

const fetchPage = (url) => {
  start(url);
};

const downloadPersonImg = (name, addr) => {
  request.get(addr).pipe(fs.createWriteStream(`src/img/person/${name}.png`));
};

const getPageInfo = (listUrl, pageParam) => {
  let item = {};
  // item = await getInfo(listUrl, pageParam, item);
  return new Promise((resolve) => {
    http.get(listUrl, (res) => {
      let html = '';
      res.setEncoding('utf-8'); // 防止中文乱码
      res.on('data', (chunk) => { // 监听data事件，每次取一块数据
        html += chunk;
      });
      res.on('end', () => {
        const $ = cheerio.load(html);
        const numberText =
        $('head title').text().trim();
        const number = parseInt(numberText.replace(/\D/g, ''), 10); // 取电影总数
        const page = Math.ceil(number / 10);
        let count = 10;

        if (page === pageParam) {
          count = number - ((page - 1) * 10);
        }

        const movieArr = [];
        let spanTag = 0;
        for (let i = 0; i < count; i += 1) {
          const mName =
          $('#wrapper #content div[class="grid-16-8 clearfix"] .article .grid_view ul li dl dd h6 a')
          .eq(i).text();

          const subjectIdChar =
          $('#wrapper #content div[class="grid-16-8 clearfix"] .article .grid_view ul li dl dd h6 a')
          .eq(i).attr('href');
          const subjectId = subjectIdChar.replace(/\D/g, '');

          const year =
          $('#wrapper #content div[class="grid-16-8 clearfix"] .article .grid_view ul li dl dd h6 span')
          .eq(spanTag).text();

          const onFlag =
          $('#wrapper #content div[class="grid-16-8 clearfix"] .article .grid_view ul li dl dd h6 span')
          .eq(spanTag + 1).text();
          if (onFlag === '(未上映)') {
            spanTag += 1;
          }

          const job =
          $('#wrapper #content div[class="grid-16-8 clearfix"] .article .grid_view ul li dl dd h6 span')
          .eq(spanTag + 1).text();

          const scoreText = ['#wrapper #content div[class="grid-16-8 clearfix"] .article .grid_view ',
            'ul li dl dd div[class="star clearfix"] span'].join('');
          const score =
          $(scoreText).eq((i * 3) + 1).text();

          const mListItem = {
            mName,
            year,
            job,
            score,
            subjectId
          };
          movieArr.push(mListItem);
          spanTag += 2;
        }
        item = {
          page,
          movie_arr: movieArr
        };
        resolve(item);
      });
    });
  });
};

const getMovieInfo = async (listUrl, personUrl) => {
  let movieItem = [];
  const item = await getPageInfo(listUrl); // 取第一页的10部电影的数据
  movieItem = movieItem.concat(item.movie_arr);
  const page = item.page;
  for (let i = 1; i < page; i += 1) { // 取剩余页面的电影数据
    const start = i * 10;
    const nextUrl = [personUrl, `movies?start=${start}&format=pic&sortby=time&`].join('');
    const nextItem = await getPageInfo(nextUrl, i + 1);
    movieItem = movieItem.concat(nextItem.movie_arr);
  }
  return movieItem;
};

const getPersonInfo = ($) => {
  try {
    const name =
    $('div[id="wrapper"] #content h1').text().trim();

    const birText =
    $('#wrapper #content div[class="grid-16-8 clearfix"] .article .item .info ul li')
    .eq(2).text().trim();
    const birthday = birText.slice(15, birText.length);

    const birPlaceText =
    $('#wrapper #content div[class="grid-16-8 clearfix"] .article .item .info ul li')
    .eq(3).text().trim();
    const birPlace = birPlaceText.slice(14, birPlaceText.length);

    const occuText =
    $('#wrapper #content div[class="grid-16-8 clearfix"] .article .item .info ul li')
    .eq(4).text().trim();
    const occupation = occuText.slice(13, occuText.length);

    const movieListUrl =
    $('#wrapper #content div[class="grid-16-8 clearfix"] .article #recent_movies .hd h2 .pl a')
    .attr('href');

    const imgUrl =
    $('#wrapper #content div[class="grid-16-8 clearfix"] .article .item .pic .nbg')
    .attr('href');

    const personItem = {
      name,
      birthday,
      birPlace,
      occupation,
      movieListUrl,
      imgUrl
    };
    return personItem;
  } catch (err) {
    console.log(err);
    return {};
  }
};

const start = async (url) => {
  http.get(url, (res) => {
    let html = '';
    res.setEncoding('utf-8'); // 防止中文乱码
    res.on('data', (chunk) => { // 监听data事件，每次取一块数据
      html += chunk;
    });
    res.on('end', async () => {
      try {
        const $ = cheerio.load(html);
        const personUuid = uuid();
        const personItem = getPersonInfo($);

        await spg.query(spg.SQL`
          INSERT INTO persons 
          (name, birthday, birth_place, occupation, movielist_url, image_url, uuid)
          VALUES
          (${personItem.name}, ${personItem.birthday}, ${personItem.birPlace}, ${personItem.occupation},
          ${personItem.movieListUrl}, ${personItem.imgUrl}, ${personUuid})
        `);
        downloadPersonImg(personItem.name, personItem.imgUrl);

        const movieItem = await getMovieInfo(personItem.movieListUrl, url);
        console.log('The amount of movies: ', movieItem.length);
        if (!movieItem) {
          console.log('database error, no data!');
        }
        if (movieItem.length === 0) {
          console.log('no movie item!');
        }

        const personData = await spg.query(spg.SQL`
          SELECT id FROM persons WHERE uuid = ${personUuid}
        `);
        const personId = personData[0].id;

        for (const item of movieItem) {
          await spg.query(spg.SQL`INSERT INTO movies (person_id, name, year, person_job, score, subject_id)
          VALUES
          (${personId}, ${item.mName}, ${item.year}, ${item.job}, ${item.score}, ${item.subjectId})`);
        }
        console.log('success!');
        return;
      } catch (err) {
        console.log(err);
      }
    });
  });
};

fetchPage(urlLink);
