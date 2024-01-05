const steamAPI = new steamAPI_
var cloud

var data = []
//存放每個tag出現次數、累計價格、遊玩時數
var tags = [];
//計算帳號總價值
var accountValue;
//計算帳號總遊玩時數
var accountPlayTimes;

var img;

//總頁數
const pages = 6;
//當前頁面
var nowPage = 1;
//上次切換時間
var lastTime = 0;
//轉場用
var switchPage = 16;
var lastPage;

function preload() {
  // Creates a p5.Font object.
  font = loadFont('./NotoSansTC-Black.ttf');
  img = loadImage('./steam.png')
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  background(27,40,56)
  data = await getSteamInv()
  cloud = new Cloud(tags, height/2*0.75)
  textFont(font);
}

function draw() {
  translate(width/2, height/2);
  switch(nowPage){
    case -1:
      if(switchPage < 30){
        background(27,40,56,256/60*switchPage)
        switchPage++
      }else{
        //頁數改變
        switchPage = 0;
        background(27,40,56)
        if (lastPage < pages){
          nowPage = lastPage + 1;
        } else {
          nowPage = 0;
        }
      }
      break
    case 1:
      background(27,40,56)
      page1()
      break
    case 2:
      background(27,40,56)
      page2()
      break
    case 3:
      background(27,40,56)
      page3()
      break
    case 4:
      background(27,40,56)
      page4()
      break
    case 5:
      background(27,40,56)
      page5()
      break
    case 6:
      background(27,40,56)
      page6()
      break
    case 7:
      background(27,40,56)
      page7()
    default:
      console.log("errorPage")
  }
  console.log(nowPage)
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

function page1(){
  midBottomText("Steam Library Analyzer",100)
  let imgH = height*0.6
  image(img,-imgH/2,-imgH/1.5, imgH,imgH)
}

function page2(){
  bigNumber((accountPlayTimes/60).toFixed(2),400)
  midTopText("總遊玩時數",100)
}

function page3(){
  bigNumber(`$${accountValue.toFixed(0)}`,350)
  midTopText("帳號總價值",100)
}

function page4(){
  midBottomText(`你擁有的最多遊戲標籤是${123}`,80)
  translate(0,-height/2*0.15)
  cloud.drawCloud("count")
}

function page5(){
  midBottomText(`你花最多錢的遊戲標籤是${123}`,80)
  translate(0,-height/2*0.15)
  cloud.drawCloud("lowestPrice")
}

function page6(){
  midBottomText(`你花最多時間的遊戲標籤是${123}`,80)
  translate(0,-height/2*0.15)
  cloud.drawCloud("playTimes")
}

function page7(){
  
}

function bigNumber(num,size){
  textSize(size)
  fill(240)
  textAlign(CENTER)
  text(num,0,height*0.2)
}

function midBottomText(textIn,size){
  textSize(size)
  fill(240)
  textAlign(CENTER)
  text(textIn,0,height*0.4)
}

function midTopText(textIn,size){
  textSize(size)
  fill(240)
  textAlign(CENTER)
  text(textIn,0,-height*0.35)
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
  
