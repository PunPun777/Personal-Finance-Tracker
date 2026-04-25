import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Accounts from "./pages/Accounts";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/accounts" element={<Accounts />} />
      </Route>
    </Routes>
  );
}

export default App;
