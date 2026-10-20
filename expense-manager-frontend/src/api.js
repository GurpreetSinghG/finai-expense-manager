const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function readResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.details ||
        data?.message ||
        data?.error ||
        fallbackMessage + ` (${response.status})`
    );
  }
  return data;
}

function getToken() {
  const token = sessionStorage.getItem("finai_access_token");
  if (!token) throw new Error("Your session has ended. Please sign in again.");
  return token;
}

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await readResponse(response, "Login failed");
  if (!data?.accessToken) {
    throw new Error("The login response did not contain an access token.");
  }
  sessionStorage.setItem("finai_access_token", data.accessToken);
  if (data.user) sessionStorage.setItem("finai_user", JSON.stringify(data.user));
  return data;
}

export async function registerUser({ fullName, username, password, email }) {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: fullName.trim(),
      username: username.trim(),
      password,
      email: email.trim(),
    }),
  });
  return readResponse(response, "Registration failed");
}

export async function getTransactionPage(page = 0, size = 10) {
  const response = await fetch(
    `${API_BASE_URL}/transaction?page=${page}&size=${size}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  return readResponse(response, "Unable to load transactions");
}

export async function getTransactions(page = 0, size = 10) {
  const result = await getTransactionPage(page, size);
  return result.content ?? [];
}

export async function createTransaction(transaction) {
  const response = await fetch(`${API_BASE_URL}/transaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(transaction),
  });
  return readResponse(response, "Unable to create transaction");
}

export async function getFinancialSummary() {
  const response = await fetch(`${API_BASE_URL}/financial-summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return readResponse(response, "Unable to load financial summary");
}


export async function getBudgets() {
  const response = await fetch(`${API_BASE_URL}/budget`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to load budgets");
}

export async function getBudgetProgress(year, month) {
  const response = await fetch(
    `${API_BASE_URL}/budget/progress?year=${year}&month=${month}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  return readResponse(response, "Unable to load budget progress");
}

export async function createBudget(budget) {
  const response = await fetch(`${API_BASE_URL}/budget`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(budget),
  });

  return readResponse(response, "Unable to create budget");
}

export async function updateBudget(id, budget) {
  const response = await fetch(`${API_BASE_URL}/budget/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(budget),
  });

  return readResponse(response, "Unable to update budget");
}

export async function deleteBudget(id) {
  const response = await fetch(`${API_BASE_URL}/budget/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to delete budget");
}


export async function getFinancialGoals() {
  const response = await fetch(`${API_BASE_URL}/financial-goal`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to load savings goals");
}

export async function createFinancialGoal(goal) {
  const response = await fetch(`${API_BASE_URL}/financial-goal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(goal),
  });

  return readResponse(response, "Unable to create savings goal");
}

export async function updateFinancialGoal(id, goal) {
  const response = await fetch(`${API_BASE_URL}/financial-goal/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(goal),
  });

  return readResponse(response, "Unable to update savings goal");
}

export async function deleteFinancialGoal(id) {
  const response = await fetch(`${API_BASE_URL}/financial-goal/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to delete savings goal");
}


export async function getInvestments() {
  const response = await fetch(`${API_BASE_URL}/investment`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to load investments");
}

export async function getInvestmentById(id) {
  const response = await fetch(`${API_BASE_URL}/investment/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to load investment");
}

export async function createInvestment(investment) {
  const response = await fetch(`${API_BASE_URL}/investment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(investment),
  });

  return readResponse(response, "Unable to create investment");
}

export async function updateInvestment(id, investment) {
  const response = await fetch(`${API_BASE_URL}/investment/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(investment),
  });

  return readResponse(response, "Unable to update investment");
}

export async function deleteInvestment(id) {
  const response = await fetch(`${API_BASE_URL}/investment/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return readResponse(response, "Unable to delete investment");
}
