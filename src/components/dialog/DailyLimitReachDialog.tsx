import React from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Check, Crown, Lock, MessageSquare, Sparkles } from 'lucide-react';
import { MAX_PREDICTIONS_PER_DAY } from '../../constants/prediction';

interface DailyLimitReachDialogProps {
  open: boolean
  onChange: (open: boolean) => void
  limitReachedType?: 'prediction' | 'textline' | 'total-predictions' | null
  setSubscriptionDialogOpen: (open: boolean) => void
}

const DailyLimitReachDialog = ({ open, onChange, limitReachedType = 'total-predictions', setSubscriptionDialogOpen }: DailyLimitReachDialogProps) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onChange}
    >
      <AlertDialogContent className="max-w-md sm:mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            Daily Limit Reached
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {limitReachedType === 'textline' ? (
                <>
                  <p className="text-sm">
                    You've used all <strong>100 free text lines</strong> for
                    today. Your limit resets tomorrow!
                  </p>
                  <div className="p-3 sm:p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-orange-400" />
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Current Usage
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Free tier: 100 text lines per day
                    </p>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p className="text-xs text-orange-400 mt-1 text-center">
                      100/100 lines used
                    </p>
                  </div>
                </>
              ) : limitReachedType === 'total-predictions' ? (
                <>
                  <p className="text-sm">
                    You've used all <strong>{MAX_PREDICTIONS_PER_DAY} free predictions</strong> on
                    the Basic tier. Upgrade to Pro to continue making
                    unlimited predictions!
                  </p>
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Free Tier Limit Reached
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Basic tier: {MAX_PREDICTIONS_PER_DAY} total predictions
                    </p>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p className="text-xs text-blue-400 mt-1 text-center">
                      {MAX_PREDICTIONS_PER_DAY}/{MAX_PREDICTIONS_PER_DAY} predictions used
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    You've used all <strong>5 free predictions</strong> for
                    today. Your limit resets tomorrow!
                  </p>
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        Current Usage
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Free tier: 5 predictions per day
                    </p>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p className="text-xs text-blue-400 mt-1 text-center">
                      5/5 predictions used
                    </p>
                  </div>
                </>
              )}

              <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Upgrade to Pro
                  </p>
                </div>
                <ul className="text-xs sm:text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>
                      <strong>Unlimited</strong> predictions
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>
                      <strong>2x XP</strong> multiplier on all actions
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>
                      <strong className="text-yellow-400">
                        +1,500 XP bonus
                      </strong>{' '}
                      when you subscribe
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>Priority AI responses</span>
                  </li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-500/20">
                  <p className="text-xs text-center">
                    <span className="line-through text-muted-foreground">
                      $19.99/mo
                    </span>
                    <span className="ml-2 text-base sm:text-lg font-semibold text-blue-400">
                      $4.99/mo
                    </span>
                    <span className="ml-2 text-xs text-green-400">
                      75% OFF
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onChange(false);
              setSubscriptionDialogOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 w-full sm:w-auto"
          >
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DailyLimitReachDialog
