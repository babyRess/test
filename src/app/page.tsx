'use client'; // Add this line at the top to mark this as a client component

import axios from 'axios';
import { useState, useEffect } from 'react';

interface UserInfo {
  id: string;
  username: string;
  // Add more fields if necessary
}

export default function Home() {
  const [gameUrl, setGameUrl] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined);

  useEffect(() => {
    const queryString = window.location.href;
    const urlParams = new URLSearchParams(queryString.split('#')[1]);
    const tgWebAppData = urlParams.getAll('tgWebAppData');
    const data = new URLSearchParams(tgWebAppData[0]);
    const user = data.get('user');
    console.log(user);
    if (user) {
      const parsedUser: UserInfo = JSON.parse(user);
      setUserInfo(parsedUser);
    } else {
      setUserInfo(undefined);
    }
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.username) {
      getToken(userInfo.username);
    }
  }, [userInfo]);

  const getToken = async (username: string) => {
    const url = 'https://api.g1388.makethatold.com/lotee';
    const params = {
      brand: 'demo',
      currency: 'BDT',
      display_name: username,
      env: 'uat',
      locale: 'en',
      username,
    };

    try {
      const response = await axios.get(url, { params });
      const token = parseToken(response.data);
      if (token) {
        await createSession(token);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const parseToken = (htmlContent: string) => {
    const tokenRegex = /lotee\.init\("([^"]+)"/;
    const match = htmlContent.match(tokenRegex);
    return match ? match[1] : '';
  };

  const createSession = async (sessionToken: string) => {
    const url = 'https://api.g1388.makethatold.com/api/lotee/sessions';
    const data = { token: sessionToken };

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
      });
      await getLotee(response.data.player.token);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const getLotee = async (token: string) => {
    const url = 'https://api.g1388.makethatold.com/lotee/lobby';
    const params = {
      token,
      gameIdentifier: 'fortune_wheel',
      brand: 'demo',
      brandStyling: 'demo',
    };

    try {
      const response = await axios.get(url, { params });
      const urlGame = await extractGameUrl(response.data);
      const tokenPattern = /token=([^&]+)/;
      const tokenDemo = urlGame.match(tokenPattern);

      if (tokenDemo && tokenDemo[1]) {
        const constructedUrl = `https://staging-acegames.tongitroyals.com/ace/1727247640704/build/web-mobile-001/index.html?gameIdentifier=fortune_wheel&currency=demo_voucher_bdt&version=1727247640704&api_endpoint=https://api.g1388.makethatold.com/api&socket_endpoint=https://api.g1388.makethatold.com&brand=demo&brandStyling=demo&token=${tokenDemo[1]}&inGameCSS=%23splash+%7B%0A++background%3A+%23191b18+url%28https%3A%2F%2Fstaging-acegames.tongitroyals.com%2Fuploads%2Flocale_assets%2Fdemo_voucher_bdt%2Fsplash_screen%2Fen%2F2aabcf024a56ca500b816a48d9c07585.png%29+no-repeat+center+%21important%3B%0A%7D`;
        setGameUrl(constructedUrl);
      }
    } catch (error) {
      console.error('Error fetching lobby data:', error);
    }
  };

  const extractGameUrl = (htmlContent: string) => {
    const srcRegex = /<iframe[^>]+src=['"]([^'"]+)['"]/;
    const match = htmlContent.match(srcRegex);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (gameUrl) {
      window.location.href = gameUrl; // Redirect to the game URL
    }
  }, [gameUrl]);

  return (
    <div>
      <h1>Loading....</h1>
    </div>
  );
}
