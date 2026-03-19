import { CircleFadingPlus, Loader2, WandSparkles } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateNewsValues, GeneratedNewsPreview, News, newsService } from '../../services/news.service';
import { Topic, topicServices } from '../../services/topic-admin.service';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CustomTopicSelect } from './CustomTopicSelect';
import PromptNewsModal from './PromptNewsModal';

type CreateHotTakeAdminProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void
  onSuccess?: Dispatch<SetStateAction<News[]>>
}

const CreateHotTakeAdmin = ({ open, onOpenChange, onSuccess }: CreateHotTakeAdminProps) => {
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [openPromptModal, setOpenPromptModal] = useState<boolean>(false)
  const [isCreating, setIsCreating] = useState(false);

  const { handleSubmit,
    formState: { errors },
    control,
    clearErrors,
    reset,
    setValue } = useForm<CreateNewsValues>({
      defaultValues: {
        title: '',
        content: '',
        topicId: ''
      }
    })

  useEffect(() => {
    (async () => {
      try {
        const topics = await topicServices.getAllTopics();
        setTopicList(topics);
      } catch (err) {
        console.error(err);
      } finally {
      }
    })();
  }, []);

  const handleClose = () => {
    onOpenChange(false);
    clearErrors()
    reset({
      title: '',
      content: '',
      topicId: '',
    });
  };

  const onSubmit = async (data: CreateNewsValues) => {
    setIsCreating(true);
    try {
      const res = await newsService.createAdmin(data)

      if (res) {
        toast.success('Create news successfully!');
        handleClose();
        onSuccess?.((prev) => [res, ...prev]);
      }
    } catch (error: any) {
      console.error('Create news failed', error)
      toast.error(error?.response?.data?.message || "Failed to create news")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-3xl h-[90vh]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2">
                Create News
              </DialogTitle>
              <DialogDescription className="text-left mt-1">
                Provide the details below to publish a new article.
              </DialogDescription>
            </div>

            <Button
              type="button"
              onClick={() => {
                setOpenPromptModal(true)
                onOpenChange(false)
              }}
              className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white cursor-pointer shrink-0 mr-4"
            >
              <WandSparkles className="w-4 h-4" />
              Gen with AI
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-5 overflow-x-hidden'>
            <div className='space-y-2'>
              <Label htmlFor="title">
                Title<span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="title"
                rules={{
                  required: "Title is required",
                  minLength: {
                    value: 10,
                    message: "Title must be at least 10 characters",
                  },
                }}
                render={({ field }) => (
                  <Input
                    id="title"
                    placeholder="e.g: Global Markets React to Fed Policy Update"
                    {...field}
                  />
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topicId">
                Topic<span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="topicId"
                rules={{ required: 'Topic is required' }}
                render={({ field }) => (
                  <CustomTopicSelect
                    value={field.value}
                    onChange={field.onChange}
                    topics={topicList}
                  />
                )}
              />
              {errors.topicId && (
                <p className="text-xs text-red-500">
                  {errors.topicId.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content
                <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="content"
                rules={{
                  required: "Content is required",
                  minLength: {
                    value: 30,
                    message: "Content must be at least 30 characters",
                  },
                }}
                render={({ field }) => (
                  <Textarea
                    id="content"
                    placeholder="Write a detailed analysis or market update related to this news..."
                    rows={10}
                    {...field}
                  />
                )}
              />
              {errors.content && (
                <p className="text-xs text-red-500">
                  {errors.content.message}
                </p>
              )}
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
                className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer"
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CircleFadingPlus className="w-4 h-4 mr-1" />
                    Create
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PromptNewsModal
        open={openPromptModal}
        onOpenChange={setOpenPromptModal}
        onApply={(data: GeneratedNewsPreview) => {
          setValue('title', data.title)
          setValue('content', data.content)
          if (data.topic.id) setValue('topicId', data.topic.id)
          setOpenPromptModal(false)
          onOpenChange(true)
        }} />
    </>
  )
}

export default CreateHotTakeAdmin
