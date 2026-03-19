import { CircleAlert, Pen, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Topic, topicServices } from "../../services/topic-admin.service"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"
import CreateUpdateTopicModal from "./CreateUpdateTopicModal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"

interface TopicListProps {
  list: Topic[]
  fetchTopics: () => void
  loading: boolean
}

interface TopicItemProps {
  item: Topic
  handleDelete: (id: string) => Promise<void>
  fetchTopics: () => void
}

const TopicList = ({ list, fetchTopics, loading }: TopicListProps) => {
  const handleDeleteTopic = async (id: string) => {
    try {
      const res = await topicServices.deleteTopic(id)
      if (res === 204) {
        fetchTopics()
        toast.success("Topic deleted successfully")
      }
    } catch (error) {
      console.log("Failed to delete topic: ", error)
      toast.error("Failed to delete topic")
    }
  }
  return (
    <div className="border rounded-md overflow-hidden p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && <TableRow>
            <TableCell
              colSpan={4}
              className="py-6 text-center text-muted-foreground"
            >
              Loading...
            </TableCell>
          </TableRow>}

          {list.map((item) => (
            <TopicItem key={item.id} item={item} handleDelete={handleDeleteTopic} fetchTopics={fetchTopics} />
          ))}

          {!loading && list.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-6 text-center text-muted-foreground"
              >
                No topics found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

      </Table>
    </div>
  )
}

const TopicItem = ({ item, handleDelete, fetchTopics }: TopicItemProps) => {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(item.id);
    } finally {
      setIsDeleting(false);
      setOpenDeleteConfirm(false);
    }
  };

  return (
    <>
      <TableRow key={item.id}>
        <TableCell>
          {item.id}
        </TableCell>

        <TableCell>
          {item.name}
        </TableCell>

        <TableCell className="max-w-[320px] truncate text-muted-foreground">
          {item.description}
        </TableCell>

        <TableCell>
          {item.updatedAt
            ? new Date(item.updatedAt).toLocaleString()
            : "-"}
        </TableCell>

        <TableCell className="text-right">
          <div className="inline-flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenUpdate(true)}
            >
              <Pen className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setOpenDeleteConfirm(true)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Confirm delete */}
      <AlertDialog
        open={openDeleteConfirm}
        onOpenChange={setOpenDeleteConfirm}
      >
        <AlertDialogContent className="max-w-md mx-0 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Confirm Delete Topic
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                Are you sure you want to delete this topic?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateUpdateTopicModal open={openUpdate} onOpenChange={setOpenUpdate} isUpdate item={item} onSuccess={fetchTopics} />
    </>
  )
}

export default TopicList

