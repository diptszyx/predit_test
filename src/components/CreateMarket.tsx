import { Controller, useForm } from 'react-hook-form';

import { CircleFadingPlus, Loader2, Pen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { uploadFile } from '../services/file.service';
import {
  CreateMarketValues,
  marketAdminServices,
} from '../services/market-admin.service';
import { Market } from '../services/market.service';
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

export default function CreateUpdateMarketModal({
  open,
  onOpenChange,
  isUpdate,
  item,
  onSuccess,
}: CreateUpdateMarketModalProps) {
  const { oracleId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const {
    handleSubmit,
    clearErrors,
    formState: { errors },
    setValue,
    getValues,
    control,
    reset,
  } = useForm<CreateMarketValues>({
    mode: 'onChange',
    defaultValues: {
      question: '',
      description: '',
      closeAt: undefined,
      imageUrl: null,
      oracleId: oracleId,
    },
  });

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
      if (uploadResponse.file.path) {
        setValue('imageUrl', uploadResponse.file.path ?? null);
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
          closeAt: data.closeAt ? new Date(data.closeAt).toISOString() : undefined,
        };
        const res = await marketAdminServices.createMarket(payload);
        if (res) {
          toast.success('Create market successfully!');
          handleClose();
          onSuccess?.(); // Call onSuccess callback
        }
      } else {
        if (!item) return
        const payload = {
          question: data.question,
          description: data.description,
          imageUrl: data.imageUrl
        };
        const res = await marketAdminServices.updateMarket(item?.id, payload);
        if (res) {
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
          imageUrl: item.imageUrl ?? null,
          oracleId,
        });
      } else {
        reset({
          question: '',
          description: '',
          closeAt: undefined,
          imageUrl: null,
          oracleId,
        });
      }
    }
  }, [open, isUpdate, item, oracleId, reset]);

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
            {isUpdate ? "Update Market" : "Create Market"}
          </DialogTitle>
          <DialogDescription className="text-left">
            {isUpdate ? 'Update the details of your market.' :
              "Provide details to create your market."
            }
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

            {
              !isUpdate &&
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
            }
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
                {getValues('imageUrl') ? (
                  <img
                    src={getValues('imageUrl')!}
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
                type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isUpdate ? "Updating" : "Creating..."}
                  </>
                ) : (
                  <>
                    {isUpdate ?
                      <Pen className="w-4 h-4 mr-1" />
                      :
                      <CircleFadingPlus className="w-4 h-4 mr-1" />
                    }
                    {isUpdate ? "Update" : "Create"}
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
