import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function Group() {
  const { id } = useParams();

  // group and members
  const [group, setGroup] = useState(null);
  const [email, setEmail] = useState('');

  // expenses
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitAmong, setSplitAmong] = useState([]);

  // balances
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [payments, setPayments] = useState([]);

  // ---------- loading data ----------

  async function loadGroup() {
    try {
      const response = await api.get('/groups/' + id);
      setGroup(response.data);
    } catch (error) {
      alert('Could not load group');
    }
  }

  async function loadExpenses() {
    try {
      const response = await api.get('/expenses/' + id);
      setExpenses(response.data);
    } catch (error) {
      alert('Could not load expenses');
    }
  }

  async function loadBalances() {
    try {
      const response = await api.get('/balances/' + id);
      setBalances(response.data.balances);
      setPayments(response.data.payments);
    } catch (error) {
      alert('Could not load balances');
    }
  }
  async function loadSettlements() {
  try {
    const response = await api.get('/settlements/' + id);
    setSettlements(response.data);
  } catch (error) {
    alert('Could not load payment history');
  }
}

  // run once when the page opens
  useEffect(function () {
    loadGroup();
    loadExpenses();
    loadBalances();
    loadSettlements();
  }, []);

  // ---------- actions ----------

  async function handleAddMember() {
    try {
      await api.post('/groups/' + id + '/members', { email: email });
      setEmail('');
      loadGroup();
      loadBalances(); // new member should appear in balances
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Cannot reach backend');
      }
    }
  }

  // tick or untick a person in the split list
  function toggleMember(memberId) {
    if (splitAmong.includes(memberId)) {
      setSplitAmong(
        splitAmong.filter(function (x) {
          return x !== memberId;
        })
      );
    } else {
      setSplitAmong([...splitAmong, memberId]);
    }
  }

  async function handleAddExpense() {
    if (!description || !amount || !paidBy || splitAmong.length === 0) {
      alert('Fill every field and tick at least one person');
      return;
    }

    try {
      await api.post('/expenses/' + id, {
        description: description,
        amount: Number(amount),
        paidBy: paidBy,
        splitAmong: splitAmong,
      });

      setDescription('');
      setAmount('');
      setPaidBy('');
      setSplitAmong([]);
      loadExpenses();
      loadBalances();
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Cannot reach backend');
      }
    }
  }

  // record that a suggested payment was made
  async function handleSettle(payment) {
    try {
      await api.post('/settlements/' + id, {
        from: payment.from.id,
        to: payment.to.id,
        amount: payment.amount / 100, // backend expects rupees
      });
      loadBalances();
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Cannot reach backend');
      }
    }
  }

  // ---------- screen ----------

  if (group === null) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{group.name}</h2>

      <h3>Members</h3>
      {group.members.map(function (member) {
        return (
          <p key={member._id}>
            {member.name} ({member.email})
          </p>
        );
      })}

      <h4>Add a member</h4>
      <input
        placeholder="Member's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleAddMember}>Add</button>

      <h3>Add an expense</h3>
      <input
        placeholder="Description (e.g. Dinner)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <input
        type="number"
        placeholder="Amount in rupees"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />

      <p>Who paid?</p>
      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
        <option value="">Select a person</option>
        {group.members.map(function (member) {
          return (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          );
        })}
      </select>

      <p>Split between:</p>
      {group.members.map(function (member) {
        return (
          <div key={member._id}>
            <input
              type="checkbox"
              checked={splitAmong.includes(member._id)}
              onChange={() => toggleMember(member._id)}
            />
            {member.name}
          </div>
        );
      })}

      <button onClick={handleAddExpense}>Add expense</button>

      <h3>Expenses</h3>
      {expenses.length === 0 && <p>No expenses yet</p>}
      {expenses.map(function (expense) {
        return (
          <p key={expense._id}>
            {expense.description}: ₹{expense.amount / 100} (paid by {expense.paidBy.name})
          </p>
        );
      })}

      <h3>Balances</h3>
      {balances.map(function (b) {
        return (
          <p key={b.id}>
            {b.name}:{' '}
            {b.amount > 0 && 'gets ₹' + b.amount / 100}
            {b.amount < 0 && 'owes ₹' + -b.amount / 100}
            {b.amount === 0 && 'settled up'}
          </p>
        );
      })}

      <h3>Suggested payments</h3>
      {payments.length === 0 && <p>Everyone is settled up</p>}
      {payments.map(function (p, index) {
        return (
          <p key={index}>
            {p.from.name} pays {p.to.name} ₹{p.amount / 100}{' '}
            <button onClick={() => handleSettle(p)}>Settle</button>
          </p>
        );
      })}
      <h3>Payment history</h3>
{settlements.length === 0 && <p>No payments yet</p>}
{settlements.map(function (s) {
  return (
    <p key={s._id}>
      {s.from.name} paid {s.to.name} ₹{s.amount / 100} on{' '}
      {new Date(s.date).toLocaleDateString()}
    </p>
  );
})}
    </div>
  );
}

export default Group;