import axios from "axios";
import { JSDOM } from "jsdom";
import fs from "fs";

const ROOT_URL = "https://www.takemefishing.org";

const parseIdentification = (article) =>
  [...article.querySelectorAll("p")].reduce((acc, p, i, arr) => {
    const text = p.textContent.trim();
    if (text.length === 0) return acc;
    if (i === arr.length - 1) return acc + text;
    return acc + text + "\n";
  }, "");

const parseLocation = (article) => {
  return {
    description: [...article.querySelectorAll("p")].reduce((acc, p, i, arr) => {
      const text = p.textContent.trim();
      if (text.length === 0) return acc;
      if (i === arr.length - 1) return acc + text;
      return acc + text + "\n";
    }, ""),

    items: [...article.querySelectorAll(".links a")].map((link) => {
      return {
        name: link.textContent,
        url: ROOT_URL + link.href,
      };
    }),
  };
};

const parseCatchInstructions = (article) => {
  return {
    description: [...article.querySelectorAll("p")].reduce((acc, p, i, arr) => {
      const text = p.textContent.trim();
      if (text.length === 0) return acc;
      if (i === arr.length - 1) return acc + text;
      return acc + text + "\n";
    }, ""),

    items: [...article.querySelectorAll(".links a")].map((link) => {
      return {
        name: link.textContent,
        url: ROOT_URL + link.href,
      };
    }),
  };
};

const parseBait = (article) => {
  return {
    description: [...article.querySelectorAll("p")].reduce((acc, p, i, arr) => {
      const text = p.textContent.trim();
      if (text.length === 0) return acc;
      if (i === arr.length - 1) return acc + text;
      return acc + text + "\n";
    }, ""),

    items: [...article.querySelectorAll(".links a")].map((link) => {
      return {
        name: link.textContent,
        url: ROOT_URL + link.href,
      };
    }),
  };
};

const scrapeFishDataPage = (fishHtml) => {
  const data = {
    name: fishHtml.querySelector(".info h1").textContent,
    description: fishHtml.querySelector(".info p").textContent,
    imageUrl: ROOT_URL + fishHtml.querySelector(".fish-masthead-img img").src,
  };

  const geography = Object.fromEntries(
    [...fishHtml.querySelectorAll(".geography .geo-col")].map((geoCol) => {
      return [geoCol.children[0].textContent, geoCol.children[1].textContent];
    })
  );
  data.geography = geography;

  const articles = [...fishHtml.querySelectorAll(".article")];

  const idententification = parseIdentification(articles[0]);
  const location = parseLocation(articles[1]);
  const catch_instructions = parseCatchInstructions(articles[2]);
  const bait = parseBait(articles[3]);

  data.identification = idententification;
  data.location = location;
  data.catch_instructions = catch_instructions;
  data.bait = bait;

  return data;
};

const fetchFishData = async (fishUrl) => {
  console.log("Fetching fish data for: " + fishUrl);
  const response = await axios.get(ROOT_URL + fishUrl);
  const { document } = new JSDOM(response.data).window;
  console.log("Fetched fish data for: " + fishUrl);
  return scrapeFishDataPage(document);
};

const fetchFishDataList = async () => {
  const response = await axios.get(ROOT_URL + "/fish-species");
  const { document } = new JSDOM(response.data).window;
  const fishUrls = [...document.querySelectorAll(".fish-dl")].map(
    (fish) => fish.querySelector("a").href
  );
  const fishData = await Promise.all(
    fishUrls.map((fishUrl) => fetchFishData(fishUrl))
  );
  return fishData;
};

const saveFishHtml = async () => {
  const data = fs.readFileSync("fishes.json", "utf8");
  const fishUrls = JSON.parse(data).map((url) => ROOT_URL + url);
  const fishHtmls = await Promise.all(
    fishUrls.map(async (url) => {
      const response = await axios.get(url);
      const fileName = url.split("/").at(-2);
      return { fileName, data: response.data };
    })
  );
  fishHtmls.forEach(({ fileName, data }) => {
    fs.writeFileSync(`./fishHtml/${fileName}.html`, data);
  });
};

export { fetchFishData, fetchFishDataList };
