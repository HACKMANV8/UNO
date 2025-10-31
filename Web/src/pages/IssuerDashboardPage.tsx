import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileCheck, History, Eye, Users, Key, Settings, Plus, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

export default function IssuerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'issuer_admin';
  const [selectedCredential, setSelectedCredential] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  
  // Staff management states
  const [staffMembers, setStaffMembers] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice.johnson@university.edu', role: 'issuer_staff', status: 'Active', joinDate: '2023-06-15' },
    { id: 2, name: 'Bob Smith', email: 'bob.smith@university.edu', role: 'issuer_staff', status: 'Active', joinDate: '2023-08-20' },
    { id: 3, name: 'Carol Davis', email: 'carol.davis@university.edu', role: 'issuer_staff', status: 'Inactive', joinDate: '2023-03-10' }
  ]);
  const [newStaffForm, setNewStaffForm] = useState({ name: '', email: '', role: 'issuer_staff' });
  
  // Key management states
  const [keys, setKeys] = useState([
    { id: 1, name: 'Primary Signing Key', type: 'RSA-2048', status: 'Active', created: '2023-01-15', expires: '2025-01-15' },
    { id: 2, name: 'Backup Key', type: 'RSA-2048', status: 'Inactive', created: '2023-01-15', expires: '2025-01-15' },
    { id: 3, name: 'Legacy Key', type: 'RSA-1024', status: 'Expired', created: '2022-01-15', expires: '2024-01-15' }
  ]);
  
  // System settings states
  const [settings, setSettings] = useState({
    institutionName: 'Tech University',
    contactEmail: 'admin@techuni.edu',
    maxCredentialsPerMonth: '1000',
    autoExpiry: '5',
    requireTwoFactor: true,
    allowBulkIssuance: true
  });

  // Mock history data
  const historyData = [
    {
      id: 'CRED-001',
      type: 'Academic Certificate',
      title: 'Bachelor of Computer Science',
      recipientName: 'John Doe',
      recipientEmail: 'john.doe@example.com',
      issuedDate: '2024-01-15',
      status: 'Active',
      issuer: 'Tech University',
      validUntil: '2029-01-15',
      skills: ['Programming', 'Database Management', 'Software Engineering']
    },
    {
      id: 'CRED-002',
      type: 'Professional Certification',
      title: 'Full Stack Developer Certificate',
      recipientName: 'Jane Smith',
      recipientEmail: 'jane.smith@example.com',
      issuedDate: '2024-01-10',
      status: 'Active',
      issuer: 'Tech University',
      validUntil: '2026-01-10',
      skills: ['React', 'Node.js', 'MongoDB', 'Express.js']
    },
    {
      id: 'CRED-003',
      type: 'Skill Verification',
      title: 'Advanced JavaScript Developer',
      recipientName: 'Mike Johnson',
      recipientEmail: 'mike.johnson@example.com',
      issuedDate: '2024-01-08',
      status: 'Active',
      issuer: 'Tech University',
      validUntil: '2025-01-08',
      skills: ['JavaScript', 'ES6+', 'Async Programming', 'DOM Manipulation']
    },
    {
      id: 'CRED-004',
      type: 'Training Completion',
      title: 'Data Science Bootcamp',
      recipientName: 'Sarah Wilson',
      recipientEmail: 'sarah.wilson@example.com',
      issuedDate: '2024-01-05',
      status: 'Revoked',
      issuer: 'Tech University',
      validUntil: '2026-01-05',
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'Pandas']
    }
  ];

  const hideAllSections = () => {
    setShowHistory(false);
    setShowStaffManagement(false);
    setShowKeyManagement(false);
    setShowSystemSettings(false);
  };

  const handleViewHistory = () => {
    if (showHistory) {
      setShowHistory(false);
    } else {
      hideAllSections();
      setShowHistory(true);
    }
  };

  const handleViewCredential = (credential: any) => {
    setSelectedCredential(credential);
  };

  const handleManageStaff = () => {
    if (showStaffManagement) {
      setShowStaffManagement(false);
    } else {
      hideAllSections();
      setShowStaffManagement(true);
    }
  };

  const handleKeyManagement = () => {
    if (showKeyManagement) {
      setShowKeyManagement(false);
    } else {
      hideAllSections();
      setShowKeyManagement(true);
    }
  };

  const handleSystemSettings = () => {
    if (showSystemSettings) {
      setShowSystemSettings(false);
    } else {
      hideAllSections();
      setShowSystemSettings(true);
    }
  };

  const handleAddStaff = () => {
    if (newStaffForm.name && newStaffForm.email) {
      const newStaff = {
        id: staffMembers.length + 1,
        ...newStaffForm,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setStaffMembers([...staffMembers, newStaff]);
      setNewStaffForm({ name: '', email: '', role: 'issuer_staff' });
    }
  };

  const handleRemoveStaff = (id: number) => {
    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
  };

  const handleToggleStaffStatus = (id: number) => {
    setStaffMembers(staffMembers.map(staff => 
      staff.id === id 
        ? { ...staff, status: staff.status === 'Active' ? 'Inactive' : 'Active' }
        : staff
    ));
  };

  const handleRevokeKey = (id: number) => {
    setKeys(keys.map(key => 
      key.id === id 
        ? { ...key, status: 'Revoked' }
        : key
    ));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Settings saved:', settings);
    // Settings saved successfully - could show a toast notification here
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 sm:p-8 rounded-2xl border-primary/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Manage credentials and staff' : 'Issue and manage credentials'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +12 this month
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Credentials</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">115</div>
            <p className="text-xs text-muted-foreground">
              12 pending verification
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Last revoked 15 days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for credential management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-1'} gap-4`}>
            <Button 
              variant={showHistory ? "default" : "outline"} 
              className="w-full" 
              onClick={handleViewHistory}
            >
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide History" : "View History"}
            </Button>
            {isAdmin && (
              <>
                <Button 
                  variant={showStaffManagement ? "default" : "outline"} 
                  className="w-full" 
                  onClick={handleManageStaff}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {showStaffManagement ? "Hide Staff" : "Manage Staff"}
                </Button>
                <Button 
                  variant={showKeyManagement ? "default" : "outline"} 
                  className="w-full" 
                  onClick={handleKeyManagement}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {showKeyManagement ? "Hide Keys" : "Key Management"}
                </Button>
                <Button 
                  variant={showSystemSettings ? "default" : "outline"} 
                  className="w-full" 
                  onClick={handleSystemSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showSystemSettings ? "Hide Settings" : "System Settings"}
                </Button>
              </>
            )}
          </div>

          {/* History Section - Shows when View History is clicked */}
          {showHistory && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center space-x-2 mb-4">
                <History className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Credential History</h3>
              </div>
              <div className="space-y-3">
                {historyData.map((credential) => (
                  <Card key={credential.id} className="border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={credential.status === 'Active' ? 'default' : 'destructive'}>
                              {credential.status}
                            </Badge>
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {credential.id}
                            </span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{credential.type}</span>
                          </div>
                          <h4 className="font-semibold mb-1">{credential.title}</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Issued to: {credential.recipientName} ({credential.recipientEmail})</p>
                            <p>
                              Issued: {new Date(credential.issuedDate).toLocaleDateString()} • 
                              Valid until: {new Date(credential.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {credential.skills.slice(0, 3).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {credential.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{credential.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewCredential(credential)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Staff Management Section */}
          {showStaffManagement && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Staff Management</h3>
              </div>
              <div className="space-y-6">
                {/* Add New Staff */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Staff Member</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="staff-name">Name</Label>
                        <Input
                          id="staff-name"
                          value={newStaffForm.name}
                          onChange={(e) => setNewStaffForm({...newStaffForm, name: e.target.value})}
                          placeholder="Enter staff name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="staff-email">Email</Label>
                        <Input
                          id="staff-email"
                          type="email"
                          value={newStaffForm.email}
                          onChange={(e) => setNewStaffForm({...newStaffForm, email: e.target.value})}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="staff-role">Role</Label>
                        <Select value={newStaffForm.role} onValueChange={(value) => setNewStaffForm({...newStaffForm, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="issuer_staff">Staff Member</SelectItem>
                            <SelectItem value="issuer_admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddStaff} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff Member
                    </Button>
                  </CardContent>
                </Card>

                {/* Staff List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Staff Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Join Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffMembers.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell className="font-medium">{staff.name}</TableCell>
                            <TableCell>{staff.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {staff.role === 'issuer_admin' ? 'Administrator' : 'Staff Member'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={staff.status === 'Active' ? 'default' : 'secondary'}>
                                {staff.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(staff.joinDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleStaffStatus(staff.id)}
                                >
                                  {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveStaff(staff.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Key Management Section */}
          {showKeyManagement && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center space-x-2 mb-4">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Key Management</h3>
              </div>
              <div className="space-y-6">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Cryptographic keys are used to sign and verify credentials. Handle with extreme care.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cryptographic Keys</CardTitle>
                    <CardDescription>
                      Manage signing keys for credential issuance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {keys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell className="font-medium">{key.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{key.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                key.status === 'Active' ? 'default' : 
                                key.status === 'Inactive' ? 'secondary' : 'destructive'
                              }>
                                {key.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(key.created).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(key.expires).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {key.status === 'Active' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRevokeKey(key.id)}
                                  >
                                    Revoke
                                  </Button>
                                )}
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button variant="premium" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Key
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* System Settings Section */}
          {showSystemSettings && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">System Settings</h3>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Institution Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="institution-name">Institution Name</Label>
                      <Input
                        id="institution-name"
                        value={settings.institutionName}
                        onChange={(e) => setSettings({...settings, institutionName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credential Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="max-credentials">Max Credentials Per Month</Label>
                      <Input
                        id="max-credentials"
                        type="number"
                        value={settings.maxCredentialsPerMonth}
                        onChange={(e) => setSettings({...settings, maxCredentialsPerMonth: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="auto-expiry">Default Expiry (Years)</Label>
                      <Input
                        id="auto-expiry"
                        type="number"
                        value={settings.autoExpiry}
                        onChange={(e) => setSettings({...settings, autoExpiry: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="two-factor">Require Two-Factor Authentication</Label>
                      <Button
                        variant={settings.requireTwoFactor ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({...settings, requireTwoFactor: !settings.requireTwoFactor})}
                      >
                        {settings.requireTwoFactor ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bulk-issuance">Allow Bulk Credential Issuance</Label>
                      <Button
                        variant={settings.allowBulkIssuance ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings({...settings, allowBulkIssuance: !settings.allowBulkIssuance})}
                      >
                        {settings.allowBulkIssuance ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowSystemSettings(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity - Only show when no sections are active */}
      {!showHistory && !showStaffManagement && !showKeyManagement && !showSystemSettings && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest credential issuance and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                  <div>
                    <p className="font-medium">Bachelor of Technology Issued</p>
                    <p className="text-sm text-muted-foreground">To: John Doe • {i} days ago</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleViewCredential({
                    id: `CRED-00${i}`,
                    type: 'Academic Certificate',
                    title: 'Bachelor of Technology',
                    recipientName: 'John Doe',
                    recipientEmail: 'john.doe@example.com',
                    issuedDate: `2024-01-${15 + i}`,
                    status: 'Active',
                    issuer: 'Tech University',
                    validUntil: `2029-01-${15 + i}`,
                    skills: ['Programming', 'Database Management', 'Software Engineering']
                  })}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credential Details Dialog - Single close button */}
      <Dialog open={!!selectedCredential} onOpenChange={() => setSelectedCredential(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Credential Details</DialogTitle>
          </DialogHeader>
          {selectedCredential && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Credential ID</h4>
                  <p className="font-mono text-sm">{selectedCredential.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                  <Badge variant={selectedCredential.status === 'Active' ? 'default' : 'destructive'}>
                    {selectedCredential.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Title</h4>
                <p className="text-lg font-semibold">{selectedCredential.title}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Type</h4>
                <p>{selectedCredential.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Recipient Name</h4>
                  <p>{selectedCredential.recipientName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Recipient Email</h4>
                  <p>{selectedCredential.recipientEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Issued Date</h4>
                  <p>{new Date(selectedCredential.issuedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Valid Until</h4>
                  <p>{new Date(selectedCredential.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Issuer</h4>
                <p>{selectedCredential.issuer}</p>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Associated Skills</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCredential.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1">
                  Download Certificate
                </Button>
                <Button variant="outline" className="flex-1">
                  Send Copy
                </Button>
                {selectedCredential.status === 'Active' && (
                  <Button variant="destructive" className="flex-1">
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
