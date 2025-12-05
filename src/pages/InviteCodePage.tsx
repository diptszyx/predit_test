import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { ADMIN_EMAILS } from '../constants/admin';
import useAuthStore from '../store/auth.store';
import { InviteCode, inviteCodeService } from '../services/invite-code.service';
import CreateInviteCodeModal from '../components/inviteCode/CreateInviteCodeModal';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from '../components/ui/select';
import { toast } from 'sonner';

export default function InviteCodePage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'used' | 'unused'>('all');

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [total, setTotal] = useState(0);

  const params = {
    search,
    status: status === 'all' ? undefined : status,
    page,
    limit: pageSize,
  };

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await (isAdmin ? inviteCodeService.getAll(params) :  inviteCodeService.getMyCode(params));
      setCodes(res.data || []);
      setTotal(res.meta.total || 0);
    } catch (err) {
      console.error('Failed to fetch invite codes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

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
      const message = err?.response?.data?.message || 'Something when wrong';
      throw new Error(message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invite Codes</h1>
        <p className="text-muted-foreground">
          Manage your invite codes or generate new ones to share with users.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Select
            value={status}
            onValueChange={(v: any) => setStatus(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a]">
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
        </div>

        <Button onClick={() => setOpenCreate(true)}>Create Code</Button>
      </div>

      <CreateInviteCodeModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onConfirm={handleConfirmCreate}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableCell className="font-semibold">Code</TableCell>
              <TableCell className="font-semibold">Created At</TableCell>
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
              codes?.map((code, idx) => (
                <TableRow
                  key={code.id}
                  className={idx % 2 === 0 ? 'bg-muted/20' : ''}
                >
                  <TableCell className="font-medium">{code.code}</TableCell>
                  <TableCell>
                    {new Date(code.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {code.usedBy ? (
                      <span className="text-red-500 font-medium">Used</span>
                    ) : (
                      <span className="text-green-600 font-medium">Unused</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
