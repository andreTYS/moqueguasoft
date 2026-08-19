const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', (req, res) => {
    const totalIncome = db.prepare('SELECT COALESCE(SUM(amount),0) AS t FROM income').get().t;
    const totalExpenses = db.prepare('SELECT COALESCE(SUM(amount),0) AS t FROM expenses').get().t;
    const clientsCount = db.prepare('SELECT COUNT(*) AS c FROM clients').get().c;
    const projectsCount = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;
    const unreadMessages = db.prepare('SELECT COUNT(*) AS c FROM contact_messages WHERE read = 0').get().c;

    const monthly = db.prepare(`
        SELECT strftime('%Y-%m', income_date) AS ym, SUM(amount) AS total
        FROM income
        WHERE income_date >= date('now', '-5 months', 'start of month')
        GROUP BY ym ORDER BY ym
    `).all();
    const monthlyExpenses = db.prepare(`
        SELECT strftime('%Y-%m', expense_date) AS ym, SUM(amount) AS total
        FROM expenses
        WHERE expense_date >= date('now', '-5 months', 'start of month')
        GROUP BY ym ORDER BY ym
    `).all();

    const recentIncome = db.prepare(`
        SELECT income.*, clients.name AS client_name FROM income
        LEFT JOIN clients ON clients.id = income.client_id
        ORDER BY income.income_date DESC, income.id DESC LIMIT 8
    `).all();

    res.render('admin/dashboard', {
        pageTitle: 'Panel',
        totalIncome, totalExpenses, balance: totalIncome - totalExpenses,
        clientsCount, projectsCount, unreadMessages,
        monthly, monthlyExpenses, recentIncome,
    });
});

module.exports = router;
