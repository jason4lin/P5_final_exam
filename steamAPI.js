class sendRequest {
  constructor() {
    this.key = "7A1DF9F12E6E73FF0B11DAF38666C1B8";
    this.steamID = "76561198151206920";
    this.retryDelay = 1000;

    this.optionsget = {
      method: "get",
      headers: {
        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      mode: 'cors'
    };

    this.optionspost = {
      method: "post",
      headers: {
        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      mode: 'cors'
    };
  }

  setOptions(method, data) {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        token: this.token,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      mode: 'cors'
    };

    if (method !== "get" && method !== "head") {
      options.body = JSON.stringify(data);
    }

    return options;
  }

  async fetchData(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorBody = await response.text();
      console.log(errorBody);
      throw new Error(`${response.status}: ${errorBody}`);
    }
    return response.headers.get("Content-Type").includes("application/json")
      ? response.json()
      : response.text();
  }

  async fetchDataWithRetry(url, options, maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchData(url, options);
      } catch (error) {
        console.error(
          `Attempt ${attempt} - Error:${error.status} ${error.message}`
        );
        if (attempt === maxRetries) throw new Error("Max retries reached.");
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempt)
        );
      }
    }
  }
}

class steamAPI_ extends sendRequest {
  constructor(token, retryDelay) {
    super(token, retryDelay);
    //this.token = token;
  }

  getOwnedGames() {
    const options = this.optionsget;
    return super
      .fetchDataWithRetry(`https://p5-final-exam-back-tend.vercel.app/api/proxy/getSteamInv?key=${this.key}&steamID=${this.steamID}`, options)
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("forge start Error:", error.message);
        throw error;
      });
  }

  appDetails(appid) {
    const options = this.optionsget;
    return super
      .fetchDataWithRetry(`https://p5-final-exam-back-tend.vercel.app/api/proxy/getStore?appid=${appid}`, options)
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("forge start Error:", error.message);
        throw error;
      });
  }

}
