import steamAPI from "./steamAPI.js";
const steamAPI = new steamAPI

function setup() {
  createCanvas(400, 400);
  var steamAPI = new steamAPI()
  const list = steamAPI.getOwnedGames();
  console.log(list);
}

function draw() {
  background(220);

}

