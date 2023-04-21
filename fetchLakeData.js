import axios from "axios";

const ROOT_URL = "https://maps1.dnr.state.mn.us/cgi-bin/lakefinder_json.cgi";

export default async () => {
  const fetchCalls = [];

  for (let i = 1; i <= 87; i++) {
    const url = new URL(ROOT_URL);
    url.searchParams.append("county", i);
    fetchCalls.push(axios.get(url));
  }

  const lakeData = await Promise.all(fetchCalls).then((responses) => {
    return responses
      .map((response) => {
        return response.data.results;
      })
      .flat(Infinity);
  });
  return lakeData;
};
