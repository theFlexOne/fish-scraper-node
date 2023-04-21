import fs from "fs";

import fetchLakeDataList from "./fetchLakeData.js";
import { fetchFishDataList } from "./fetchFishData.js";

const fishData = fs.readFileSync("fishData.json", "utf8");
fishData.data.forEach((fish) => {
  const habitats = fish.geography.habitat.split(", ");
  fish.geography.habitat = habitats;
});
fs.writeFileSync("fishData.json", JSON.stringify(fishData, null, 2));
