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
//轉場用
var switchPage = 16;
var lastPage;

function preload() {
  // Creates a p5.Font object.
  font = loadFont('./NotoSansTC-Black.ttf');
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  data = await getSteamInv()
  cloud = new Cloud(tags, height/2)
  textFont(font);
  background(27,40,56)
  textSize(100)
}

function draw() {
  switch(nowPage){
    case -1:
      if(switchPage < 30){
        background(27,40,56,256/30*switchPage)
        switchPage++
      }else{
        //頁數改變
        switchPage = 0;
        if (lastPage < pages){
          nowPage = lastPage + 1;
        } else {
          nowPage = 0;
        }
        background(27,40,56)
      }
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
    lastPage = nowPage;
    nowPage = -1;
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
  console.log(list.length)

  const promises = list.map(e => getGameDetails(e));

  // 等待所有异步操作完成
  const newlist = await Promise.all(promises);
  
  console.log(newlist)
  analysisGames(newlist)
}


async function getGameDetails(e) {
  const id = e.appid;
  console.log(id);

  try {
    const response = await steamAPI.appDetails(id);

    if (response && response[id] && response[id].success) {
      const appStoreInfo = response[id].data;

      const tag = [];
      if (appStoreInfo.categories) {
        appStoreInfo.categories.forEach(e => {
          tag.push(e.description);
        });
      }
      if (appStoreInfo.genres) {
        appStoreInfo.genres.forEach(e => {
          tag.push(e.description);
        });
      }

      const initPrice = appStoreInfo.price_overview ? appStoreInfo.price_overview.initial : 0;
      const lowestPrice = appStoreInfo.price_overview ? appStoreInfo.price_overview.final : 0;

      return {
        ...e,
        name: appStoreInfo.name,
        initPrice: initPrice,
        lowestPrice: lowestPrice,
        tag: tag
      };
    } else {
      return e;
    }
  } catch (error) {
    console.error('Error fetching game details:', error);
    return e;
  }
}


function analysisGames(list) {
  accountValue = 0; 
  accountPlayTimes = 0; 

  list.forEach(game => {
    if (game && game.tag && Array.isArray(game.tag)) {
      let lowestPrice = parseInt(game.lowestPrice);
      accountValue += lowestPrice;
      accountPlayTimes += game.playtime_forever;

      game.tag.forEach(tag => {
        if (tags[tag] === undefined) {
          tags[tag] = { count: 1, lowestPrice: lowestPrice, playTimes: game.playtime_forever };
        } else {
          tags[tag].count++;
          tags[tag].lowestPrice += lowestPrice;
          tags[tag].playTimes += game.playtime_forever;
        }
      });
    }
  });
}
  
