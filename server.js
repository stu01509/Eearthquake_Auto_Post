// Loading Modules
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const graph = require('fbgraph');

const earthquake = function () {
  request({
    url: "http://www.cwb.gov.tw/V7/modules/MOD_EC_Home.htm",
    method: "GET"
  }, function (error, response, body) {
    if (error || !body) {
      return;
    }
    const $ = cheerio.load(body);
    const result = []; // Save all result
    const urls = []; // Save url to check file exist 
    const table_tr = $(".BoxTable tr");
    for (let i = 1; i < 11; i++) {
      const table_td = table_tr.eq(i).find('td');
      const time = table_td.eq(1).text(); // time (台灣時間)
      const latitude = table_td.eq(2).text(); // latitude (緯度)
      const longitude = table_td.eq(3).text(); // longitude (經度)
      const amgnitude = table_td.eq(4).text(); // amagnitude (規模)
      const depth = table_td.eq(5).text(); // depth (深度)
      const location = table_td.eq(6).text(); // location (位置)
      const url = table_td.eq(7).text(); // url (網址)
      const pic = 'http://www.cwb.gov.tw/V7/earthquake/Data/local/' + url.slice(0, 14) + 'gif'; // pic 圖片報告
      const pic_quake = 'http://www.cwb.gov.tw/V7/earthquake/Data/quake/' + url.slice(0, 15) + '.gif';
      // 建立物件並(push)存入結果
      result.push(Object.assign({
        time,
        latitude,
        longitude,
        amgnitude,
        depth,
        location,
        url,
        pic,
        pic_quake,
      }));
      urls.push(Object.assign({
        url,
      }));
    }
    console.log('\x1b[42m', '爬蟲執行完成!');

    // Check file exist 
    for (j = 0; j < urls.length; j++) {
      if (fs.existsSync('Data/' + urls[j].url + ".json")) {} else {
        fs.writeFile('Data/' + urls[j].url + ".json", JSON.stringify(result[j])); // Write file and save a json file
        //4/15到期
        let Post = '🕔時間:' + result[j].time + '\r\n\r\n ' + '🎯規模:' + result[j].amgnitude + '  ⚠深度:' + result[j].depth + ' 公里' + '\r\n\r\n ' + '🇹🇼位置:' + result[j].location + '\r\n\r\n ' + '🌐緯度:' + result[j].latitude + '\r\n\r\n ' + '🌐經度:' + result[j].longitude;
        // 小區域地震
        let wallPost_local = {
          message: Post,
          url: result[j].pic
        };
        // quake
        let wallPost_quake = {
          message: Post,
          url: result[j].pic_quake
        };

        graph.setAccessToken('EAAPSuFQJhfYBAAfkX39V2RiqqApSGBp3yQeZBaXsU76q82fdmOkmYkRBjB004RcX4QVQuums5E3cZARHfbDQEutYbQh06fdGGzi0iPgfZCJTujNZCSwPMkPVvooVJZCGbCkP8v5CsbYN8hZBR4fZCHhxABVPxw9ZBvuz3mhV0cSaY9gWeHUo0nxI');
        // 小區域地震
        graph.post("/me/photos", wallPost_local, function (err, res) {
          console.log(res);
        });
        // quake
        graph.post("/me/photos", wallPost_quake, function (err, res) {
          console.log(res);
        });
      }
    }
  });
};
earthquake();
// 每5分爬一次資料
setInterval(earthquake, 5 * 60 * 1000);