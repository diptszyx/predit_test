import { useEffect, useState } from "react";
import { User } from "../../lib/types";
import { getXpTokenBalance } from "../../services/claim-token.service";

const useGetXpToken = (user: User | null) => {
  const [xpToken, setXpToken] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchPreditXpToken = async () => {
      try {
        const xpToken = await getXpTokenBalance();
        setXpToken(xpToken.balance);
      } catch (error) {
        console.log("Failed to fetch xp token", error);
      }
    };

    fetchPreditXpToken();
  }, [user]);

  return { xpToken };
};

export default useGetXpToken;
