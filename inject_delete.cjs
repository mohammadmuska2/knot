const fs = require('fs');
let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// 1. Inject functions
const funcInjection = `
  function handleDeleteWorker(workerIdStr: string) {
    if (!window.confirm("Are you sure you want to delete this worker? This will remove them from the local database.")) return;
    localStorage.removeItem(\`knot_worker_profile_\${workerIdStr}\`);
    localStorage.removeItem(\`knot_cert_\${workerIdStr}\`);
    localStorage.removeItem(\`knot_cert_status_\${workerIdStr}\`);
    localStorage.removeItem(\`knot_practical_submission_\${workerIdStr}\`);
    toast.success("Worker deleted locally.");
    void refetchWorkers();
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  function handleDeleteCitizen(citizenIdStr: string) {
    if (!window.confirm("Are you sure you want to delete this citizen? This will remove them from the local database.")) return;
    localStorage.removeItem(\`knot_citizen_profile_\${citizenIdStr}\`);
    toast.success("Citizen deleted locally.");
    void refetchCitizens();
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  function handleClearAllData() {`;

content = content.replace('  function handleClearAllData() {', funcInjection);

// 2. Add Actions column to Workers table
const workerHeaderSearch = `
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">
                            Contact
                          </TableHead>
                        </TableRow>`;
const workerHeaderReplace = `
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">
                            Contact
                          </TableHead>
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider text-right">
                            {t("admin_th_actions")}
                          </TableHead>
                        </TableRow>`;
content = content.replace(workerHeaderSearch, workerHeaderReplace);

const workerRowSearch = `
                            <TableCell className="text-slate-400 font-body text-xs">
                              {worker.contact || (
                                <span className="text-slate-600 italic">
                                  None
                                </span>
                              )}
                            </TableCell>
                          </TableRow>`;
const workerRowReplace = `
                            <TableCell className="text-slate-400 font-body text-xs">
                              {worker.contact || (
                                <span className="text-slate-600 italic">
                                  None
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWorker(worker.id.toString())}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                title="Delete Worker"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>`;
content = content.replace(workerRowSearch, workerRowReplace);

// 3. Add Actions column to Citizens table
const citizenHeaderSearch = `
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">
                            {t("admin_th_address")}
                          </TableHead>
                        </TableRow>`;
const citizenHeaderReplace = `
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">
                            {t("admin_th_address")}
                          </TableHead>
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider text-right">
                            {t("admin_th_actions")}
                          </TableHead>
                        </TableRow>`;
content = content.replace(citizenHeaderSearch, citizenHeaderReplace);

const citizenRowSearch = `
                            <TableCell className="text-slate-400 font-body text-sm">
                              {citizen.address}
                            </TableCell>
                          </TableRow>`;
const citizenRowReplace = `
                            <TableCell className="text-slate-400 font-body text-sm">
                              {citizen.address}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCitizen(citizen.id.toString())}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                title="Delete Citizen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>`;
content = content.replace(citizenRowSearch, citizenRowReplace);

// 4. Translate "Registered Workers" and "Registered Citizens"
content = content.replace('>Registered Workers<', '>{t("admin_tab_workers")}<');
content = content.replace('>Registered Citizens<', '>{t("admin_tab_citizens")}<');

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log('Delete functionality injected.');
