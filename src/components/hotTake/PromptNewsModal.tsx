import { Loader2, WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreateNewsByPrompt, GeneratedNewsPreview, newsService } from "../../services/news.service";
import { Topic, topicServices } from "../../services/topic-admin.service";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { CustomTopicSelect } from "./CustomTopicSelect";


type PromptNewsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void
  onApply?: (data: GeneratedNewsPreview) => void
}

const PromptNewsModal = ({ open, onOpenChange, onApply }: PromptNewsProps) => {
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

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

  const { handleSubmit,
    formState: { errors },
    control,
    clearErrors,
    reset } = useForm<CreateNewsByPrompt>({
      defaultValues: {
        topicId: '',
        prompt: ''
      }
    })

  const handleClose = () => {
    onOpenChange(false)
    clearErrors()
    reset({
      topicId: '',
      prompt: ''
    })
  }

  const onSubmit = async (data: CreateNewsByPrompt) => {
    setIsGenerating(true);
    try {
      const res = await newsService.generateNewsByPrompt(data)

      if (res) {
        toast.success('Generating news successfully!');
        handleClose();
        onApply?.(res)
      }
    } catch (error: any) {
      console.error('Generating news failed', error)
      toast.error(error?.response?.data?.message || "Failed to generating news")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="sm:max-w-2xl h-[70vh] sm:h-[60vh]"
        onInteractOutside={(e: Event) => {
          if (isGenerating) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Generate News
          </DialogTitle>
          <DialogDescription className="text-left">
            Enter a prompt to generate a news draft using AI.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-5 overflow-x-hidden'>

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

          <div className='space-y-2'>
            <Label htmlFor="prompt">
              Prompt<span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="prompt"
              rules={{
                required: "Prompt is required",
                minLength: {
                  value: 10,
                  message: "Prompt must be at least 10 characters",
                },
              }}
              render={({ field }) => (
                <Textarea
                  id="prompt"
                  placeholder="e.g. Write a crypto news article about Bitcoin rising after ETF inflows."
                  rows={4}
                  {...field}
                />
              )}
            />
            {errors.prompt && (
              <p className="text-xs text-red-500">
                {errors.prompt.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white cursor-pointer"
              type="submit"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <WandSparkles className="w-3 h-5 mr-1" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PromptNewsModal
