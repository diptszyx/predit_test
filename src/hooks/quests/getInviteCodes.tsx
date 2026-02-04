import { useEffect, useState } from 'react';
import { InviteCode, inviteCodeService } from '../../services/invite-code.service';

type GetMyCodeParams = {
  search: string
  page: number
  status?: "used" | "unused" | "all"
  limit: number
}

const useGetInviteCodes = () => {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    setLoading(true);
    try {

      const requestParams = {
        page: 1,
        limit: 10,
        status: "unused",
        search: '',
      } satisfies GetMyCodeParams

      const res = await inviteCodeService.getMyCode(requestParams)
      setCodes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch invite codes:', err);
    } finally {
      setLoading(false);
    }
  }
  return { codes }
}

export default useGetInviteCodes
