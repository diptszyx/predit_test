import React from 'react';
import NotHaveInviteCode from '../inviteCode/NotHaveInviteCode';

export default function InviteCodeGuard({
  children,
  onOpenWalletDialog,
}: {
  children: React.ReactNode;
  onOpenWalletDialog: () => void;
}) {
  return (
    <div className="relative flex-1 overflow-y-auto">
      <NotHaveInviteCode onOpenWalletDialog={onOpenWalletDialog} />
      {children}
    </div>
  );
}
