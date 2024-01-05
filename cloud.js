class Cloud{
    constructor(data,r){
        this.data = data;
        this.r = r;

        this.maxSize = {
            "count" : this.findMaxSize("count"),
            "lowestPrice" : this.findMaxSize("lowestPrice"),
            "playTimes" : this.findMaxSize("playTimes")
        }

        this.cloudData = {
            "count" : this.createCloud("count"),
            "lowestPrice" : this.createCloud("lowestPrice"),
            "playTimes" : this.createCloud("playTimes")
        }
    }

    findMaxSize(category){
        let maxSize = 0;
      
        for (var key in this.data) {
            if (this.data.hasOwnProperty(key)) {
              var size = this.data[key][category];
              
              // 检查是否是更大的count
              if (size > maxSize) {
                maxSize = size;
              }
            }
          }
        return maxSize
      }
    //創建雲
    createCloud(category,maxTextSize = 90,minsize = 10) {
        //儲存已放置的字
        var words = [];

        // 迴圈處理每個數據點
        for (var key in this.data) {
            let nData = this.data[key]
            var tryTimes = 0; 
            do {
                // 如果嘗試次數超過 5000 次，則記錄失敗信息並跳出迴圈
                if (tryTimes == 5000) {
                    console.log("gave up at '" + key + "'");
                    break;
                }   
                tryTimes++;
        
                // 計算單詞的位置和大小
                var size = (nData[category]/this.maxSize[category]) * maxTextSize+minsize;

                textSize(size);
                var wWidth = textWidth(key);
                var x = random(-this.r, this.r - wWidth);
                var d = floor(sqrt(pow(this.r, 2) - pow(x, 2))); // x^2 + y^2 < r^2
                var y = random(-d + size, d);
            
                // 檢查單詞是否位於圓形內以及是否與其他單詞重疊
                var circleCond1 = (pow(x+wWidth, 2) + pow(y-size, 2)) < pow(this.r, 2);
                var circleCond2 = (pow(x+wWidth, 2) + pow(y, 2)) < pow(this.r, 2);
                var circleCond = circleCond1 && circleCond2;

            } while (circleCond && (Object.keys(words).length <= 0 || this.isOverlapping(x, y, wWidth, size, words)));
        
            // 創建 Word 對象，表示單詞的位置，大小和其他屬性
            words[key] = new Word(x, y, key, size, nData);
        }
        return words
    }

    drawCloud(category) {
        // 如果取消註釋，則繪製一個圓形（用於檢查文字是否在圓內）。
        //fill(240);
        //ellipse(0, 0, this.r*2, this.r*2);

        textAlign(LEFT)
        let cloudData = this.cloudData[category]
        // 繪製文字
        noStroke();
        for (var key in cloudData){
            textSize(cloudData[key].size);
            var wWidth = textWidth(key);
            
            // 如果取消註釋，可以查看文字高亮效果
            // fill(0);
            // rect(cloudData[key].x, cloudData[key].y + cloudData[key].size*0.2, wWidth, -cloudData[key].size);
        
            // 使用隨機顏色繪製文字
            fill(cloudData[key].color.r);
            text(cloudData[key].text, cloudData[key].x, cloudData[key].y);
        }
    }
    
    // 檢查文字是否與其他文字重疊
    isOverlapping(x, y, wWidth, wHeight, others) {
      
        // 迴圈檢查其他文字是否和目前的文字重疊
        for (var key in others) {
            var oWidth = textWidth(others[key].text);
            // 檢查兩個文字的邊界是否相交，如果相交，表示文字重疊


            if (x + wWidth > others[key].x && //右邊界
                x < others[key].x + oWidth && //左邊界
                y + wHeight*0.5  > others[key].y - others[key].size*2 && 
                y - wHeight < others[key].y) {
                return true;
            }
        }
        return false;
    }
}

function Word(x, y, key, size, data) {
    this.x = x;
    this.y = y;
    this.text = key;
    this.size = size;
    this.color = {
        r: random(130, 250),
        g: random(255),
        b: random(255)
    };
}