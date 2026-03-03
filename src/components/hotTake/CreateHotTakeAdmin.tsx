import { CircleFadingPlus, Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateNewsValues, News, newsService } from '../../services/news.service';
import { OracleEntity, oraclesServices } from '../../services/oracles.service';
import { Topic, topicServices } from '../../services/topic-admin.service';
import { CustomOracleSelect } from '../CreateMarket';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CustomTopicSelect } from './CustomTopicSelect';

type CreateHotTakeAdminProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void
  onSuccess?: Dispatch<SetStateAction<News[]>>
}

const CreateHotTakeAdmin = ({ open, onOpenChange, onSuccess }: CreateHotTakeAdminProps) => {
  const [oracles, setOracles] = useState<OracleEntity[]>([]);
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { handleSubmit,
    formState: { errors },
    control,
    clearErrors,
    reset } = useForm<CreateNewsValues>({
      defaultValues: {
        title: '',
        content: '',
        oracleId: '',
        topicId: ''
      }
    })

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

    fetchOracles()
  }, []);

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
      oracleId: '',
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
    } catch (error) {
      console.error('Create news failed', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create News
          </DialogTitle>
          <DialogDescription className="text-left">
            Provide the details below to publish a new article.
          </DialogDescription>
        </DialogHeader>

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
                  placeholder="Ex: Global Markets React to Fed Policy Update"
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
                {errors.oracleId.message}
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
                  rows={6}
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
  )
}

export default CreateHotTakeAdmin
