import { CircleFadingPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Topic, topicServices } from "../../services/topic-admin.service";
import { Button } from "../ui/button";
import CreateUpdateTopicModal from "./CreateUpdateTopicModal";
import TopicList from "./TopicList";

const TopicPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [listTopic, setListTopic] = useState<Topic[]>([])
  const [loadingTopic, setLoadingTopic] = useState(true)

  const fetchTopics = async () => {
    try {
      const data = await topicServices.getAllTopics();
      if (data) {
        setListTopic(data)
      }
      setLoadingTopic(false)
    } catch (error) {
      console.error("Failed to load topics")
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 lg:p-6 space-y-6 h-full">
        <CreateUpdateTopicModal open={openCreate} onOpenChange={setOpenCreate} onSuccess={fetchTopics} />
        <Button onClick={() => setOpenCreate(true)}>
          <CircleFadingPlus /> Create topic
        </Button>

        <TopicList list={listTopic} fetchTopics={fetchTopics} loading={loadingTopic} />
      </div>
    </div>
  )
}

export default TopicPage
