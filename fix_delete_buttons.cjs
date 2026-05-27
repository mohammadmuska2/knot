const fs = require('fs');

// 1. Update api.ts
let apiContent = fs.readFileSync('src/frontend/src/utils/api.ts', 'utf8');
apiContent = apiContent.replace(
  'getAdminStats: () => request<ApiAdminStats>("/admin/stats"),',
  'getAdminStats: () => request<ApiAdminStats>("/admin/stats"),\n    deleteWorker: (id: bigint) => request<void>(`/users/${id}`, { method: "DELETE" }),\n    deleteCitizen: (id: bigint) => request<void>(`/citizens/${id}`, { method: "DELETE" }),'
);
fs.writeFileSync('src/frontend/src/utils/api.ts', apiContent);

// 2. Update users.js
let usersContent = fs.readFileSync('src/backend/routes/users.js', 'utf8');
const usersDeleteRoute = `
// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  const { readDB, writeDB } = require('../utils/db');
  const db = readDB();
  const id = parseInt(req.params.id, 10);
  db.users = db.users.filter(u => u.id !== id);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;`;
usersContent = usersContent.replace(/module\.exports = router;$/, usersDeleteRoute);
fs.writeFileSync('src/backend/routes/users.js', usersContent);

// 3. Update citizens.js
let citizensContent = fs.readFileSync('src/backend/routes/citizens.js', 'utf8');
const citizensDeleteRoute = `
// DELETE /api/citizens/:id
router.delete('/:id', (req, res) => {
  const { readDB, writeDB } = require('../utils/db');
  const db = readDB();
  const id = parseInt(req.params.id, 10);
  db.citizens = db.citizens.filter(c => c.id !== id);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;`;
citizensContent = citizensContent.replace(/module\.exports = router;$/, citizensDeleteRoute);
fs.writeFileSync('src/backend/routes/citizens.js', citizensContent);

// 4. Update AdminDashboardPage.tsx
let adminContent = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');
const handlers = `
  async function handleDeleteWorker(workerIdStr: string) {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;
    try {
      if (actor && actor.deleteWorker) {
        await actor.deleteWorker(BigInt(workerIdStr));
      }
    } catch (err) {}
    localStorage.removeItem(\`knot_worker_profile_\${workerIdStr}\`);
    localStorage.removeItem(\`knot_cert_status_\${workerIdStr}\`);
    localStorage.removeItem(\`knot_cert_\${workerIdStr}\`);
    localStorage.removeItem(\`knot_practical_submission_\${workerIdStr}\`);
    toast.success("Worker deleted");
    void refetchWorkers();
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  async function handleDeleteCitizen(citizenIdStr: string) {
    if (!window.confirm("Are you sure you want to delete this citizen?")) return;
    try {
      if (actor && actor.deleteCitizen) {
        await actor.deleteCitizen(BigInt(citizenIdStr));
      }
    } catch (err) {}
    localStorage.removeItem(\`knot_citizen_profile_\${citizenIdStr}\`);
    toast.success("Citizen deleted");
    void refetchCitizens();
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  function handleLogout() {`;

adminContent = adminContent.replace('  function handleLogout() {', handlers);
fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', adminContent);

console.log("Delete buttons implemented successfully!");
