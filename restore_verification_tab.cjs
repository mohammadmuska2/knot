const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', 'utf8');

// Add the TabsTrigger
const triggerRegex = /<TabsTrigger\s*value="requests"\s*data-ocid="admin\.requests\.tab"[^>]*>[\s\S]*?<\/TabsTrigger>/;
const matchTrigger = content.match(triggerRegex);
if (matchTrigger) {
  const newTrigger = matchTrigger[0] + `
              <TabsTrigger
                value="practical"
                data-ocid="admin.practical.tab"
                className="font-body text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white 
text-slate-400 rounded-lg transition-all"
              >
                <Video className="w-4 h-4 mr-1.5" />
                Worker Verifications ({practicalVideos.length})
              </TabsTrigger>`;
  content = content.replace(matchTrigger[0], newTrigger);
}

// Add the TabsContent
const tabContentEndRegex = /<\/TabsContent>\s*<\/Tabs>\s*<\/div>\s*<\/main>/;
const newContent = `</TabsContent>

          {/* Worker Verification (Practical Approval) Table */}
          <TabsContent value="practical">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3 border-b border-slate-700">
                <CardTitle className="font-display text-base text-white">Pending Video Verifications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {practicalVideos.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-body text-sm">
                    No pending video verifications.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-transparent">
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">Worker</TableHead>
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider">Submitted</TableHead>
                          <TableHead className="text-slate-400 font-body text-xs uppercase tracking-wider text-right">Actions</TableHead>
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
                                <Button size="sm" variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" onClick={() => handleApprovePractical(sub.workerId)}>
                                  <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" onClick={() => handleRejectPractical(sub.workerId)}>
                                  <X className="w-4 h-4 mr-1" /> Reject
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
        </Tabs>
      </div>
    </main>`;

content = content.replace(tabContentEndRegex, newContent);

fs.writeFileSync('src/frontend/src/pages/AdminDashboardPage.tsx', content);
console.log("AdminDashboardPage updated with Verification tab!");
