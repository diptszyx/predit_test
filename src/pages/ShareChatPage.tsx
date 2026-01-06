import clsx from "clsx";
import { Link2Off, MessageSquareShare, Zap } from "lucide-react";
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Markdown from "../components/chat/Markdown";
import HotTakeChatPageList from "../components/hotTake/HotTakeChatPageList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import { News, newsService } from "../services/news.service";
import { getSharedMessage, getShareMarketConversation, getShareMarketMessage, getShareOracleConversation, getSharePolymarketConversation, SharedMessageResponse, ShareType } from "../services/share-message.service";
import { Topic, topicServices } from "../services/topic-admin.service";

const tabs = [
  { id: 'chat', label: 'Shared Message' },
  { id: 'hotTakes', label: 'Hot Takes' },
];

const PAGE_SIZE = 10;

function parseSharePath(pathname: string): { type: ShareType; token: string } | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "share") return null;
  const type = parts[1] as ShareType;
  const token = parts[2];

  if (!token) return null;

  const allowed: ShareType[] = ["message", "oracle-conversation", "market-conversation", "chat", "market-message"];
  if (!allowed.includes(type)) return null;

  return { type, token };
}

const ShareChatPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const parsed = useMemo(() => parseSharePath(pathname), [pathname]);

  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [messages, setMessages] = useState<SharedMessageResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [topicFilter, setTopicFilter] = useState();
  const [newsArticles, setNewsArticles] = useState<News[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [_, setPage] = useState(0);
  const [isLoadingTopicList, setIsLoadingTopicList] = useState(false);

  const [shareError, setShareError] = useState<boolean>(false);


  useEffect(() => {
    if (!parsed || !parsed.type || !parsed.token) {
      setShareError(true);
      setMessages([]);
      return;
    }

    setShareError(false);
    setMessages([]);

    switch (parsed.type) {
      case "message":
        fetchSharedMessage()
        return;
      case "oracle-conversation":
        fetchShareOracleConversation()
        return
      case "market-conversation":
        fetchShareMarketConversation()
        return
      case "market-message":
        fetchShareMarketMessage()
        return
      case "chat":
        fetchSharePolymarketConversation()
        return
      default:
        return
    }
  }, [])

  useEffect(() => {
    loadArticles(true)
  }, [topicFilter])

  // Load default hot takes on mount
  useEffect(() => {
    (async () => {
      try {
        setIsLoadingTopicList(true);
        const topicList = await topicServices.getAllTopics();
        setTopicList(topicList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTopicList(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSharedMessage = async () => {
    if (!parsed) return null;
    try {
      const data = await getSharedMessage(parsed.token)
      setMessages([data])
    } catch (error) {
      console.log('Failed to fetch shared message:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchShareOracleConversation = async () => {
    if (!parsed) return null;
    try {
      const data = await getShareOracleConversation(parsed.token)
      setMessages(data.messages)
    } catch (error) {
      console.log('Failed to fetch shared message:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchShareMarketConversation = async () => {
    if (!parsed) return null;
    try {
      const data = await getShareMarketConversation(parsed.token)
      setMessages(data.messages)
    } catch (error) {
      console.log('Failed to fetch shared message:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchShareMarketMessage = async () => {
    if (!parsed) return null;
    try {
      const data = await getShareMarketMessage(parsed.token)
      setMessages([data])
    } catch (error) {
      console.log('Failed to fetch shared message:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const fetchSharePolymarketConversation = async () => {
    if (!parsed) return null;
    try {
      const data = await getSharePolymarketConversation(parsed.token)
      setMessages(data.messages)
    } catch (error) {
      console.log('Failed to fetch shared message:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleArticleClick = async (slug: string) => {
    navigate(`/hot-takes/${slug}`);
  };

  const loadArticles = async (reset = false) => {
    try {
      setIsLoadingNews(true);
      const result = await newsService.getAll(
        topicFilter || undefined,
        PAGE_SIZE,
        0
      );

      setNewsArticles((prev) => (reset ? result : [...prev, ...result]));
      if (reset) setPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex h-dvh overflow-hidden">
      <div className='flex-1 overflow-y-auto'>
        <div className="w-full h-full">
          <div className="h-full flex flex-col lg:flex-row max-w-7xl m-0 gap-4 w-full">
            {/* Chat Section - Center with max width */}
            <div className="w-full h-full lg:flex-1 space-y-0 flex flex-col">
              {/* Oracle mobile header tab */}
              <div className="lg:hidden fixed top-0 left-0 right-0 z-10">
                <Card
                  className="border-border bg-background/80 backdrop-blur-md"
                  style={{
                    borderRadius: '0px',
                  }}
                >
                  <CardContent
                    className="p-2 sm:p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-md rounded-xl"
                    style={{
                      borderRadius: '0px',
                      padding: '14px 12px',
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <MessageSquareShare className="w-7 h-7 text-accent-foreground" />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                          Shared Message
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Market prediction from AI oracles
                        </CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={clsx(
                    'border-border bg-background/80 backdrop-blur-md'
                  )}
                  style={{
                    borderRadius: '0px',
                  }}
                >
                  <CardContent
                    className="border-b border-border bg-card/80 backdrop-blur-md rounded-xl flex items-center"
                    style={{
                      borderRadius: '0px',
                      padding: 0,
                    }}
                  >
                    {tabs.map((tab) => (
                      <div
                        key={tab.id}
                        className={clsx(
                          'relative flex-1 p-2 py-4 sm:p-3 flex items-center justify-center text-base font-medium cursor-pointer transition-opacity',
                          currentTab === tab.id
                            ? 'opacity-100'
                            : 'opacity-50 hover:opacity-80'
                        )}
                        onClick={() => setCurrentTab(tab.id)}
                      >
                        {tab.label}
                        {currentTab === tab.id && (
                          <motion.div
                            layoutId="underline"
                            className="absolute bottom-0 h-0.5 dark:bg-white bg-black w-full"
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {currentTab === 'chat' && (
                <>
                  {/* Oracle Header - Above conversation box */}
                  <Card
                    className="border-border bg-background/80 backdrop-blur-md hidden md:block!"
                    style={{
                      borderRadius: '0px',
                    }}
                  >
                    <CardContent
                      className="p-2 sm:p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-md rounded-xl"
                      style={{
                        borderRadius: '0px',
                        padding: '14px 12px',
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <MessageSquareShare className="w-7 h-7 text-accent-foreground" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm sm:text-base md:text-lg truncate">
                            Shared Message
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Market prediction from AI oracles
                          </CardDescription>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Chat Container with Background */}
                  <div className="relative sm:h-[calc(100vh-16rem)] flex-1 overflow-hidden mt-[130px] md:mt-0!">
                    {/* Background Color */}
                    <div className="absolute inset-0 bg-card/50" />
                    {/* Chat Interface - Full Height */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                      {/* Messages Area - Scrollable with transparent background */}
                      <div className="flex-1 overflow-hidden pointer-events-auto rounded-none border-r">
                        <ScrollArea className="h-full p-2 sm:p-3 md:p-4 bg-muted/80">
                          {isLoadingMessages && (
                            <div className="px-2 py-4">
                              <ChatSkeleton />
                            </div>
                          )}
                          {(!isLoadingMessages && (shareError || messages.length === 0)) && (
                            <div className="flex flex-col items-center justify-center my-12 px-4 text-center">
                              <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mb-4">
                                <Link2Off className="w-8 h-8 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">
                                This shared link is no longer available
                              </h3>
                              <p className="text-sm text-muted-foreground max-w-md">
                                The shared link is invalid or no longer exists.
                              </p>
                            </div>
                          )}
                          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
                            {messages.map((message, index) => {
                              return (
                                <div key={message.id}>
                                  <div
                                    className={`flex ${message.sender === 'user'
                                      ? 'justify-end max-w-[94vw]'
                                      : 'justify-start'
                                      }`}
                                  >
                                    <div
                                      className={`max-w-[80%] sm:max-w-[75%] rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg ${message.sender === 'user'
                                        ? 'bg-blue-600 text-white backdrop-blur-sm'
                                        : `backdrop-blur-md border border-border`
                                        }`}
                                    >
                                      {message.sender === 'assistant' ? (
                                        <div className="text-xs sm:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2 prose-code:text-xs">
                                          <Markdown
                                            text={message.content}
                                          />
                                        </div>
                                      ) : (
                                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                                          {message.content}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {currentTab === 'hotTakes' && (
                <div className="lg:hidden w-full space-y-3 pt-[130px]">
                  {/* Hot Takes Section */}
                  <Card
                    className="border-border"
                    style={{ borderRadius: 0 }}
                  >
                    <CardHeader className="border-b border-border pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="w-4 h-4" />
                        <span>Hot Takes</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Latest insights from our oracle community
                      </p>
                    </CardHeader>

                    <HotTakeChatPageList
                      topicFilter={topicFilter}
                      setTopicFilter={setTopicFilter}
                      topicList={topicList}
                      isLoadingTopicList={isLoadingTopicList}
                      newsArticles={newsArticles}
                      isLoadingNews={isLoadingNews}
                      getMore={() => { }}
                      hasMoreArticles={false}
                      handleArticleClick={handleArticleClick}
                    />
                  </Card>
                </div>
              )}
            </div>

            <div className="hidden lg:block w-full h-full lg:w-80">
              {/* Hot Takes Section */}
              <Card
                className="border-border overflow-hidden"
                style={{
                  height: '100vh',
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  gap: 0,
                }}
              >
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="w-4 h-4" />
                    <span>Hot Takes</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Latest insights from our oracle community
                  </p>
                </CardHeader>
                <HotTakeChatPageList
                  topicFilter={topicFilter}
                  setTopicFilter={setTopicFilter}
                  topicList={topicList}
                  isLoadingTopicList={isLoadingTopicList}
                  newsArticles={newsArticles}
                  isLoadingNews={isLoadingNews}
                  getMore={() => { }}
                  hasMoreArticles={false}
                  handleArticleClick={handleArticleClick}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ChatSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl border border-border bg-background/60 px-4 py-3">
          <Skeleton className="h-7 w-32 mb-2 bg-gray-200/20" />
          <Skeleton className="h-7 w-48 bg-gray-200/20" />
        </div>
      </div>

      <div className="flex items-start gap-3 mt-2">
        <div className="flex-1">
          <div className="max-w-[85%] rounded-2xl border border-border bg-background/60 px-4 py-3 space-y-2">
            <Skeleton className="h-14 w-full bg-gray-200/20" />
            <Skeleton className="h-14 w-5/6 bg-gray-200/20" />
            <Skeleton className="h-14 w-3/4 bg-gray-200/20" />
          </div>
        </div>
      </div>
    </div>
  );
};



export default ShareChatPage
