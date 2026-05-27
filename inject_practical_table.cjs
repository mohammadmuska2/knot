const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

const tableContent = `          {/* Worker Verification (Practical Approval) Table */}
          <TabsContent value="practical">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3 border-b border-slate-700">
                <CardTitle className="font-display text-base text-white">{t("admin_verifications_title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {practicalVideos.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-body text-sm">
                    {t("admin_verifications_empty")}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-transparent">
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">{t("admin_verifications_col_worker")}</TableHead>
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">{t("admin_verifications_col_submitted")}</TableHead>
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider text-right">{t("admin_verifications_col_actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {practicalVideos.map((sub, idx) => (
                          <TableRow key={sub.workerId.toString()} className="border-slate-700 hover:bg-slate-700/40 transition-colors">
                            <TableCell>
                              <p className="font-display font-medium text-white text-sm">{sub.workerName}</p>
                              <p className="font-body text-xs text-slate-400">{sub.skill}</p>
                            </TableCell>
                            <TableCell className="text-slate-400 font-body text-sm">
                              {formatTimestamp(sub.submittedAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20" onClick={() => {
                                  const newTab = window.open();
                                  if (newTab) {
                                    newTab.document.body.innerHTML = '<video controls autoplay style="width: 100%; height: 100vh; background: black;"><source src="' + sub.videoDataURI + '" /></video>';
                                    newTab.document.title = 'Worker Verification Video';
                                  }
                                }}>
                                  <Video className="w-4 h-4 mr-1" /> Watch
                                </Button>
                                <Button size="sm" variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" onClick={() => handleApprovePractical(sub.workerId)}>
                                  <Check className="w-4 h-4 mr-1" /> {t("admin_verifications_btn_approve")}
                                </Button>
                                <Button size="sm" variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" onClick={() => handleRejectPractical(sub.workerId)}>
                                  <X className="w-4 h-4 mr-1" /> {t("admin_verifications_btn_reject")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>`;

content = content.replace(/\{\/\* Practical Approval Tab \*\/\}\s*<\/Tabs>/, tableContent);

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log("Injected practical table successfully!");
