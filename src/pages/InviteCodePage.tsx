import { Check, Copy, Info, Loader2, Pencil, Users, X, Share2 } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../lib/clipboardUtils';
import { inviteCodeService, InviteCode } from '../services/invite-code.service';
import useAuthStore from '../store/auth.store';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { checkIsAdmin } from '../utils/isAdmin';
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
import CreateInviteCodeModal from '../components/inviteCode/CreateInviteCodeModal';
import CreateUserCodeModal from '../components/inviteCode/CreateUserCodeModal';

export default function InviteCodePage() {
  const { user, fetchCurrentUser } = useAuthStore();
  const isAdmin = checkIsAdmin(user);
  const appUrl = `${import.meta.env.VITE_APP_URL}`;

  // User Invite Card State
  const inviteCode = user?.inviteCode || '';
  const [referralCode, setReferralCode] = useState(inviteCode);
  const inviteLink = `${appUrl}?invitecode=${inviteCode}`;
  const referralGainsXP = user?.xpFromReferrals || 0;
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Admin State
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false); // Default false, fetch only if admin
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateUserCode, setOpenCreateUserCode] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'used' | 'unused'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  // Sync state with user prop if it changes
  useEffect(() => {
    if (user?.inviteCode) {
      setReferralCode(user.inviteCode);
    }
  }, [user?.inviteCode]);


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
    const trimmedCode = code.trim();

    if (trimmedCode.length < 3 || trimmedCode.length > 30) {
      toast.error('Invite code must be between 3 and 30 characters');
      return;
    }

    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmedCode)) {
      toast.error(
        'Code can only contain letters, numbers, hyphens, and underscores'
      );
      return;
    }

    setLoadingUpdate(true);
    try {
      await inviteCodeService.customMyCode(trimmedCode);
      await fetchCurrentUser();
      setIsEditingCode(false);
      toast.success('Invite code updated successfully');
    } catch (error: any) {
      console.log('Failed to update code', error);
      toast.error(
        error?.response?.data?.errors?.code ||
        'Failed to update invite code. Please try again.'
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Admin logic
  const refetchCodes = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingCodes(true);
    try {
      const isWalletSearch = search.startsWith('0x') || search.length > 30; // Simple heuristic

      const requestParams = {
        page,
        limit: pageSize,
        status: status === 'all' ? undefined : status,
        search: isWalletSearch ? '' : String(search).trim(),
        appWallet: isWalletSearch ? search.trim() : '',
      };

      const res = await inviteCodeService.getAll(requestParams);
      setCodes(res.data || []);
      setTotal(res.meta.total || 0);
    } catch (err) {
      console.error('Failed to fetch invite codes:', err);
    } finally {
      setLoadingCodes(false);
    }
  }, [isAdmin, search, status, page]);

  useEffect(() => {
    if (isAdmin) {
      refetchCodes();
    }
  }, [refetchCodes, isAdmin]);

  const handleConfirmCreate = async ({
    count,
    prefix,
  }: {
    count: number;
    prefix?: string;
  }) => {
    try {
      await inviteCodeService.generateCode({ count, prefix });
      await refetchCodes();
      setOpenCreate(false);

      toast.success(
        `Created ${count} invite code${count > 1 ? 's' : ''} successfully!`
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.errors?.prefix || 'Something when wrong';
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
      await refetchCodes();
      setOpenCreateUserCode(false);

      toast.success(`Created invite code for user successfully!`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Something when wrong';
      throw new Error(message);
    }
  };


  const totalPages = Math.ceil(total / pageSize);

  if (!user) return null;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Referral Program</h1>
        <p className="text-muted-foreground">
          Invite friends and earn XP rewards.
        </p>
      </div>

      <Card className="border-border bg-card overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Referral Status</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Share your unique code with friends. When they sign up using your code, you'll earn XP bonuses.
              </p>

              <div className="flex items-center gap-4">
                <div className="rounded-lg border p-4 border-border bg-muted/30 w-full max-w-md">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">My Referral Code</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        3–30 characters. Letters, numbers, - and _ only.
                      </TooltipContent>
                    </Tooltip>
                  </div>


                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Code"
                        value={referralCode}
                        disabled={!isEditingCode}
                        className={`pr-10 font-mono text-base ${!isEditingCode ? 'bg-background/50 border-transparent shadow-none' : 'bg-background'}`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setReferralCode(e.target.value)
                        }
                      />
                      {!isEditingCode && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-xs text-green-500 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isEditingCode && (
                        <Button
                          className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setReferralCode(inviteCode);
                            setIsEditingCode(false);
                          }}
                          disabled={loadingUpdate}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title={isEditingCode ? "Save" : "Edit"}
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (isEditingCode) {
                            handleCustomMyCode(referralCode);
                          } else {
                            setIsEditingCode(!isEditingCode);
                          }
                        }}
                        disabled={loadingUpdate}
                      >
                        {loadingUpdate ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isEditingCode ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Copy code"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyToClipboard(referralCode!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Invite Link</Label>
                    <div className="flex items-center justify-between gap-3 bg-background/50 p-2 rounded-md border border-border/50">
                      <div className="truncate text-xs font-mono text-muted-foreground flex-1">{inviteLink}</div>
                      <Button
                        onClick={() => handleCopyToClipboard(inviteLink, 'Referral link')}
                        className="h-7 w-7 rounded-sm text-muted-foreground hover:text-foreground"
                        title="Copy link"
                        variant="ghost"
                        size="icon"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto min-w-[200px]">
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 opacity-50" />
                <div className="relative z-10">
                  <div className="text-sm font-medium text-blue-400 mb-1">Total Referral Gains</div>
                  <div className="text-3xl font-bold tracking-tight mb-1">
                    {referralGainsXP.toLocaleString('en-US')}
                  </div>
                  <div className="text-xs text-muted-foreground">XP Earned</div>

                  <div className="text-sm font-medium text-blue-400 mb-1 mt-4">Total Referrals</div>
                  <div className="text-3xl font-bold tracking-tight mb-1">
                    {referralGainsXP / 200}
                  </div>
                  <div className="text-xs text-muted-foreground">Referrals</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <div className="space-y-4 pt-6 border-t font-sans">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Admin: Manage All Codes</h2>
            <div className="flex gap-2">
              <Button onClick={() => setOpenCreate(true)}>Generate Codes</Button>
              <Button variant="outline" onClick={() => setOpenCreateUserCode(true)}>
                User Code
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={status}
              onValueChange={(v: any) => setStatus(v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unused">Unused Only</SelectItem>
                <SelectItem value="used">Used Only</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search by code or wallet..."
              className="max-w-sm"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableCell className="font-semibold">Code</TableCell>
                  <TableCell className="font-semibold">Status</TableCell>
                  <TableCell className="font-semibold text-right">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCodes ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : codes.length > 0 ? (
                  codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell>
                        {code.usedBy ? (
                          <span className="text-red-500 text-xs font-medium px-2 py-1 rounded-full bg-red-500/10">Used</span>
                        ) : (
                          <span className="text-green-500 text-xs font-medium px-2 py-1 rounded-full bg-green-500/10">Unused</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToClipboard(code.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No codes found matching criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!loadingCodes && total > 0 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

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
        </div>
      )}
    </div>
  );
}
