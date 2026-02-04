import { Share2, UserPlus, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import useGetInviteCodes from "../../hooks/quests/getInviteCodes"
import useGetQuest from "../../hooks/quests/getQuest"
import { connectX, Quest, QuestStatus, QuestType, verifyFollow, verifySharePost } from "../../services/quest.service"
import useAuthStore from "../../store/auth.store"
import { ImageWithFallback } from "../figma/ImageWithFallback"
import ShareCodesModal from "../inviteCode/ShareCodesModal"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import VerifyShareXModal from "./VerifyShareXModal"

type QuestButtonConfig = {
  label: string
  disabled?: boolean
  onClick?: () => void
}

const QuestPage = () => {
  const appUrl = `${import.meta.env.VITE_APP_URL}`;
  const { fetchCurrentUser } = useAuthStore();
  const { quests, totalXpEarned, totalXpAvailable, refetch } = useGetQuest()
  const { codes } = useGetInviteCodes()
  const [openShareModal, setOpenShareModal] = useState(false);
  const [openVerifyShareModal, setOpenVerifyShareModal] = useState(false);
  const [verifyQuestId, setVerifyQuestId] = useState<string | null>(null)

  useEffect(() => {
    const url = new URL(window.location.href)

    if (url.searchParams.get("connected") === "true") {
      url.searchParams.delete("connected")

      window.history.replaceState({}, "", url.pathname + url.search)
    }
  }, [])

  const handleConfirmShare = (selectedCodes: string[]) => {
    shareOnX(selectedCodes);
    toast.success('Opening X (Twitter) to share your invite codes!');
  };

  const shareOnX = (codesToShare: string[]) => {
    // Format codes: 4 codes per line
    const formattedCodes = codesToShare.reduce((acc, code, idx) => {
      if (idx > 0 && idx % 4 === 0) {
        acc += '\n';
      } else if (idx > 0) {
        acc += ' ';
      }
      return acc + code;
    }, '');

    const text = encodeURIComponent(
      `Join Predict Market using my invite code and get 300 XP bonus!

${formattedCodes}

${appUrl}

#predit_market #prediction`
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleConnectX = async (questId: string) => {
    try {
      setVerifyQuestId(questId)

      const { authUrl } = await connectX()
      window.location.href = authUrl
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Couldn’t start X connection. Please try again.")
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current))
    }
  }

  const handleVerifyFollow = async (questId: string) => {
    try {
      setVerifyQuestId(questId)

      const data = await verifyFollow(questId)
      if (data.success) {
        await fetchCurrentUser()
        await refetch()
        toast.success("Follow verified successfully! XP has been added to your account.")
      } else {
        toast.error(data.message)
      }

    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Verification failed. Please follow and try again.')
    } finally {
      setVerifyQuestId((current) => (current === questId ? null : current))
    }
  }

  const handleVerifySharePost = async (questId: string, tweetUrl: string) => {
    try {
      const data = await verifySharePost(questId, tweetUrl)
      if (data.success) {
        await fetchCurrentUser()
        await refetch()
        toast.success("Share post verified successfully! XP has been added to your account.")
        setOpenVerifyShareModal(false)
      } else {
        toast.error(data.message)
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Verification failed. Please share and try again.')
    }
  }

  const getQuestButton = (quest: Quest): QuestButtonConfig => {
    const isComplete = quest.status === QuestStatus.COMPLETED
    const isVerifyingThis = verifyQuestId === quest.questId
    console.log('verifyQuestId', verifyQuestId, quest.questId)
    if (isComplete) {
      return {
        label: "Completed",
        disabled: true,
        onClick: undefined,
      }
    }

    switch (quest.questType) {
      case QuestType.CONNECT_X:
        return {
          // label: "Connect",  
          label: isVerifyingThis ? "Connecting..." : "Connect",
          disabled: isVerifyingThis,
          onClick: () => handleConnectX(quest.questId),
        }

      case QuestType.FOLLOW_X:
        return {
          label: isVerifyingThis ? "Verifying..." : "Verify",
          disabled: isVerifyingThis,
          onClick: () => handleVerifyFollow(quest.questId),
        }

      case QuestType.SHARE_POST:
        return {
          label: "Verify",
          onClick: () => {
            setVerifyQuestId(quest.questId)
            setOpenVerifyShareModal(true)
          },
        }

      default:
        return {
          label: "Go",
          disabled: true,
        }
    }
  }

  return (
    <div className="space-y-6 mx-auto max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Quest Center
        </h1>
        <p className="text-muted-foreground">
          Follow, share, and invite to earn points and climb the leaderboard.
        </p>
      </div>

      <div className='mb-6 rounded-3xl p-2 md:p-4 border'>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex items-center text-2xl md:text-4xl font-semibold text-[#FCD05A]'>
            <Zap className='w-7 h-7 sm:w-9 sm:h-9' />
            <span className='pl-1'>{totalXpEarned}</span>
            <span className="text-xl pl-0.5 mt-3"> / {totalXpAvailable + totalXpEarned}</span>
          </div>
          <p className='mt-2 font-semibold text-[#FCD05A] text-base '>Total XP Earned</p>
        </div>
      </div>

      {quests.length === 0 ? <>
        <QuestSkeletonCard />
      </> : quests.map((quest: Quest) => {
        const isComplete = quest.status === QuestStatus.COMPLETED
        const { label, onClick, disabled } = getQuestButton(quest)
        return (
          <div className='relative rounded-3xl border px-5 py-3'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center justify-between'>
                <div className='flex size-10 items-center justify-center rounded-full border backdrop-blur-[10px]'>
                  {
                    quest.questType === QuestType.CONNECT_X
                      ?
                      <ImageWithFallback
                        src='/Twitter-X.svg'
                        alt='icon-social'
                        width={20}
                        height={20}
                      />
                      : quest.questType === QuestType.FOLLOW_X
                        ? <UserPlus className='w-5 h-5 text-[#a3a3a3]' />
                        : <Share2 className='w-5 h-5 text-[#a3a3a3]' />
                  }
                </div>
                <div className="pl-3">
                  <p className='text-sm sm:text-base font-semibold'>{quest.name}</p>
                  <p className="text-[10px] sm:text-xs">
                    {quest.questType === QuestType.FOLLOW_X ?
                      <>
                        Follow <a href="https://x.com/intent/user?screen_name=preditmarket" target="_blank" className="text-blue-400">
                          @preditmarket</a> on X to earn XP
                      </> :
                      quest.description}.

                    {quest.questType === QuestType.SHARE_POST &&
                      <Button
                        onClick={() => {
                          setOpenShareModal(true)
                        }}
                        className="p-0 font-normal h-fit ml-2 text-[10px] sm:text-xs"
                        variant='link'
                      >
                        Share now.
                      </Button>}
                  </p>
                </div>
              </div>
              <div className='flex flex-col items-end justify-between gap-3'>
                <div
                  className={`flex items-center justify-between text-xs font-semibold ${isComplete ? 'text-[#ccc]' : 'text-[#FCD05A]'}`}
                >
                  <span className='pl-1'>+{quest.xpReward} XP</span>
                </div>
                <Button
                  className='font-mono'
                  size="sm"
                  onClick={onClick}
                  disabled={disabled}
                >
                  {label}
                </Button>
              </div>
            </div>
          </div>
        )
      })}

      {verifyQuestId &&
        <VerifyShareXModal
          open={openVerifyShareModal}
          setOpen={setOpenVerifyShareModal}
          questId={verifyQuestId}
          onConfirm={handleVerifySharePost}
        />
      }

      <ShareCodesModal
        open={openShareModal}
        onClose={() => setOpenShareModal(false)}
        codes={codes}
        onConfirm={handleConfirmShare}
      />

    </div>
  )
}

const QuestSkeletonCard = () => {
  return (
    <>
      {
        [1, 2, 3].map((i) =>
        (
          <div key={i} className="relative rounded-3xl border px-5 py-3 animate-pulse">
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
        )
        )
      }
    </>
  )
}

export default QuestPage
