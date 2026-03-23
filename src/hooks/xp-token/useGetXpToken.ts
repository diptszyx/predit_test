import { useEffect, useState } from "react";
import { getXpTokenBalance } from "../../services/claim-token.service";

const useGetXpToken = () => {
  const [xpToken, setXpToken] = useState(0);
  const fetchPreditXpToken = async () => {
    try {
      const xpToken = await getXpTokenBalance();
      setXpToken(xpToken.balance);
    } catch (error) {
      console.log("Failed to fetch xp token", error);
    }
  };

  useEffect(() => {
    fetchPreditXpToken();
  }, []);

  return { xpToken };
};

export default useGetXpToken;
