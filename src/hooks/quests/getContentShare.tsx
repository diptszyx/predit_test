import { useEffect, useState } from 'react';
import { ContentShareResponse, getContentShare } from '../../services/quest.service';

const useGetContentShare = () => {
  const [content, setContent] = useState<ContentShareResponse>();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await getContentShare()
      setContent(res);
    } catch (err) {
      console.error('Failed to fetch content share:', err);
    } finally {
      setLoading(false);
    }
  }
  return { content }
}

export default useGetContentShare
