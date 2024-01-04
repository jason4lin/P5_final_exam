const steamAPI = new steamAPI_

//總頁數
const pages = 6;
//當前頁面
var nowPage = 0;
//上次切換時間
var lastTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(100)
  getSteamInv()
}

function draw() {
  background(100)
  switch(nowPage){
    case 1:
      text(nowPage,width/2,height/2)

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

}