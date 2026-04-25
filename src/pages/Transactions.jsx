import { useState, useMemo, useRef, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
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
import TransactionForm from "../components/transactions/TransactionForm";
import { TRANSACTION_CATEGORIES } from "../constants/transactionCategories";
import { useTransactions } from "../hooks/useTransactions";

const AMOUNT_CONFIG = {
  income: {
    icon: ArrowUpRight,
    iconClass: "text-emerald-500",
    amountClass: "text-emerald-500 font-medium",
  },
  expense: {
    icon: ArrowDownRight,
    iconClass: "text-rose-500",
    amountClass: "text-foreground font-medium",
  },
};

function AmountCell({ type, amount }) {
  const config = AMOUNT_CONFIG[type] ?? AMOUNT_CONFIG.expense;
  const Icon = config.icon;
  return (
    <div className="flex items-center justify-end gap-1">
      <Icon className={`h-4 w-4 ${config.iconClass}`} />
      <span className={config.amountClass}>${Number(amount).toFixed(2)}</span>
    </div>
  );
}

function TableSkeleton() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 5 }).map((__, j) => (
        <TableCell key={j}>
          <div className="h-4 bg-muted rounded animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function FeedbackBanner({ feedback }) {
  if (!feedback) return null;
  const isSuccess = feedback.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium border ${
        isSuccess
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-destructive/10 text-destructive border-destructive/20"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {feedback.message}
    </div>
  );
}

export default function Transactions() {
  const { transactions, isLoading, isSubmitting, error, create, update, remove, reload } =
    useTransactions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const showFeedback = useCallback((message, type = "error") => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ message, type });
    feedbackTimer.current = setTimeout(() => setFeedback(null), 4000);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterDate("");
  }, []);

  const hasActiveFilters = searchQuery || filterCategory !== "all" || filterDate;

  const handleOpenAddDialog = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await remove(id);
    if (!result.success) showFeedback(result.message);
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
      const matchDate =
        !filterDate || new Date(t.date).toISOString().split("T")[0] === filterDate;
      return matchSearch && matchCategory && matchDate;
    });
  }, [transactions, searchQuery, filterCategory, filterDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and view your transaction history.
          </p>
        </div>
        <Button onClick={handleOpenAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <FeedbackBanner feedback={feedback} />

      {error && !isLoading && (
        <div className="flex items-center justify-between gap-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={reload} className="gap-2 shrink-0">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>A list of your recent income and expenses.</CardDescription>
        </CardHeader>

        <div className="px-6 pb-4 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search description..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
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
          </div>

          <div className="w-full sm:w-[150px]">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {transactions.length === 0
                        ? "No transactions found. Add your first one!"
                        : "No transactions match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.description || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {t.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <AmountCell type={t.type} amount={t.amount} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(t)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(t._id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
    </div>
  );
}
