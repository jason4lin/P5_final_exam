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

var isLoading = true;

let input, button;

//總頁數
const pages = 7;
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
  img = loadImage('./steam.png')
}

async function setup() {
  createCanvas(windowWidth, windowHeight);
  background(27,40,56)

  input = createInput('76561198122456037'); 
  button = createButton('submit');

  input.position(windowWidth/2-(input.width+button.width)/2, windowHeight/2);
  input.hide(); 

  button.position(input.x + input.width, input.y);
  button.mousePressed(updateSteamID);
  button.hide(); 

  // data = await getSteamInv()
  // isLoading = false;
  // cloud = new Cloud(tags, height/2*0.75)
  textFont(font);
}

function draw() {
  if(nowPage === 0){
    background(27,40,56)
    input.show();
    button.show();
  } else if (isLoading) {
    displayLoadingAnimation();
    input.hide();
    button.hide();
  } else {
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
            nowPage = 1;
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
        //page7()
        break;
      default:
        console.log("errorPage")
    }
    console.log(nowPage)
  }
}

async function updateSteamID() {
  steamAPI.steamID = input.value(); // 更新 Steam ID
  await loadData(); // 加载数据
  findMoneySpentHour()
}

async function loadData() {
  isLoading = true;
  nowPage = -1;
  data = await getSteamInv();
  isLoading = false;
  nowPage = 1;
  cloud = new Cloud(tags, height/2*0.75)
}

function displayLoadingAnimation() {
  push ();
    translate(width/2, height/2);
    rotate (frameCount * 0.1);
    noFill ();
    strokeWeight (20);
    stroke ("grey");
    ellipse (0, 0, 200, 200);
  
    noFill ();
    stroke ("white");
    strokeWeight (20);
    arc (0, 0, 200, 200, 0, 90);
  pop ();
}

//滑鼠點一下換一頁
function mouseClicked() {
  let nowTime = Date.now();
  //1秒只能點一下
  if(nowPage != 0){
    if (nowTime > lastTime+1000){
      lastTime = nowTime;
      lastPage = nowPage;
      nowPage = -1;
    }
  }
}

function page1(){
  midBottomText("Steam Library Analyzer",100)
  let imgH = height*0.6
  image(img,-imgH/2,-imgH/1.5, imgH,imgH)
}

function page2(){
  bigNumber((accountPlayTimes/60).toFixed(2),400)
  midTopText("總遊玩時數(hr)",100)
}

function page3(){
  bigNumber(`$${accountValue.toFixed(2)}`,350)
  midTopText("帳號總價值(USD)",100)
}

function page4(){
  let big = findBigger("count")
  midBottomText(`你擁有的最多遊戲標籤是${big[1]}，共有${big[0]}款`,60)
  translate(0,-height/2*0.15)
  cloud.drawCloud("count")
}

function page5(){
  let big = findBigger("lowestPrice")
  midBottomText(`你花最多錢的遊戲標籤是${big[1]}，共花了$${(big[0]/100)} USD`,60)
  translate(0,-height/2*0.15)
  cloud.drawCloud("lowestPrice")
}

function page6(){
  let big = findBigger("playTimes")
  midBottomText(`你花最多時間的遊戲標籤是${big[1]}，共花了${(big[0]/60).toFixed(2)}小時`,60)
  translate(0,-height/2*0.15)
  cloud.drawCloud("playTimes")
}

function page7(){
  let maxMoneySpentHour = findBigger('moneySpentHour')[0];
  let i = 1;
  let tagsLenght = Object.keys(tags).length
  let wSpace = width/tagsLenght;
  for (var key in tags) {

    let barHeight = map(tags[key].moneySpentHour, 0, maxMoneySpentHour, 0, height - 50)
    fill(240);
    rect(i * 60 + 50, height - barHeight, 40, barHeight);

    // 在長條圖上方標示類別名稱
    textAlign(CENTER, CENTER);
    text(key, i * 60 + 70, height - 20);

    // 在長條圖上方標示數值
    text(moneySpentHour.toFixed(2), i * 60 + 70, height - barHeight - 10);

    i++
  }
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
      // if (appStoreInfo.categories) {
      //   appStoreInfo.categories.forEach(e => {
      //     tag.push(e.description);
      //   });
      // }
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
        // lowestPrice: lowestPrice,
        lowestPrice: initPrice,
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

  accountValue = accountValue/100
}
  
function findBigger(category){
  let big = 0;
  let bigTag;
  for(var key in tags){
    let tag = tags[key]
    if(tag[category] > big){
      big = tag[category]
      bigTag = key
    }
  }
  return [big,bigTag]
}

function findMoneySpentHour(){
  for(var key in tags){
    let msh 
    if(tags[key].playTimes == 0){
      msh = (tags[key].lowestPrice/100) / 0.1
    }else{
      msh = (tags[key].lowestPrice/100) / (tags[key].playTimes/60)
    }
    tags[key].moneySpentHour = msh.toFixed(2)
  }
}