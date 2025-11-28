import { CircleFadingPlus, Loader2, Pen } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateTopicValues, Topic, topicServices } from "../../services/topic-admin.service";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";


interface CreateUpdateTopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUpdate?: boolean;
  item?: Topic;
  onSuccess?: () => void;
}
export default function CreateUpdateTopicModal({
  open,
  onOpenChange,
  isUpdate,
  item,
  onSuccess,
}: CreateUpdateTopicModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const {
    handleSubmit,
    clearErrors,
    formState: { errors },
    setValue,
    control,
    reset,
  } = useForm<CreateTopicValues>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateTopicValues) => {
    setIsCreating(true);
    try {
      if (isUpdate && item) {
        const res = await topicServices.updateTopic(item?.id, data);
        if (res) {
          onOpenChange(false)
          toast.success("Update topic successfully")
          onSuccess?.()
        }
      } else {
        const res = await topicServices.createTopic(data);
        if (res) {
          onOpenChange(false)
          toast.success("Create topic successfully")
          onSuccess?.()
        }
      }
    } catch (error) {
      console.log("Failed to create topic: ", error)
    } finally {
      setIsCreating(false)
    }
  };


  useEffect(() => {
    if (open) {
      if (isUpdate && item) {
        reset({
          name: item.name,
          description: item.description ?? '',
        });
      } else {
        reset({
          name: '',
          description: '',
        });
      }
    }
  }, [open, isUpdate, item, reset]);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(e: Event) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpdate ? 'Update Topic' : 'Create Topic'}
          </DialogTitle>

          <DialogDescription className="text-left">
            {isUpdate
              ? 'Update the details of your topic.'
              : 'Provide details to create your topic.'}
          </DialogDescription>
        </DialogHeader>

        <form
          key={isUpdate ? item?.id : 'create'}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 overflow-x-hidden"
        >
          <div className="space-y-2">
            <Label htmlFor="name">
              Name<span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="name"
              rules={{ required: !isUpdate }}
              render={({ field }) => (
                <Input
                  id="name"
                  placeholder="Ex: Crypto"
                  {...field}
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-500">Topic name is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Textarea
                  id="description"
                  placeholder="Provide details or context about this topic (optional)"
                  {...field}
                />
              )}
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
      </DialogContent>
    </Dialog>
  );
}