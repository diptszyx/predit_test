import { Check, Copy, Info, Loader2, Pencil, Users, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../../lib/clipboardUtils';
import { User } from '../../lib/types';
import { inviteCodeService } from '../../services/invite-code.service';
import useAuthStore from '../../store/auth.store';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type InviteCardProps = {
  user: User
}

const InviteCard = ({ user }: InviteCardProps) => {
  const { fetchCurrentUser } = useAuthStore();
  const appUrl = `${import.meta.env.VITE_APP_URL}`;
  const inviteCode = user.inviteCode
  const [referralCode, setReferralCode] = useState(inviteCode)
  const inviteLink = `${appUrl}?invitecode=${inviteCode}`;

  const referralGainsXP = user.xpFromReferrals;
  const [isEditingCode, setIsEditingCode] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopyToClipboard = async (text?: string, copyFrom = 'Code') => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${copyFrom} copied to clipboard!`);
    } else {
      toast.error('Unable to copy automatically', {
        description: `Please copy the ${copyFrom} manually`,
      });
    }
  };

  const handleCustomMyCode = async (code: string) => {
    const trimmedCode = code.trim()

    if (trimmedCode.length < 3 || trimmedCode.length > 30) {
      toast.error("Invite code must be between 3 and 30 characters")
      return
    }

    const validPattern = /^[a-zA-Z0-9_-]+$/
    if (!validPattern.test(trimmedCode)) {
      toast.error(
        "Code can only contain letters, numbers, hyphens, and underscores"
      )
      return
    }

    setLoading(true)
    try {
      const data = await inviteCodeService.customMyCode(trimmedCode)
      await fetchCurrentUser()
      setIsEditingCode(false)
      toast.success("Invite code updated successfully")
    } catch (error: any) {
      console.log('Failed to update code', error)
      toast.error(error?.response?.data?.errors?.code || "Failed to update invite code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className='flex flex-col sm:flex-row items-start justify-between'>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h3>Referral</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Earn XP by inviting new users
            </p>
          </div>
          <div className="flex gap-3 items-center mb-2.5 justify-between sm:justify-start">
            <div className="text-xs mr-5">Referral Gains</div>
            <div className="text-xl font-bold tracking-tight">
              {referralGainsXP.toLocaleString("en-US")}{" "}
              <span className="text-[#4ea7ff]">XP</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-lg border p-4 border-white/10 border-border bg-muted/30">
            <div className='flex items-center gap-3 mb-3 '>

              <Label className="text-sm">My Referral Code</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-5 h-4 cursor-pointer text-neutral-400" />
                </TooltipTrigger>
                <TooltipContent>
                  3–30 characters. Letters, numbers, - and _ only.
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder='Code'
                value={referralCode}
                disabled={!isEditingCode}
                className={`flex-1 text-sm ${!isEditingCode ? 'bg-accent' : ''}`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferralCode(e.target.value)}
              />

              <div className="flex items-center gap-2">
                {isEditingCode &&
                  <Button
                    className="h-9 w-9 rounded-full border text-muted-foreground hover:text-foreground"
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setReferralCode(inviteCode)
                      setIsEditingCode(false)
                    }}
                    disabled={loading}
                  >
                    {isEditingCode && <X className='w-3.5 h-3.5' />}
                  </Button>
                }
                <Button
                  className="h-9 w-9 rounded-full border text-muted-foreground hover:text-foreground"
                  title="Edit"
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    if (isEditingCode) {
                      handleCustomMyCode(referralCode)
                    } else {
                      setIsEditingCode(!isEditingCode)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : isEditingCode ? <Check className='w-3.5 h-3.5' /> :
                      <Pencil className='w-3.5 h-3.5' />
                  }
                </Button>
                <Button
                  className="h-9 w-9 rounded-full border text-muted-foreground hover:text-foreground"
                  title="Copy code"
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCopyToClipboard(referralCode!)}
                >
                  <Copy className='w-3.5 h-3.5' />
                </Button>
              </div>
            </div>

            <Label className="mt-4 text-sm">Invite via Link</Label>

            <div className=" flex items-center justify-between gap-3">
              <div className="truncate text-xs font-mono">{inviteLink}</div>

              <Button
                onClick={() => handleCopyToClipboard(inviteLink, "Referral link")}
                className="h-9 w-9 rounded-full border text-muted-foreground hover:text-foreground"
                title="Copy link"
                variant='ghost'
                size='sm'
              >
                <Copy className='w-3.5 h-3.5' />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InviteCard
