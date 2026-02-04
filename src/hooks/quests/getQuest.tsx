import { useEffect, useState } from 'react'
import { getQuests, Quest } from '../../services/quest.service'

const useGetQuest = () => {
  const [quests, setQuests] = useState<Quest[]>([])
  const [totalXpEarned, setTotalXpEarned] = useState(0)
  const [totalXpAvailable, setTotalXpAvailable] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    setLoading(true)
    try {
      const { quests, totalXpEarned, totalXpAvailable } = await getQuests()
      setQuests(quests)
      setTotalXpEarned(totalXpEarned ?? 0)
      setTotalXpAvailable(totalXpAvailable ?? 0)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  return {
    quests,
    totalXpEarned,
    totalXpAvailable,
    loading,
    refetch: fetchQuests,
  }
}

export default useGetQuest