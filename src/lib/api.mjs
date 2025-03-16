import express from 'express';
import axios from 'axios';
import cors from 'cors';
const app = express();
app.use(cors());
axios.defaults.headers.post['Content-Type'] ='application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
app.use(express.json());
const adjustContestData = (data, platform) => {
  if (platform === 'codeforces') {
    return data.map((contest) => ({
      "id": contest.id,
      "name": contest.name,
      "startTime": contest.startTimeSeconds * 1000,
      "duration": contest.durationSeconds,
      "link": `https://codeforces.com/contest/${contest.id}`,
    }));
  } else if (platform === 'codechef') {
    return data.map((contest) => ({
      "id": contest.code,
      "name": contest.name,
      "startTime": new Date(contest.startDate).getTime(),
      "duration": contest.endDate - contest.startDate,
      "link": `https://www.codechef.com/${contest.code}`,
    }));
  } else if (platform === 'leetcode') {
    return data.map((contest) => ({
      "id": contest.titleSlug,
      "name": contest.title,
      "startTime": contest.startTime * 1000,
      "duration": contest.duration,
      "link": `https://leetcode.com/contest/${contest.titleSlug}`,
    }));
  }
}
const fetchCFContests = async () => {
  const response = await axios.get('https://codeforces.com/api/contest.list');
  const adjustedData = adjustContestData(response.data.result, 'codeforces');
  console.log(adjustedData);
  return adjustedData.json();
}
const fetchCCContests = async () => {
  const response = await axios.get('https://www.codechef.com/api/list/contests/all');
  return response;
}
const fetchLCContests = async () => {

    const graphqlQuery = {
      query: `
        query getContestList {
          allContests {
            title
            startTime
            duration
            titleSlug
          }
        }
      `
    };

    
    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return adjustContestData(response.data.data.allContests, 'leetcode');
}
const fetchContests = async () => {
  const cfContests = await fetchCFContests();
  const ccContests = await fetchCCContests();
  const lcContests = await fetchLCContests();
  const contests = {
    codeforces: cfContests.data.result,
    codechef: ccContests.data,
    leetcode: lcContests.data.data.allContests,
  };
  return contests;
}
app.get('/contests', async (req, res) => {
  try {
    const contests = await fetchContests();
    res.json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contests' });
  }
});
app.get('/contests/:platform', async (req, res) => {
  const platform = req.params.platform;
  try {
    let contests;
    if (platform === 'codeforces') {
      contests = await fetchCFContests();
    } else if (platform === 'codechef') {
      contests = await fetchCCContests();
    } else if (platform === 'leetcode') {
      contests = await fetchLCContests();
    } else {
      res.status(404).json({ message: 'Platform not found' });
    }
    res.json(contests.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contests' });
  }
});
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});