import { Controller, useForm } from 'react-hook-form';

import { Check, ChevronDown, CircleFadingPlus, Loader2, Pen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '../services/file.service';
import {
  CreateMarketValues,
  marketAdminServices,
} from '../services/market-admin.service';
import { Market } from '../services/market.service';
import { OracleEntity, oraclesServices } from '../services/oracles.service';
import { Button } from './ui/button';
import { DateTimePicker } from './ui/datetime-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';

interface CreateUpdateMarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUpdate?: boolean;
  item?: Market;
  onSuccess?: () => void;
}

interface CustomOracleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  oracles: OracleEntity[];
}

function CustomOracleSelect({ value, onChange, oracles }: CustomOracleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOracle = oracles.find((o) => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-input-background px-3 py-2 text-sm h-9',
          'hover:bg-input/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !selectedOracle && 'text-muted-foreground'
        )}
      >
        <span>{selectedOracle ? selectedOracle.name : 'Select an oracle'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-md animate-in fade-in-0 zoom-in-95">
          <ScrollArea className="max-h-60 bg-background">
            <div className="p-1 bg-background">
              {oracles.map((oracle) => (
                <button
                  key={oracle.id}
                  type="button"
                  onClick={() => {
                    onChange(oracle.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'relative flex w-full cursor-default items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    oracle.id === value && 'bg-accent'
                  )}
                >
                  {oracle.id === value && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {oracle.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default function CreateUpdateMarketModal({
  open,
  onOpenChange,
  isUpdate,
  item,
  onSuccess,
}: CreateUpdateMarketModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [oracles, setOracles] = useState<OracleEntity[]>([]);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const {
    handleSubmit,
    clearErrors,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm<CreateMarketValues>({
    mode: 'onChange',
    defaultValues: {
      question: '',
      description: '',
      closeAt: undefined,
      imageId: null,
      oracleId: undefined,
    },
  });

  // Fetch oracles list
  useEffect(() => {
    const fetchOracles = async () => {
      try {
        const data = await oraclesServices.getAllOracles();
        if (data?.data) {
          setOracles(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch oracles:', error);
      }
    };

    if (!isUpdate) {
      fetchOracles();
    }
  }, [isUpdate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, GIF)');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const uploadResponse = await uploadFile(file);
      if (uploadResponse.file.id) {
        // Store the image ID for backend reference
        setValue('imageId', uploadResponse.file.id);
        // Store the path for preview
        setPreviewImageUrl(uploadResponse.file.path ?? null);
        toast.success('Upload image successfully');
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(
        error?.response?.data?.message ||
        'Failed to upload photo. Please try again.'
      );
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: CreateMarketValues) => {
    setIsCreating(true);

    try {
      if (!isUpdate) {
        const payload = {
          ...data,
          closeAt: data.closeAt
            ? new Date(data.closeAt).toISOString()
            : undefined,
        };
        const res = await marketAdminServices.createMarket(payload);
        if (res) {
          toast.success('Create market successfully!');
          handleClose();
          onSuccess?.(); // Call onSuccess callback
        }
      } else {
        if (!item) return;
        const payload = {
          question: data.question,
          description: data.description,
          // Send imageId if new image uploaded
          ...(data.imageId && { imageId: data.imageId }),
        };
        const res = await marketAdminServices.updateMarket(item?.id, payload);
        if (res) {
          // Update preview URL with fresh image path from response
          if (res.image?.path) {
            setPreviewImageUrl(res.image.path);
          }
          toast.success('Update market successfully!');
          handleClose();
          onSuccess?.(); // Call onSuccess callback
        }
      }
    } catch (error) {
      console.error('Failed to create market: ', error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (isUpdate && item) {
        reset({
          question: item.question,
          description: item.description ?? '',
          imageId: item.image?.id ?? null,
          oracleId: item.oracle?.id,
        });
        // Set preview URL from existing item
        setPreviewImageUrl(item.image?.path || item.imageUrl || null);
      } else {
        reset({
          question: '',
          description: '',
          closeAt: undefined,
          imageId: null,
          oracleId: undefined,
        });
        setPreviewImageUrl(null);
      }
    }
  }, [open, isUpdate, item, reset]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl"
        onInteractOutside={(e: Event) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpdate ? 'Update Market' : 'Create Market'}
          </DialogTitle>
          <DialogDescription className="text-left">
            {isUpdate
              ? 'Update the details of your market.'
              : 'Provide details to create your market.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={`${!isUpdate && 'h-[80vh]'} pr-4`}>
          <form
            key={isUpdate ? item?.id : 'create'}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 overflow-x-hidden"
          >
            <div className="space-y-2">
              <Label htmlFor="question">
                Question<span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="question"
                rules={{ required: !isUpdate }}
                render={({ field }) => (
                  <Input
                    id="question"
                    placeholder="Ex: Will Bitcoin reach $100k by the end of 2025?"
                    {...field}
                  />
                )}
              />
              {errors.question && (
                <p className="text-xs text-red-500">Question is required</p>
              )}
            </div>

            {!isUpdate && (
              <div className="space-y-2">
                <Label htmlFor="closeAt" className="px-1">
                  Close At<span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="closeAt"
                  rules={{
                    required: 'Close time is required',
                    validate: (value) => {
                      if (!value) return 'Close time is required';
                      const now = new Date();
                      if (value <= now) {
                        return 'Close time must be in the future';
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value as Date}
                      onChange={(date) => {
                        field.onChange(date);
                        clearErrors('closeAt');
                      }}
                      min={new Date()}
                      modal={true}
                    />
                  )}
                />
                {errors.closeAt && (
                  <p className="text-xs text-red-500">
                    {errors.closeAt.message as string}
                  </p>
                )}
              </div>
            )}

            {!isUpdate && (
              <div className="space-y-2">
                <Label htmlFor="oracleId">
                  Oracle<span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="oracleId"
                  rules={{ required: 'Oracle is required' }}
                  render={({ field }) => (
                    <CustomOracleSelect
                      value={field.value}
                      onChange={field.onChange}
                      oracles={oracles}
                    />
                  )}
                />
                {errors.oracleId && (
                  <p className="text-xs text-red-500">
                    {errors.oracleId.message as string}
                  </p>
                )}
              </div>
            )}


            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Provide details or context about this market (optional)"
                    {...field}
                  />
                )}
              />
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="image">Image</Label>
              <div
                className={cn(
                  'relative w-36 h-36 rounded-xl border-2 border-dashed border-muted-foreground/40',
                  'flex items-center justify-center cursor-pointer overflow-hidden',
                  'hover:border-primary/70 hover:bg-muted/40 transition-colors',
                  isUploadingPhoto && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => {
                  if (!isUploadingPhoto) {
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                aria-label="Upload image"
              >
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt="Market image"
                    className="w-full h-full object-top-left"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
                    <span className="text-3xl leading-none">+</span>
                    <span>Upload image</span>
                    <span className="text-[10px]">Max 5MB (JPG, PNG, GIF)</span>
                  </div>
                )}
              </div>

              <input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploadingPhoto}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUpdate ? 'Updating' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isUpdate ? (
                      <Pen className="w-4 h-4 mr-1" />
                    ) : (
                      <CircleFadingPlus className="w-4 h-4 mr-1" />
                    )}
                    {isUpdate ? 'Update' : 'Create'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
