import express from 'express';
import axios from 'axios';
import cors from 'cors';
const app = express();
app.use(cors());
let integer = 0


const fetchCFContests = async () => {
  const response = await axios.get('https://codeforces.com/api/contest.list');
  const oneYearAgo = new Date();
  oneYearAgo.setMonth(oneYearAgo.getMonth() - 1);
  response.data.result = response.data.result.filter(contest => new Date(contest.startTimeSeconds * 1000) >= oneYearAgo);
  return response.data.result.map(contest => ({
    key: integer++,
    id: contest.id.toString(),
    name: contest.name.toString(),
    startTime: new Date(Date.now() - 86400000).toISOString(), // yesterday
    url: `https://codeforces.com/contest/${contest.id}`,
    duration: new Date(Date.now() - 86400000).toISOString(),
    platform: 'codeforces'
  }));
}

const fetchCCContests = async () => {
  const response = await axios.get('https://www.codechef.com/api/list/contests/all');
  return response.data.future_contests.map(contest => ({
    key: integer++,
    id: contest.code,
    name: contest.contest_name,
    url: `https://www.codechef.com/${contest.contest_code
      }`,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    duration: contest.contest_duration.toString(),
    platform: 'codechef'
  }));
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
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  response.data.data.allContests = response.data.data.allContests.filter(contest => new Date(contest.startTime * 1000) >= oneMonthAgo);
  return response.data.data.allContests.map(contest => ({
    key: integer++,
    id: contest.titleSlug,
    name: contest.title,
    startTime: new Date(Date.now() - 86400000).toISOString(),
    url: `https://leetcode.com/contest/${contest.titleSlug}`,
    duration: contest.duration.toString(),
    platform: 'leetcode'
  }));
}

export const fetchContests = async () => {
  const cfContests = await fetchCFContests();
  const ccContests = await fetchCCContests();
  const lcContests = await fetchLCContests();
  const contests = [...cfContests, ...ccContests, ...lcContests];
  return contests;
}

app.get('/contests', async (req, res) => {
  try {
    const contests = await fetchContests();
    return res.json(contests);
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
app.get('/', (req, res) => {
  res.send('Hello, the server is working!');
});
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});