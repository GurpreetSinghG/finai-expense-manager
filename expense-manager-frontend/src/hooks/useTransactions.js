import { useEffect, useState } from "react";
import { createTransaction, getTransactionPage, getFinancialSummary } from "../api";

const PAGE_SIZE = 10;

function getTodayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mapTransaction(transaction) {
  const amount = Number(transaction.amount);
  return {
    ...transaction,
    name: transaction.description ?? transaction.name ?? "Transaction",
    amount: transaction.type === "CREDIT" ? Math.abs(amount) : -Math.abs(amount),
  };
}

export function useTransactions(isAuthenticated) {
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingAllTransactions, setIsLoadingAllTransactions] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState("");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [financialSummary, setFinancialSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "Groceries",
    type: "expense",
    amount: "",
    transactionDate: getTodayLocalDate(),
  });

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let cancelled = false;

    async function loadTransactions() {
      setIsLoadingTransactions(true);
      setTransactionError("");
      try {
        const result = await getTransactionPage(0, PAGE_SIZE);
        if (cancelled) return;
        const pageTransactions = (result.content ?? []).map(mapTransaction);
        setTransactions(pageTransactions);
        setTotalPages(result.totalPages ?? 0);
        setTotalElements(result.totalElements ?? pageTransactions.length);
        setShowAllTransactions(false);
      } catch (error) {
        if (!cancelled) setTransactionError(error.message || "Unable to load transactions.");
      } finally {
        if (!cancelled) setIsLoadingTransactions(false);
      }
    }

    loadTransactions();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let cancelled = false;
    async function loadSummary() {
      setIsLoadingSummary(true);
      setSummaryError("");
      try {
        const result = await getFinancialSummary();
        if (!cancelled) setFinancialSummary(result);
      } catch (error) {
        if (!cancelled) {
          setFinancialSummary(null);
          setSummaryError(error.message || "Unable to load financial summary.");
        }
      } finally {
        if (!cancelled) setIsLoadingSummary(false);
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  async function loadFirstPage() {
    const result = await getTransactionPage(0, PAGE_SIZE);
    const pageTransactions = (result.content ?? []).map(mapTransaction);
    setTransactions(pageTransactions);
    setTotalPages(result.totalPages ?? 0);
    setTotalElements(result.totalElements ?? pageTransactions.length);
    setShowAllTransactions(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTransactionError("");
    setTransactionMessage("");

    const amount = Number(formData.amount);
    if (!formData.name.trim() || !Number.isFinite(amount) || amount <= 0 || !formData.transactionDate) {
      setTransactionError("Enter a transaction name, a valid amount, and a date.");
      return;
    }

    setIsSavingTransaction(true);
    try {
      await createTransaction({
        description: formData.name.trim(),
        amount,
        type: formData.type === "income" ? "CREDIT" : "DEBIT",
        category: formData.category,
        transactionDate: formData.transactionDate,
      });

      setFormData({
        name: "",
        category: "Groceries",
        type: "expense",
        amount: "",
        transactionDate: getTodayLocalDate(),
      });
      setTransactionMessage("Transaction saved successfully.");
      try {
        await loadFirstPage();
        try {
          const summary = await getFinancialSummary();
          setFinancialSummary(summary);
          setSummaryError("");
        } catch (summaryRefreshError) {
          setSummaryError(summaryRefreshError.message || "Unable to refresh financial summary.");
        }
      } catch (refreshError) {
        setTransactionError(`Transaction was saved, but the list could not refresh: ${refreshError.message || "Please reload the page."}`);
      }
    } catch (error) {
      setTransactionError(error.message || "Unable to save the transaction.");
    } finally {
      setIsSavingTransaction(false);
    }
  }

  async function handleViewAllTransactions() {
    if (showAllTransactions) {
      setTransactions((current) => current.slice(0, PAGE_SIZE));
      setShowAllTransactions(false);
      return;
    }

    setIsLoadingAllTransactions(true);
    setTransactionError("");
    setTransactionMessage("");
    try {
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
          getTransactionPage(index + 1, PAGE_SIZE)
        )
      );
      const additionalTransactions = remainingPages.flatMap((page) =>
        (page.content ?? []).map(mapTransaction)
      );
      setTransactions((current) => [...current.slice(0, PAGE_SIZE), ...additionalTransactions]);
      setShowAllTransactions(true);
    } catch (error) {
      setTransactionError(error.message || "Unable to load all transactions.");
    } finally {
      setIsLoadingAllTransactions(false);
    }
  }

  function resetTransactions() {
    setTransactions([]);
    setTotalPages(0);
    setTotalElements(0);
    setShowAllTransactions(false);
    setTransactionError("");
    setTransactionMessage("");
    setFinancialSummary(null);
    setSummaryError("");
    setFormData({
      name: "",
      category: "Groceries",
      type: "expense",
      amount: "",
      transactionDate: getTodayLocalDate(),
    });
  }

  const listedIncome = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);
  const listedExpenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

  const totalIncome = Number(financialSummary?.totalCredits ?? listedIncome);
  const totalExpenses = Number(financialSummary?.totalDebits ?? listedExpenses);
  const netCashFlow = Number(financialSummary?.netBalance ?? (totalIncome - totalExpenses));
  const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return {
    transactions,
    totalElements,
    isLoadingTransactions,
    isLoadingAllTransactions,
    isSavingTransaction,
    showAllTransactions,
    transactionError,
    transactionMessage,
    isLoadingSummary,
    summaryError,
    formData,
    handleChange,
    handleSubmit,
    handleViewAllTransactions,
    resetTransactions,
    totalIncome,
    totalExpenses,
    netCashFlow,
    savingsRate,
    formatCurrency,
  };
}
