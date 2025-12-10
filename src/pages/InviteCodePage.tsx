import { Copy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import CreateUserCodeModal from '../components/inviteCode/CreateUserCodeModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import CreateInviteCodeModal from '../components/inviteCode/CreateInviteCodeModal';
import ShareCodesModal from '../components/inviteCode/ShareCodesModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ADMIN_EMAILS, ADMIN_IDS } from '../constants/admin';
import { copyToClipboard } from '../lib/clipboardUtils';
import { InviteCode, inviteCodeService } from '../services/invite-code.service';
import useAuthStore from '../store/auth.store';
import { toast } from 'sonner';
import { Twitter } from 'lucide-react';

export default function InviteCodePage() {
  const appUrl = `${import.meta.env.VITE_APP_URL}`;
  const user = useAuthStore((state) => state.user);
  // const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  const isAdmin = user?.email ? ADMIN_IDS.includes(user.id) : false;

  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateUserCode, setOpenCreateUserCode] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'used' | 'unused'>('all');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [total, setTotal] = useState(0);

  const [userWallet, setUserWallet] = useState('');

  const params = {
    search,
    status: status === 'all' ? undefined : status,
    page,
    limit: pageSize,
    appWallet: userWallet,
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

  const handleShareOnX = () => {
    setOpenShareModal(true);
  };

  const handleConfirmShare = (selectedCodes: string[]) => {
    shareOnX(selectedCodes);
    toast.success('Opening X (Twitter) to share your invite codes!');
  };

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await (isAdmin
        ? inviteCodeService.getAll(params)
        : inviteCodeService.getMyCode(params));
      setCodes(res.data || []);
      setTotal(res.meta.total || 0);
    } catch (err) {
      console.error('Failed to fetch invite codes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, userWallet]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.ceil(total / pageSize);

  const handleConfirmCreate = async ({
    count,
    prefix,
  }: {
    count: number;
    prefix?: string;
  }) => {
    try {
      await inviteCodeService.generateCode({ count, prefix });
      await refetch();
      setOpenCreate(false);

      toast.success(
        `Created ${count} invite code${count > 1 ? 's' : ''} successfully!`
      );
    } catch (err: any) {
      const message = err?.response?.data?.errors?.prefix || 'Something when wrong';
      throw new Error(message);
    }
  };

  const handleConfirmCreateUserCode = async ({
    appWallet,
    prefix,
  }: {
    appWallet: string;
    prefix?: string;
  }) => {
    try {
      await inviteCodeService.generateCodeForUser({ appWallet, prefix });
      await refetch();
      setOpenCreateUserCode(false);

      toast.success(`Created invite code for user successfully!`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something when wrong';
      throw new Error(message);
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invite Codes</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Manage your invite codes or generate new ones to share with users.'
            : 'Manage your invite codes and share with users.'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unused">Unused</SelectItem>
              <SelectItem value="used">Used</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by code..."
            className="flex-1"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />

          {isAdmin && (
            <Input
              placeholder="Search by user's wallet address..."
              className="flex-1"
              value={userWallet}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUserWallet(e.target.value)
              }
            />
          )}
        </div>

        {isAdmin ? (
          <>
            <Button onClick={() => setOpenCreate(true)}>Create Code</Button>
            <Button onClick={() => setOpenCreateUserCode(true)}>
              Create User's Code
            </Button>
          </>
        ) : (
          <Button
            onClick={handleShareOnX}
            className="gap-2"
          >
            <Twitter className="w-4 h-4" />
            Share on X
          </Button>
        )}
      </div>

      <CreateInviteCodeModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onConfirm={handleConfirmCreate}
      />

      <CreateUserCodeModal
        open={openCreateUserCode}
        onClose={() => setOpenCreateUserCode(false)}
        onConfirm={handleConfirmCreateUserCode}
      />

      <ShareCodesModal
        open={openShareModal}
        onClose={() => setOpenShareModal(false)}
        codes={codes}
        onConfirm={handleConfirmShare}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableCell className="font-semibold">Code</TableCell>
              <TableCell className="font-semibold">Referral Link</TableCell>
              <TableCell className="font-semibold">Status</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && codes?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-muted-foreground"
                >
                  No invite codes found
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              codes?.map((code, idx) => {
                const referralLink = `${appUrl}?invitecode=${code.code}`;

                return (
                  <TableRow
                    key={code.id}
                    className={idx % 2 === 0 ? 'bg-muted/20' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {code.code}
                        <Copy
                          className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyToClipboard(code.code)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="truncate max-w-xs">{referralLink}</span>
                        <Copy
                          className="h-3 w-3 ml-3 cursor-pointer text-muted-foreground hover:text-foreground flex-shrink-0"
                          onClick={() => handleCopyToClipboard(referralLink, "Referral link")}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {code.usedBy ? (
                        <span className="text-red-500 font-medium">Used</span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          Unused
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
