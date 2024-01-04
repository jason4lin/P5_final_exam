const steamAPI = new steamAPI_
var cloud

var data = []
//存放每個tag出現次數、累計價格、遊玩時數
var tags = [];
//計算帳號總價值
var accountValue;
//計算帳號總遊玩時數
var accountPlayTimes;

//總頁數
const pages = 6;
//當前頁面
var nowPage = 0;
//上次切換時間
var lastTime = 0;


async function setup() {
  createCanvas(windowWidth, windowHeight);
  data = await getSteamInv()
  cloud = new Cloud(tags, height/2)
}

function draw() {
  background(100)
  switch(nowPage){
    case 1:
      text(nowPage,width/2,height/2)
      translate(width/2, height/2);
      cloud.drawCloud("count")
    case 2:
      text(nowPage,width/2,height/2)

    case 3:
      text(nowPage,width/2,height/2)

    case 4:
      text(nowPage,width/2,height/2)

    case 5:
      text(nowPage,width/2,height/2)

    case 6:
      text(nowPage,width/2,height/2)

    default:
  }
}

//滑鼠點一下換一頁
function mouseClicked() {
  let nowTime = Date.now();
  //1秒只能點一下
  if (nowTime > lastTime+1000){
    lastTime = nowTime;
    //頁數改變
    if (nowPage < pages){
      nowPage++;
    } else {
      nowPage =0;
    }
  }
}

async function getSteamInv() {
  const list = (await steamAPI.getOwnedGames()).response.games;

  
  for (let index = 0; index < 5; index++) {
    const e = list[index];
    const id = e.appid

    const response = await steamAPI.appDetails(id);

    if (response && response[id] && response[id].success) {
      const appStoreInfo = response[id].data;
      const tag = []
      appStoreInfo.categories.forEach(e => {
        tag.push(e.description)
      });
      appStoreInfo.genres.forEach(e => {
        tag.push(e.description)
      });

      const newE = {...e, 
        name:appStoreInfo.name, 
        initPrice:appStoreInfo.price_overview.initial_formatted, 
        lowestPrice:appStoreInfo.price_overview.final_formatted,
        tag:tag
      }
      list[index]=newE
      console.log(list[index])
      console.log(list[index].tag)
    }
    setTimeout(() => {}, 1000);
  }
  console.log(list)

  analysisGames(list)
}

  function analysisGames(data){
  
      data.forEach(game => {
          let lowestPrice = parseInt(game.lowestPrice.match(/\d+/));
          accountValue+=lowestPrice;
          accountPlayTimes+=game.playtime_forever;
          game.tag.forEach(tag => {
              if(tags[tag] === undefined){
                  tags[tag] = {count: 1, lowestPrice: lowestPrice, playTimes: game.playtime_forever};
              }else{
                  tags[tag].count++;
                  tags[tag].lowestPrice+=lowestPrice;
                  tags[tag].playTimes+=game.playtime_forever;
              }
          })
      });
  }
  
