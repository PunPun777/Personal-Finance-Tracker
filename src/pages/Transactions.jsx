import { useState, useMemo, useRef, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Receipt,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import TransactionForm from "../components/transactions/TransactionForm";
import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";
import { useTransactions } from "../hooks/useTransactions";
import { ErrorBanner, FeedbackBanner } from "../components/ui/Banners";
import { AmountCell } from "../components/transactions/AmountCell";
const TYPE_BADGE_CONFIG = {
  income: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  expense: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
};

function TransactionTypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${TYPE_BADGE_CONFIG[type] ?? ""}`}>
      {type}
    </span>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
      {category}
    </span>
  );
}

function TableSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 6 }).map((__, j) => (
        <TableCell key={j}>
          <div className="h-4 bg-muted rounded animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function EmptyState({ hasFilters }) {
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div className="rounded-full bg-muted p-4">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {hasFilters ? "No matching transactions" : "No transactions yet"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Add your first transaction to get started."}
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function Transactions() {
  const { transactions, isLoading, isSubmitting, error, create, update, remove, reload } =
    useTransactions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const showFeedback = useCallback((message, type = "error") => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ message, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterType("all");
    setFilterDate("");
  }, []);

  const hasActiveFilters =
    searchQuery || filterCategory !== "all" || filterType !== "all" || filterDate;

  const handleOpenAddDialog = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const result = await remove(deletingId);
    setDeletingId(null);
    if (!result.success) showFeedback(result.message);
    else showFeedback("Transaction deleted.", "success");
  };

  const handleSubmit = async (formData) => {
    const result = editingTransaction
      ? await update(editingTransaction._id, formData)
      : await create(formData);

    if (result.success) {
      setIsDialogOpen(false);
      showFeedback(
        editingTransaction ? "Transaction updated." : "Transaction added.",
        "success"
      );
    } else {
      showFeedback(result.message);
    }
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return transactions.filter((t) => {
      const matchSearch =
        !query || (t.description && t.description.toLowerCase().includes(query));
      const matchCategory = filterCategory === "all" || t.category === filterCategory;
      const matchType = filterType === "all" || t.type === filterType;
      const matchDate =
        !filterDate || new Date(t.date).toISOString().split("T")[0] === filterDate;
      return matchSearch && matchCategory && matchType && matchDate;
    });
  }, [transactions, searchQuery, filterCategory, filterType, filterDate]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and view your transaction history.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <FeedbackBanner feedback={feedback} />
      <ErrorBanner message={!isLoading ? error : null} onRetry={reload} />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription className="mt-1">
                {!isLoading && (
                  <span>
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {filteredTransactions.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {transactions.length}
                    </span>{" "}
                    transactions.
                  </span>
                )}
                {isLoading && "Loading your transactions…"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="px-6 pb-4 flex flex-col sm:flex-row gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search description..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TRANSACTION_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-[150px]"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        <CardContent className="px-6 pt-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredTransactions.length === 0 ? (
                  <EmptyState hasFilters={!!hasActiveFilters} />
                ) : (
                  filteredTransactions.map((t) => (
                    <TableRow key={t._id} className="group">
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {new Date(t.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{t.description || "—"}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                          <TransactionTypeBadge type={t.type} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 md:hidden sm:block hidden">
                          {t.category}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <TransactionTypeBadge type={t.type} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <CategoryBadge category={t.category} />
                      </TableCell>
                      <TableCell className="text-right">
                        <AmountCell type={t.type} amount={t.amount} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(t)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(t._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Update the details of your transaction."
                : "Fill in the details to add a new transaction."}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            initialData={editingTransaction}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The transaction will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
