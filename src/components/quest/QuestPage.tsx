import { Info, LineChart, Share2, ShoppingCart, Store, UserPlus, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useGetContentShare from '../../hooks/quests/getContentShare';
import useGetInviteCodes from '../../hooks/quests/getInviteCodes';
import useGetQuest from '../../hooks/quests/getQuest';
import {
  connectDiscord,
  connectX,
  DAILY_QUEST_TYPES,
  Quest,
  QuestStatus,
  QuestType,
  verifyFollow,
  verifyJoinDiscord,
  verifyLikeTweet,
  verifyRetweetTweet,
  verifySharePost,
  verifyTradeDaily,
  verifyTradeDailyPolymarket,
  verifyTradeDailyPreditMarket,
} from '../../services/quest.service';
import useAuthStore from '../../store/auth.store';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import ShareCodesModal from '../inviteCode/ShareCodesModal';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import ClaimTokenModal from './ClaimTokenModal';
import VerifyShareXModal from './VerifyShareXModal';

type QuestButtonConfig = {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
};

const QuestPage = () => {
  const claimTokenEnable = import.meta.env.VITE_CLAIM_TOKEN_ENABLE === 'true'
  const { user, fetchCurrentUser } = useAuthStore();
  const { quests, totalXpEarned, refetch } = useGetQuest();
  const { codes } = useGetInviteCodes();
  const { content } = useGetContentShare();

  const [openShareModal, setOpenShareModal] = useState(false);
  const [openVerifyShareModal, setOpenVerifyShareModal] = useState(false);
  const [openClaimTokenModal, setOpenClaimTokenModal] = useState(false)

  const [verifyQuestId, setVerifyQuestId] = useState<string | null>(null);
  const [clickedActionQuests, setClickedActionQuests] = useState<string[]>([]);
  const isConnectedX = quests.some(
    (q) =>
      q.questType === QuestType.CONNECT_X && q.status === QuestStatus.COMPLETED,
  );
  const isConnectedDiscord = !!user?.discordId;
  const isHandlingDiscordAuth = useRef(false);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data === 'discord-auth-complete') {
        if (isHandlingDiscordAuth.current) return;
        isHandlingDiscordAuth.current = true;

        try {
          await fetchCurrentUser();
          await refetch();
          toast.success('Discord connected successfully!');
        } finally {
          setTimeout(() => {
            isHandlingDiscordAuth.current = false;
          }, 2000);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchCurrentUser, refetch]);

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get('connected') === 'true') {
      url.searchParams.delete('connected');

      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const handleConfirmShare = (selectedCodes: string[]) => {
    shareOnX(selectedCodes);
    toast.success('Opening X (Twitter) to share your invite codes!');
  };

  const shareOnX = (codesToShare: string[]) => {
    const formattedCodes = codesToShare.reduce((acc, code, idx) => {
      return acc + code + '\n';
    }, '');

    const text = encodeURIComponent(
      `Join Predict Market using my invite code and get 300 XP bonus!

${formattedCodes}
${content.shareContent}

#predit_market #prediction`,
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleConnectX = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const { authUrl } = await connectX();
      window.location.href = authUrl;
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Couldn’t start X connection. Please try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleConnectDiscord = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const { authUrl } = await connectDiscord();
      window.open(authUrl, 'discord-auth', 'width=500,height=600');
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Couldn’t start Discord connection. Please try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyJoinDiscord = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyJoinDiscord(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Join Discord verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please join and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyFollow = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyFollow(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Follow verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please follow and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyTradeDaily = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyTradeDaily(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Trade Daily verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please trade and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyTradeDailyPolymarket = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyTradeDailyPolymarket(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Daily Polymarket trade verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please trade and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyTradeDailyPreditMarket = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyTradeDailyPreditMarket(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Daily Predit Market trade verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please trade and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyLike = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyLikeTweet(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Like verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please like the tweet and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifyRetweet = async (questId: string) => {
    try {
      setVerifyQuestId(questId);

      const data = await verifyRetweetTweet(questId);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Retweet verified successfully! XP has been added to your account.',
        );
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please retweet and try again.',
      );
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current));
    }
  };

  const handleVerifySharePost = async (questId: string, tweetUrl: string) => {
    try {
      const data = await verifySharePost(questId, tweetUrl);
      if (data.success) {
        await fetchCurrentUser();
        await refetch();
        toast.success(
          'Share post verified successfully! XP has been added to your account.',
        );
        setOpenVerifyShareModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        'Verification failed. Please share and try again.',
      );
    }
  };

  const getQuestButton = (quest: Quest): QuestButtonConfig => {
    const isComplete = quest.status === QuestStatus.COMPLETED;
    const isVerifyingThis = verifyQuestId === quest.questId;
    if (isComplete) {
      return {
        label: 'Completed',
        disabled: true,
        onClick: undefined,
      };
    }

    switch (quest.questType) {
      case QuestType.CONNECT_X:
        return {
          label: isVerifyingThis ? 'Connecting...' : 'Connect',
          disabled: isVerifyingThis,
          onClick: () => handleConnectX(quest.questId),
        };

      case QuestType.JOIN_DISCORD:
        if (!isConnectedDiscord) {
          return {
            label: isVerifyingThis ? 'Connecting...' : 'Connect',
            disabled: isVerifyingThis,
            onClick: () => handleConnectDiscord(quest.questId),
          };
        }
        return {
          label: isVerifyingThis ? 'Verifying...' : 'Verify',
          disabled: isVerifyingThis,
          onClick: () => handleVerifyJoinDiscord(quest.questId),
        };

      case QuestType.FOLLOW_X:
        return {
          label: isVerifyingThis ? 'Verifying...' : 'Verify',
          disabled: isVerifyingThis || !isConnectedX,
          onClick: () => handleVerifyFollow(quest.questId),
        };

      case QuestType.SHARE_POST:
        return {
          label: 'Verify',
          disabled: !isConnectedX,
          onClick: () => {
            setVerifyQuestId(quest.questId);
            setOpenVerifyShareModal(true);
          },
        };

      case QuestType.LIKE_X:
      case QuestType.RETWEET_X: {
        const hasClickedAction = clickedActionQuests.includes(quest.questId);
        if (!hasClickedAction) {
          return {
            label: 'Go',
            disabled: !isConnectedX,
            onClick: () => {
              const tweetId = quest.metadata?.targetTweetId;
              if (tweetId) {
                const actionUrl =
                  quest.questType === QuestType.LIKE_X
                    ? `https://x.com/intent/like?tweet_id=${tweetId}`
                    : `https://x.com/intent/retweet?tweet_id=${tweetId}`;
                window.open(actionUrl, '_blank');
              } else {
                window.open('https://x.com', '_blank');
              }
              setClickedActionQuests((prev) => [...prev, quest.questId]);
            },
          };
        }

        return {
          label: isVerifyingThis ? 'Verifying...' : 'Verify',
          disabled: isVerifyingThis || !isConnectedX,
          onClick: () =>
            quest.questType === QuestType.LIKE_X
              ? handleVerifyLike(quest.questId)
              : handleVerifyRetweet(quest.questId),
        };
      }

      case QuestType.DAILY_TRADE:
        return {
          label: isVerifyingThis ? 'Verifying...' : 'Verify',
          disabled: isVerifyingThis,
          onClick: () => handleVerifyTradeDaily(quest.questId),
        };

      case QuestType.DAILY_TRADE_POLYMARKET:
        return {
          label: isVerifyingThis ? 'Verifying...' : 'Verify',
          disabled: isVerifyingThis,
          onClick: () => handleVerifyTradeDailyPolymarket(quest.questId),
        };

      case QuestType.DAILY_TRADE_PREDIT_MARKET:
        return {
          label: isVerifyingThis ? 'Verifying...' : 'Verify',
          disabled: isVerifyingThis,
          onClick: () => handleVerifyTradeDailyPreditMarket(quest.questId),
        };

      default:
        return {
          label: 'Go',
          disabled: true,
        };
    }
  };

  const hasIncompleteQuest = (quests: Quest[]) =>
    quests.some((q) => q.status !== QuestStatus.COMPLETED);

  const dailyQuests = quests.filter((quest) =>
    DAILY_QUEST_TYPES.includes(quest.questType),
  );

  const oneTimeQuests = quests.filter(
    (quest) => !DAILY_QUEST_TYPES.includes(quest.questType),
  );

  const shouldShowOneTimeFirst = hasIncompleteQuest(oneTimeQuests);

  const questSections = shouldShowOneTimeFirst
    ? [
      { title: 'One-time Quests', data: oneTimeQuests },
      { title: 'Daily Quests', data: dailyQuests },
    ]
    : [
      { title: 'Daily Quests', data: dailyQuests },
      { title: 'One-time Quests', data: oneTimeQuests },
    ];

  return (
    <div className="space-y-6 mx-auto max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quest Center</h1>
        <p className="text-muted-foreground">
          Follow, share, and trade to earn points and climb the leaderboard.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border p-3 md:p-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center text-2xl font-semibold text-[#FCD05A] md:text-4xl">
            <Zap className="h-7 w-7 sm:h-9 sm:w-9" />
            <span className="pl-1">{totalXpEarned}</span>
          </div>

          <p className="mt-2 text-base font-semibold text-[#FCD05A]">
            Total XP Earned
          </p>

          {claimTokenEnable &&
            <button
              className="mt-4 rounded-2xl bg-[#FCD05A] px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] cursor-pointer"
              onClick={() => setOpenClaimTokenModal(true)}
            >
              Claim Token
            </button>
          }
        </div>
      </div>

      {quests.length === 0 ? (
        <>
          <QuestSkeletonCard />
        </>
      ) : (
        <>
          {questSections.map(
            (section) =>
              section.data.length > 0 && (
                <section key={section.title}>
                  <h1 className="mb-3 mt-6 text-lg font-bold">
                    {section.title}
                  </h1>

                  <div className="space-y-3">
                    {section.data.map((quest) => (
                      <QuestItem
                        key={quest.questId}
                        quest={quest}
                        getQuestButton={getQuestButton}
                        onShareNow={() => setOpenShareModal(true)}
                        isConnectedX={isConnectedX}
                        isConnectedDiscord={isConnectedDiscord}
                      />
                    ))}
                  </div>
                </section>
              ),
          )}
        </>
      )}

      {verifyQuestId && (
        <VerifyShareXModal
          open={openVerifyShareModal}
          setOpen={setOpenVerifyShareModal}
          questId={verifyQuestId}
          onConfirm={handleVerifySharePost}
        />
      )}

      <ShareCodesModal
        open={openShareModal}
        onClose={() => setOpenShareModal(false)}
        codes={codes}
        onConfirm={handleConfirmShare}
      />

      <ClaimTokenModal open={openClaimTokenModal} onOpenChange={setOpenClaimTokenModal} />
    </div>
  );
};

type QuestItemProps = {
  quest: Quest;
  getQuestButton: (quest: Quest) => QuestButtonConfig;
  onShareNow?: () => void;
  isConnectedX: boolean;
  isConnectedDiscord: boolean;
};

export function QuestItem({
  quest,
  getQuestButton,
  onShareNow,
  isConnectedX,
  isConnectedDiscord,
}: QuestItemProps) {
  const navigate = useNavigate();
  const isComplete = quest.status === QuestStatus.COMPLETED;
  const { label, onClick, disabled } = getQuestButton(quest);

  const renderQuestIcon = (questType: QuestType) => {
    switch (questType) {
      case QuestType.CONNECT_X:
        return (
          <ImageWithFallback
            src="/Twitter-X.svg"
            alt="icon-social"
            width={20}
            height={20}
          />
        );

      case QuestType.JOIN_DISCORD:
        return (
          <ImageWithFallback
            src="/discord-outline.svg"
            alt="icon-discord"
            width={20}
            height={20}
          />
        );

      case QuestType.LIKE_X:
      case QuestType.RETWEET_X:
        return (
          <ImageWithFallback
            src="/Twitter-X.svg"
            alt="icon-social"
            width={20}
            height={20}
          />
        );

      case QuestType.FOLLOW_X:
        return <UserPlus className="h-5 w-5 text-[#a3a3a3]" />;

      case QuestType.DAILY_TRADE:
        return <Store className="h-5 w-5 text-[#a3a3a3]" />;

      case QuestType.DAILY_TRADE_POLYMARKET:
        return <LineChart className="h-5 w-5 text-[#a3a3a3]" />;

      case QuestType.DAILY_TRADE_PREDIT_MARKET:
        return <ShoppingCart className="h-5 w-5 text-[#a3a3a3]" />;

      default:
        return <Share2 className="h-5 w-5 text-[#a3a3a3]" />;
    }
  };

  const renderQuestContent = (quest: Quest) => {
    switch (quest.questType) {
      case QuestType.JOIN_DISCORD:
        return (
          <>
            Join Predit{' '}
            <a
              href="https://discord.gg/Qy383ZHH8"
              target="_blank"
              className="text-blue-400"
            >
              Discord
            </a>{' '}
            to earn more XP
          </>
        );

      case QuestType.FOLLOW_X:
        return (
          <>
            Follow{' '}
            <a
              href="https://x.com/intent/user?screen_name=preditmarket"
              target="_blank"
              className="text-blue-400"
            >
              @preditmarket
            </a>{' '}
            on X to earn XP
          </>
        );

      case QuestType.DAILY_TRADE:
        return (
          <>
            Make a trade on{' '}
            <button
              className="text-blue-400 text-[10px] sm:text-xs cursor-pointer"
              onClick={() => navigate('/kalshi')}
            >
              Kalshi Market
            </button>{' '}
            to earn XP (1 per day)
          </>
        );

      case QuestType.DAILY_TRADE_POLYMARKET:
        return (
          <>
            Make a trade on{' '}
            <button
              className="text-blue-400 text-[10px] sm:text-xs cursor-pointer"
              onClick={() => navigate('/polymarket')}
            >
              Polymarket
            </button>{' '}
            to earn XP (1 per day)
          </>
        );

      case QuestType.DAILY_TRADE_PREDIT_MARKET:
        return (
          <>
            Make a trade on{' '}
            <button
              className="text-blue-400 text-[10px] sm:text-xs cursor-pointer"
              onClick={() => navigate('/market')}
            >
              Predit Market
            </button>{' '}
            to earn XP (1 per day)
          </>
        );

      case QuestType.SHARE_POST:
        return (
          <>
            {quest.description}
            <Button
              onClick={onShareNow}
              className="ml-2 h-fit p-0 text-[10px] font-normal sm:text-xs"
              variant="link"
            >
              Share now.
            </Button>
          </>
        );

      default:
        return quest.description;
    }
  };

  const requiresX =
    quest.questType === QuestType.FOLLOW_X ||
    quest.questType === QuestType.SHARE_POST ||
    quest.questType === QuestType.LIKE_X ||
    quest.questType === QuestType.RETWEET_X;

  return (
    <div className="relative rounded-3xl border px-5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center">
          <div className="flex size-10 items-center justify-center rounded-full border backdrop-blur-[10px]">
            {renderQuestIcon(quest.questType)}
          </div>

          <div className="pl-3">
            <p className="text-sm font-semibold sm:text-base flex items-center gap-3">
              {quest.questType === QuestType.JOIN_DISCORD ? (
                <a
                  href="https://discord.gg/Qy383ZHH8"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-400 cursor-pointer"
                >
                  {quest.name}
                </a>
              ) : (
                <span>{quest.name}</span>
              )}
              {requiresX &&
                quest.status !== QuestStatus.COMPLETED &&
                !isConnectedX && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-5 h-4 cursor-pointer text-neutral-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Connect X first to unlock this quest
                    </TooltipContent>
                  </Tooltip>
                )}
            </p>
            <p className="text-[10px] sm:text-xs">
              {renderQuestContent(quest)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-3">
          <div
            className={`text-xs font-semibold ${isComplete ? 'text-[#ccc]' : 'text-[#FCD05A]'}`}
          >
            <span className="pl-1">+{quest.xpReward} XP</span>
          </div>

          <Button
            className="font-mono"
            size="sm"
            onClick={onClick ?? (() => { })}
            disabled={disabled || !onClick}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}

const QuestSkeletonCard = () => {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative rounded-3xl border px-5 py-3 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center">
              <div className="size-10 rounded-full bg-muted" />

              <div className="pl-3 space-y-2">
                <Skeleton className="h-4 w-32 rounded bg-muted" />
                <Skeleton className="h-3 w-48 rounded bg-muted" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-3 w-14 rounded bg-muted" />
              <Skeleton className="h-8 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default QuestPage;
