import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LoadConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export function LoadConfirmDialog({
  onCancel,
  onConfirm,
  open,
}: LoadConfirmDialogProps) {
  return (
    <AlertDialog onOpenChange={(isOpen) => !isOpen && onCancel()} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace current project?</AlertDialogTitle>
          <AlertDialogDescription>
            Loading a project will replace all current photos and slides. Any
            unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Load Project</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
